import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import { getBudget } from "../../lib/services/budget";
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
