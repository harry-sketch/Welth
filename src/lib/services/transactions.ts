import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryKey } from "../../constants/categories";

export type TTransactionType = "INCOME" | "EXPENSE";
export type TInputMethodType = "MANUAL" | "VOICE" | "RECEIPT_SCAN";

export interface ITransactions {
  id: string;
  user_id: string;
  account_id: string;
  type: TTransactionType;
  amount: number;
  category: CategoryKey;
  description: string | null;
  date: string;
  status: string;
  input_method: TInputMethodType;
  voice_transcript: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface IGetTxnProps {
  client: SupabaseClient;
  userId?: string;
}

export const getTransactions = async ({
  client,
  userId,
}: IGetTxnProps): Promise<ITransactions[]> => {
  const { data, error } = await client
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;

  return data as ITransactions[];
};
