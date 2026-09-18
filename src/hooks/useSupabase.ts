import { useAuth } from "@clerk/expo";
import { useMemo } from "react";
import { createClientWithClerk } from "../utils/supabase";

export const useSupabase = () => {
  const { getToken } = useAuth();

  // biome-ignore lint/correctness/useExhaustiveDependencies: getToken is intentionally captured once
  const client = useMemo(() => createClientWithClerk(() => getToken()), []);

  return client;
};
