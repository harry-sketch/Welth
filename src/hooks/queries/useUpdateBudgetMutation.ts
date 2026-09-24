import { useUser } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertBudget } from "../../lib/services/budget";
import { useSupabase } from "../useSupabase";

export const useUpdateBudgetMutation = () => {
  const { user } = useUser();

  const client = useSupabase();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount }: { amount: number }) =>
      upsertBudget({ amount, userId: user?.id, client }),
    onError: (error) => {
      console.log(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budget"],
      });
    },
  });
};
