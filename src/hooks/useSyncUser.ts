// This Hooks check the user in the db, if not creates a user in the db,sets data in the zustand and then create an account for that user

import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { userStore } from "../store/userStore";
import { useSupabase } from "./useSupabase";

export const useSyncUser = () => {
  const { user } = useUser();

  const supabaseClient = useSupabase();

  const setCurrency = userStore((state) => state.setCurrency);

  const setNeedsOnBoarding = userStore((state) => state.setNeedsOnBoarding);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!user) return;

    const { firstName, lastName, imageUrl, fullName } = user;

    const syncUser = async () => {
      try {
        // Check Existing USer if exists then set the data in zustand, if not create a new User and set the data in zustand
        const { data: existingUser, error: fetchError } = await supabaseClient
          .from("users")
          .select("clerk_id,currency")
          .eq("clerk_id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.log(
            "Error in fetching existing user or no existing user found",
            fetchError,
          );
          setNeedsOnBoarding(true);
          return;
        }

        if (existingUser) {
          setCurrency(existingUser.currency ?? "INR");
          setNeedsOnBoarding(!existingUser.currency);
          return;
        }

        const userEmail = user.emailAddresses[0]?.emailAddress ?? "";

        // Create a new user with email
        const { data: newUser, error: newUserError } = await supabaseClient
          .from("users")
          .upsert(
            {
              clerk_id: user?.id,
              email: userEmail,
              name: `${firstName} ${lastName}`,
              image_url: imageUrl,
            },
            {
              onConflict: "clerk_id",
              ignoreDuplicates: false,
            },
          )
          .select("currency")
          .single();

        if (newUserError) {
          console.log("Error in fetching new user", newUserError);
          setNeedsOnBoarding(true);
          return;
        }

        if (newUser) {
          setCurrency(newUser.currency ?? "INR");
          setNeedsOnBoarding(!newUser.currency);
        }

        // Create a new Account for that user also
        const { error: accountError } = await supabaseClient
          .from("accounts")
          .insert({
            user_id: user?.id,
            name: fullName,
            type: "CASH",
            balance: 0,
            is_default: true,
          });

        if (accountError) {
          console.log("Error in crreating new account", accountError);
          setNeedsOnBoarding(true);
          return;
        }
      } catch (error) {
        console.log("Error from hook userUSerSync()", { error });
        setNeedsOnBoarding(true);
      }
    };

    syncUser();
  }, [user?.id]);

  return null;
};
