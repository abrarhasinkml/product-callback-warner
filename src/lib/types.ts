export interface MatchWarning {
  product_name: string;
  manufacturer: string | null;
  grund: string;
  lot_numbers: string[] | null;
  affected_states: string[] | null;
  source_url: string;
}

export interface Match {
  product_id: string;
  warning: MatchWarning;
  match_score: number;
  urgency_tier: string;
  risk_text: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface CheckResult {
  products: Product[];
  matches: Match[];
}
