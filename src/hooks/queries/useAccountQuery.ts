import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import { getAccounts } from "../../lib/services/account";
import { useSupabase } from "../useSupabase";

export const useAccountQuery = () => {
  const { user } = useUser();
  const supabaseClient = useSupabase();

  return useQuery({
    queryKey: queryKeys.accounts(user?.id),
    queryFn: () => getAccounts({ client: supabaseClient, userId: user?.id }),
    enabled: Boolean(user),
  });
};
