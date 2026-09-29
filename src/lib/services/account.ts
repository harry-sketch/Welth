import type { SupabaseClient } from "@supabase/supabase-js";

export type TAccountType = "CASH" | "BANK" | "CREDIT_CARD" | "SAVINGS";

export interface IAccount {
  id: string;
  user_id: string;
  name: string;
  type: TAccountType;
  balance: number;
  is_default: boolean;
  created_at: string;
}

export interface IGetAccProps {
  client: SupabaseClient;
  userId?: string;
}

export const getAccounts = async ({
  client,
  userId,
}: IGetAccProps): Promise<IAccount[]> => {
  const { data, error } = await client
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data as IAccount[];
};

export const createAccount = async (
  client: SupabaseClient,
  userId: string,
  name: string,
  type: TAccountType,
) => {
  try {
    const { data, error } = await client
      .from("accounts")
      .insert({
        user_id: userId,
        name,
        type,
        balance: 0,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      return error;
    }

    return data as IAccount;
  } catch (error) {
    console.log({ error });
  }
};
