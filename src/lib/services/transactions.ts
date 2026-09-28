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

export interface ICreateTxns {
  user_id: string;
  account_id: string;
  amount: number;
  date: string;
  category: CategoryKey;
  type: TTransactionType;
  input_method: TInputMethodType;
  description: string | null;
  voice_transcript: string | null;
}

interface IGetTxnProps {
  client: SupabaseClient;
  userId?: string;
}

export interface IDeleteTxnPorps {
  client: SupabaseClient;
  accountId: string;
  amount: number;
  txnId: string;
  type: TTransactionType;
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

export const deleteTxn = async ({
  client,
  txnId,
  accountId,
  type,
  amount,
}: IDeleteTxnPorps) => {
  const { error: deleteError } = await client
    .from("transactions")
    .delete()
    .eq("id", txnId);

  if (deleteError) {
    return { error: deleteError };
  }

  const { data: accountData, error: fetchError } = await client
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();

  if (fetchError) {
    return { error: fetchError };
  }

  const diffAmt = type === "INCOME" ? -amount : amount;

  const { error: updateError } = await client
    .from("accounts")
    .update({
      balance: accountData.balance + diffAmt,
    })
    .eq("id", accountId);

  if (updateError) {
    return { error: updateError };
  }

  return { error: null };
};

export const createTransaction = async (
  client: SupabaseClient,
  payload: ICreateTxns,
) => {
  try {
    const { data: transaction, error } = await client
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { transaction: null, error };
    }

    const { data: accountData, error: fetchError } = await client
      .from("accounts")
      .select("balance")
      .eq("id", payload.account_id)
      .single();

    if (fetchError) {
      return { transaction, error: fetchError };
    }

    const diffAmt =
      payload.type === "INCOME" ? payload.amount : -payload.amount;

    const { error: updateError } = await client
      .from("accounts")
      .update({
        balance: accountData.balance + diffAmt,
      })
      .eq("id", payload.account_id);

    if (updateError) {
      return { transaction, error: updateError };
    }

    return { transaction, error: null };
  } catch (error) {
    console.log({ error });
  }
};
