import type { SupabaseClient } from "@supabase/supabase-js";

export interface IBudget {
  id: string;
  user_id: string;
  amount: string;
  last_alert_send: string | null;
  last_alert_threshold: string;
  created_at: string;
  updated_at: string;
}

interface IGetBudgetProps {
  client: SupabaseClient;
  userId?: string;
}

interface IUpsertBudgetProps {
  client: SupabaseClient;
  userId?: string;
  amount: number;
}

export const getBudget = async ({
  client,
  userId,
}: IGetBudgetProps): Promise<IBudget> => {
  const { data, error } = await client
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as IBudget;
};

export const upsertBudget = async ({
  amount,
  client,
  userId,
}: IUpsertBudgetProps): Promise<IBudget> => {
  const { data, error } = await client
    .from("budgets")
    .upsert(
      {
        user_id: userId,
        amount,
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single();

  if (error) throw error;

  return data as IBudget;
};
