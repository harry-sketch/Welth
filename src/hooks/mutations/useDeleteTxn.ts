import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteTxn,
  type IDeleteTxnPorps,
} from "../../lib/services/transactions";
import { useSupabase } from "../useSupabase";

export const useDeleteTxn = () => {
  const client = useSupabase();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IDeleteTxnPorps, "client">) =>
      deleteTxn({
        client,
        accountId: data.accountId,
        amount: data.amount,
        txnId: data.txnId,
        type: data.type,
      }),
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
