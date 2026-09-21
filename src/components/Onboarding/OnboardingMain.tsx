import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { lazy, useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "../../hooks/useSupabase";
import {
  createOnboardingSchema,
  type TOnboardingType,
} from "../../lib/onboarding";
import { userStore } from "../../store/userStore";
import { ALL_CURRIENCIES, type TCurrencyCodeType } from "./CurrencyPicker";

const CurrencyPicker = lazy(() => import("./CurrencyPicker"));

export const OnboardingMain = () => {
  const { user } = useUser();

  const router = useRouter();

  const setNeedsOnboarding = userStore((state) => state.setNeedsOnBoarding);

  const [isSaving, setIsSaving] = useState(false);

  const supabaseClient = useSupabase();

  const inrCur = useMemo(
    () =>
      ALL_CURRIENCIES.find(({ code }) => code === "INR") ?? ALL_CURRIENCIES[0],
    [],
  );

  const [selectedCurrency, setSelectedCurrency] =
    useState<TCurrencyCodeType>(inrCur);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Condition
  const selectedCode = selectedCurrency.code;

  const { control, handleSubmit } = useForm<TOnboardingType>({
    resolver: zodResolver(createOnboardingSchema),
    mode: "onBlur",
    defaultValues: {
      balance: "",
    },
  });

  // Handlers
  const handleSelectCurrency = useCallback((curr: TCurrencyCodeType) => {
    setSelectedCurrency(curr);
  }, []);

  const handlePicker = () => setIsPickerOpen((prev) => !prev);

  const handlePickerClose = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  const handleGetStarted = async (balance: TOnboardingType) => {
    try {
      if (!user) return;

      const parsedBalance = parseFloat(balance.balance);

      setIsSaving(true);

      const { data: currencyData, error: currencyError } = await supabaseClient
        .from("users")
        .update({
          currency: selectedCode,
        })
        .eq("clerk_id", user.id)
        .single();

      if (currencyError && !currencyData) {
        console.log(
          "Error in fetching updating currency data in user ",
          +" " + user?.id,
          currencyError,
        );
        setIsSaving(false);
        return;
      }

      const { data: defaultAccount, error: defaultAccError } =
        await supabaseClient
          .from("accounts")
          .select("id,balance")
          .eq("user_id", user.id)
          .eq("is)_default", true)
          .single();

      if (defaultAccError && !defaultAccount) {
        console.log(
          `Error in fetching default account of user id ${user.id}`,
          defaultAccError,
        );
        setIsSaving(false);
        return;
      }

      const { error: transactionError } = await supabaseClient
        .from("transactions")
        .insert({
          user_id: user.id,
          account_id: defaultAccount.id,
          type: "INCOME",
          amount: parsedBalance,
          category: "other_income",
          description: "First_Onboarding_Payment",
          date: new Date().toISOString(),
          input_method: "MANUAL",
        });

      if (transactionError) {
        console.log(
          `Error in creating a new transaction of user id ${user.id} with account-id ${defaultAccount.id}`,
          transactionError,
        );
        setIsSaving(false);
        return;
      }

      const { error: accountUpdateError } = await supabaseClient
        .from("accounts")
        .update({
          balance: defaultAccount.balance + parsedBalance,
        })
        .eq("user_id", user.id)
        .single();

      setIsSaving(false);

      if (accountUpdateError) {
        console.log(
          `Error in updating balance of user id ${user.id} with account-id ${defaultAccount.id}`,
          accountUpdateError,
        );
        setIsSaving(false);
        return;
      }

      setNeedsOnboarding(false);
      router.push("/(root)/(tabs)");
    } catch (error) {
      console.log({ error });
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-body w-full p-4" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1  bg-body justify-center w-full"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="w-full">
          <Image
            source={require("@/assets/images/welth-light.png")}
            className="w-72 h-36 mx-auto"
            resizeMode="contain"
          />

          <Text className="text-zinc-200 text-center text-2xl mb-0.5">
            Let's get you set up!
          </Text>

          <Text className="text-zinc-200 text-center mb-8 text-base font-normal">
            A couple of quick details to personalize your experience.
          </Text>

          <Text className="text-mutedText mb-1 text-sm font-normal">
            Starting balance
          </Text>

          <View className="bg-inputBg border border-white/10 rounded-lg flex flex-row items-center justify-start px-2 py-1 gap-2 mb-2 w-full">
            <Text className="text-mutedText mb-1 text-sm font-normal">
              {selectedCurrency.symbol}
            </Text>

            <Controller
              control={control}
              name="balance"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={(v) => {
                    onChange(v);
                  }}
                  className="text-white flex items-center w-full p-1.5 justify-center text-base font-medium text-start mb-2"
                  placeholderTextColor="#A5A5A5"
                  placeholder="e.g. 50000"
                  autoCapitalize="none"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              )}
            />
          </View>

          <Text className="text-mutedText mb-1 text-sm font-normal">
            Currency
          </Text>

          <TouchableOpacity
            onPress={handlePicker}
            className="flex flex-row items-center justify-between w-full mb-2.5 border border-white/10 rounded-lg p-3.5 bg-inputBg"
          >
            <Text className="text-mutedText mb-1 text-sm font-normal">
              {selectedCurrency.symbol} {selectedCurrency.code}-{" "}
              {selectedCurrency.name}
            </Text>

            <Feather name="chevron-down" size={16} color="#8A8D96" />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSaving}
            className="bg-primary px-3 py-4 rounded-lg mt-4"
            onPress={handleSubmit(handleGetStarted)}
          >
            <Text className="text-center text-white text-xl font-medium">
              {isSaving ? "Saving..." : "Get Started"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CurrencyPicker
        isVisible={isPickerOpen}
        selectedCode={selectedCode}
        onClose={handlePickerClose}
        handleSelectCurrency={handleSelectCurrency}
      />
    </SafeAreaView>
  );
};
