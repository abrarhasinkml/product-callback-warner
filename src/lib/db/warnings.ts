import { query, queryOne } from "./index";

export interface Warning {
  id: string;
  source_url: string;
  product_name: string;
  manufacturer: string | null;
  lot_numbers: string[] | null;
  grund: string;
  risk_description: string | null;
  affected_states: string[] | null;
  published_at: Date | null;
  updated_at: Date | null;
  urgency_tier: string | null;
  created_at: Date;
  updated_at_db: Date;
}

export interface CreateWarningInput {
  source_url: string;
  product_name: string;
  manufacturer?: string | null;
  lot_numbers?: string[] | null;
  grund: string;
  risk_description?: string | null;
  affected_states?: string[] | null;
  published_at?: string | null;
  updated_at?: string | null;
  urgency_tier?: string | null;
}

export async function createWarning(input: CreateWarningInput): Promise<Warning> {
  const result = await queryOne<Warning>(
    `INSERT INTO warnings (
      source_url, product_name, manufacturer, lot_numbers, grund,
      risk_description, affected_states, published_at, updated_at, urgency_tier
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (source_url) DO UPDATE SET
      product_name = EXCLUDED.product_name,
      manufacturer = EXCLUDED.manufacturer,
      lot_numbers = EXCLUDED.lot_numbers,
      grund = EXCLUDED.grund,
      risk_description = EXCLUDED.risk_description,
      affected_states = EXCLUDED.affected_states,
      published_at = EXCLUDED.published_at,
      updated_at = EXCLUDED.updated_at,
      urgency_tier = EXCLUDED.urgency_tier,
      updated_at_db = NOW()
    RETURNING *`,
    [
      input.source_url,
      input.product_name,
      input.manufacturer ?? null,
      input.lot_numbers ?? null,
      input.grund,
      input.risk_description ?? null,
      input.affected_states ?? null,
      input.published_at ?? null,
      input.updated_at ?? null,
      input.urgency_tier ?? null,
    ]
  );
  if (!result) throw new Error("Failed to create warning");
  return result;
}

export async function getWarnings(): Promise<Warning[]> {
  return query<Warning>("SELECT * FROM warnings ORDER BY published_at DESC");
}

export async function getWarningById(id: string): Promise<Warning | null> {
  return queryOne<Warning>("SELECT * FROM warnings WHERE id = $1", [id]);
}

export async function searchWarnings(
  productName: string,
  manufacturer?: string | null,
  lotNumber?: string | null
): Promise<Warning[]> {
  let sql = "SELECT * FROM warnings WHERE product_name ILIKE $1";
  const params: unknown[] = [`%${productName}%`];

  if (manufacturer) {
    sql += " AND manufacturer ILIKE $2";
    params.push(`%${manufacturer}%`);
  }

  if (lotNumber) {
    sql += ` AND $${params.length + 1} = ANY(lot_numbers)`;
    params.push(lotNumber);
  }

  sql += " ORDER BY published_at DESC";

  return query<Warning>(sql, params);
}
