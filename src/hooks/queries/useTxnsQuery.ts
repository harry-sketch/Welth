import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import { getTransactions } from "../../lib/services/transactions";
import { useSupabase } from "../useSupabase";

export const useTxnsQuery = () => {
  const { user } = useUser();

  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.transactions(user?.id),
    queryFn: () => getTransactions({ client, userId: user?.id }),
    enabled: !!user,
  });
};
