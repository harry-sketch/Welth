import { useUser } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  type ICreateTxns,
} from "../../lib/services/transactions";
import { useSupabase } from "../useSupabase";

export const useCreateTxn = () => {
  const { user } = useUser();

  const client = useSupabase();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<ICreateTxns, "user_id">) =>
      createTransaction(client, { ...payload, user_id: user?.id ?? "" }),
    onError: (error) => console.log({ error }),
    onSuccess: (result) => {
      if (result?.error) return;

      queryClient.invalidateQueries({
        queryKey: ["transaction"],
      });
      queryClient.invalidateQueries({
        queryKey: ["account"],
      });
    },
  });
};
