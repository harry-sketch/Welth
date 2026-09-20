import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing env variables for supase");
}

export const createClientWithClerk = (
  getToken: () => Promise<string | null>,
) => {
  return createClient(supabaseKey, supabaseUrl, {
    async accessToken() {
      return await getToken();
    },
  });
};
