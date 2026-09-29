import { useUser } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAccount, type IAccount } from "../../lib/services/account";
import { useSupabase } from "../useSupabase";

export const useCreateAccount = () => {
  const { user } = useUser();

  const client = useSupabase();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<IAccount, "name" | "type">) =>
      createAccount(client, user?.id ?? "", payload.name, payload.type),
    onError: (error) => console.log({ error }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["account"],
      });
    },
  });
};
