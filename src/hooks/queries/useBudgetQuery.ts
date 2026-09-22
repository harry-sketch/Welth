import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import { getBudget, upsertBudget } from "../../lib/services/budget";
import { useSupabase } from "../useSupabase";

export const useGetBudgetQuery = () => {
  const { user } = useUser();

  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.budgets(user?.id),
    queryFn: () => getBudget({ client, userId: user?.id }),
    enabled: !!user,
  });
};

export const useUpdateBudgetQuery = (amt: number) => {
  const { user } = useUser();

  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.budgets(user?.id),
    queryFn: () => upsertBudget({ client, userId: user?.id, amount: amt }),
    enabled: !!user,
  });
};
