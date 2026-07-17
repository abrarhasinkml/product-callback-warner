import { query, queryOne } from "./index";

export interface Receipt {
  id: string;
  image_path: string;
  raw_ocr_text: string | null;
  created_at: Date;
}

export interface Product {
  id: string;
  receipt_id: string | null;
  name: string;
  manufacturer: string | null;
  lot_number: string | null;
  created_at: Date;
}

export interface Match {
  id: string;
  product_id: string;
  warning_id: string;
  match_score: number;
  urgency_tier: string;
  risk_text: string | null;
  created_at: Date;
}

export interface CreateReceiptInput {
  image_path: string;
  raw_ocr_text?: string | null;
}

export interface CreateProductInput {
  receipt_id?: string | null;
  name: string;
  manufacturer?: string | null;
  lot_number?: string | null;
}

export interface CreateMatchInput {
  product_id: string;
  warning_id: string;
  match_score: number;
  urgency_tier: string;
  risk_text?: string | null;
}

export async function createReceipt(input: CreateReceiptInput): Promise<Receipt> {
  const result = await queryOne<Receipt>(
    `INSERT INTO receipts (image_path, raw_ocr_text)
     VALUES ($1, $2)
     RETURNING *`,
    [input.image_path, input.raw_ocr_text ?? null]
  );
  if (!result) throw new Error("Failed to create receipt");
  return result;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const result = await queryOne<Product>(
    `INSERT INTO products (receipt_id, name, manufacturer, lot_number)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      input.receipt_id ?? null,
      input.name,
      input.manufacturer ?? null,
      input.lot_number ?? null,
    ]
  );
  if (!result) throw new Error("Failed to create product");
  return result;
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const result = await queryOne<Match>(
    `INSERT INTO matches (product_id, warning_id, match_score, urgency_tier, risk_text)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (product_id, warning_id) DO UPDATE SET
       match_score = EXCLUDED.match_score,
       urgency_tier = EXCLUDED.urgency_tier,
       risk_text = EXCLUDED.risk_text
     RETURNING *`,
    [
      input.product_id,
      input.warning_id,
      input.match_score,
      input.urgency_tier,
      input.risk_text ?? null,
    ]
  );
  if (!result) throw new Error("Failed to create match");
  return result;
}

export async function getProductsByReceiptId(
  receiptId: string
): Promise<Product[]> {
  return query<Product>("SELECT * FROM products WHERE receipt_id = $1", [
    receiptId,
  ]);
}

export async function getProductById(id: string): Promise<Product | null> {
  return queryOne<Product>("SELECT * FROM products WHERE id = $1", [id]);
}

export async function getMatchesByProductId(
  productId: string
): Promise<Match[]> {
  return query<Match>("SELECT * FROM matches WHERE product_id = $1", [
    productId,
  ]);
}
