import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type CategoryKey,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../constants/categories";
import { useCreateTxn } from "../../hooks/mutations/useCreateTxn";
import { useAccountQuery } from "../../hooks/queries/useAccountQuery";
import type { IAccount } from "../../lib/services/account";
import {
  type ExtractedTransaction,
  extractTxnsFromReceipt,
} from "../../lib/services/extractTransaction";
import type { TInputMethodType } from "../../lib/services/transactions";
import {
  createTransactionSchema,
  type TCreateTransactionType,
} from "../../lib/transaction";
import { AiActionCard } from "./AiActionCard";
import { CalendarPicker } from "./CalendarPicker";
import { ReceiptModal } from "./ReceiptModal";
import { VoiceModal } from "./VoiceModal";

const TYPE_OPTIONS = [
  { key: "EXPENSE" as const, label: "Expense" },
  { key: "INCOME" as const, label: "Income" },
];

const DEFAULT_VALUES = (accounts: IAccount[]): TCreateTransactionType => ({
  type: "EXPENSE",
  amount: "",
  category: "food",
  accountId: accounts[0]?.id ?? "",
  description: "",
  date: new Date(),
});

interface Props {
  params?: string;
}

export const AddTransactionPage = ({ params }: Props) => {
  const router = useRouter();
  const [scanning, setScanning] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isDatePickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>("");
  const [inputMethod, setInputMethod] = useState<TInputMethodType>("MANUAL");

  const {
    data: accountData = [],
    error: accountError,
    isError: isAccountError,
    isLoading: isAccountLoading,
  } = useAccountQuery();

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset: resetForm,
  } = useForm<TCreateTransactionType>({
    mode: "onBlur",
    resolver: zodResolver(createTransactionSchema),
    defaultValues: DEFAULT_VALUES([]),
  });

  const date = watch("date");
  const type = watch("type");

  const { mutateAsync, isPending } = useCreateTxn();

  const applyExtraction = (result: ExtractedTransaction) => {
    try {
      const categoryType =
        result.type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

      const isValidCategory = (key: CategoryKey | null): key is CategoryKey =>
        !!key && categoryType.some((c) => c.key === key);

      if (result.type) setValue("type", result.type);

      if (result.amount !== null) setValue("amount", String(result.amount));

      if (isValidCategory(result.category))
        setValue("category", result.category);

      if (result.description) setValue("description", result.description);

      if (result.date) {
        const parsedDate = new Date(result.date);

        if (isValid(parsedDate) && parsedDate <= new Date())
          setValue("date", parsedDate);
      }

      const missing = [
        result.amount === null && "amount",
        isValidCategory(result.category) && "category",
      ].filter(Boolean);

      if (missing.length > 0) {
        Alert.alert(
          "Review before saving",
          `Couldn't confidently read the ${missing.join(" and ")}. Please fill it in.`,
        );
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handleCapture = async (base64: string, mimiType: string) => {
    setScanning(true);
    setIsScannerOpen(false);
    try {
      const extractedData = await extractTxnsFromReceipt(base64, mimiType);

      applyExtraction(extractedData);

      setInputMethod("RECEIPT_SCAN");
      setScanning(false);
    } catch (error) {
      console.log({ error });
      setScanning(false);
    }
  };

  const handleVoice = async (result: ExtractedTransaction) => {
    try {
      applyExtraction(result);
      setVoiceTranscript(result.transcript);
      setInputMethod("VOICE");
    } catch (error) {
      console.log({ error });
    }
  };

  const handleSaveTxn = async (values: TCreateTransactionType) => {
    try {
      const parsed = parseFloat(values.amount.replace(/,/g, ""));

      await mutateAsync({
        account_id: values.accountId,
        amount: parsed,
        category: values.category,
        date: values.date.toISOString(),
        description: values.description ?? "",
        input_method: inputMethod,
        type: values.type,
        voice_transcript: inputMethod === "VOICE" ? voiceTranscript : null,
      });

      resetForm(DEFAULT_VALUES(accountData));
      setInputMethod("MANUAL");
      setVoiceTranscript(null);

      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/transaction");
      }
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    if (accountData.length > 0) resetForm(DEFAULT_VALUES(accountData));
  }, [accountData, resetForm]);

  useEffect(() => {
    if (params === "scan") {
      setIsScannerOpen(true);
      router.setParams({ action: null });
    } else if (params === "voice") {
      setIsVoiceModalOpen(true);
      router.setParams({ action: null });
    }
  }, [params, router.setParams]);

  return (
    <SafeAreaView className="bg-body flex-1 px-2" edges={["top"]}>
      <Text className="text-zinc-100 font-bold text-2xl">Add transaction</Text>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isAccountLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator color="#fff" />
          </View>
        ) : isAccountError || accountError ? (
          <View className="flex-1 items-center justify-center px-10">
            <Feather name="alert-circle" size={32} color="#fb7185" />
            <Text className="text-mutedText text-sm mt-3 text-center">
              Couldn&apos;t load your accounts.
            </Text>
          </View>
        ) : accountData.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <Feather name="alert-circle" size={32} color="#fb7185" />
            <Text className="text-mutedText text-sm mt-3 text-center">
              You need an account before adding a transaction.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-2 mb-4">
              <AiActionCard
                onPress={() => setIsScannerOpen(true)}
                icon="camera"
                title="Scan receipt"
                desc="Snap a photo"
              />

              <AiActionCard
                icon="mic"
                title="Voice log"
                desc="Just say it"
                onPress={() => setIsVoiceModalOpen(true)}
              />
            </View>

            <View className="border border-white/10 rounded-2xl p-2.5 flex-row items-center justify-center gap-2">
              {TYPE_OPTIONS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setValue("type", key);
                    setValue(
                      "category",
                      key === "INCOME"
                        ? INCOME_CATEGORIES[0].key
                        : EXPENSE_CATEGORIES[0].key,
                    );
                  }}
                  className={`p-3 rounded-xl flex items-center justify-center w-1/2 ${type === key ? "bg-white" : "bg-white/10"}`}
                >
                  <Text
                    className={`${type === key ? "text-zinc-950 font-bold" : "text-zinc-100 font-normal"}`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-4">
              <View>
                <View>
                  <Text className="text-zinc-300 text-sm font-medium">
                    Amount
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        className="bg-inputBg rounded-2xl p-4 text-base font-medium flex items-center justify-center  text-white border border-white/10 mt-1.5"
                        placeholderTextColor="#A5A5A5"
                        placeholder="0"
                        keyboardType="numeric"
                      />
                    )}
                  />
                </View>

                <View className="my-4">
                  <Text className="text-zinc-300 text-sm font-medium">
                    Category
                  </Text>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className="bg-inputBg rounded-2xl p-4 text-base font-medium flex items-center justify-center  text-white border border-white/10 mt-1.5"
                        placeholderTextColor="#A5A5A5"
                        placeholder="food, groceries, transport, shopping, entertainment, health"
                      />
                    )}
                  />
                </View>

                <View>
                  <Text className="text-zinc-300 text-sm font-medium">
                    Account
                  </Text>
                  <Controller
                    control={control}
                    name="accountId"
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className="bg-inputBg rounded-2xl p-4 text-base font-medium flex items-center justify-center  text-white border border-white/10 mt-1.5"
                        placeholderTextColor="#A5A5A5"
                        placeholder="Cash, Savings"
                      />
                    )}
                  />
                </View>

                <View className="my-4">
                  <Text className="text-zinc-300 text-sm font-medium">
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsPickerOpen((prev) => !prev)}
                    className="bg-inputBg p-4 rounded-2xl flex-row items-center justify-between mt-1.5  border border-white/10"
                  >
                    <Text className="text-[#A5A5A5] text-base font-medium">
                      {format(date, "dd MM yyyy")}
                    </Text>
                    <Feather name="calendar" size={18} color="#A5A5A5" />
                  </TouchableOpacity>

                  {isDatePickerOpen && (
                    <View className="bg-inputBg border border-white/10 rounded-xl mt-2 overflow-hidden">
                      <CalendarPicker
                        value={date}
                        maxDate={new Date()}
                        onChange={(date) => {
                          setValue("date", date);
                          setIsPickerOpen(false);
                        }}
                      />
                    </View>
                  )}
                </View>

                <View>
                  <Text className="text-zinc-300 text-sm font-medium">
                    Description (optional)
                  </Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className="bg-inputBg rounded-2xl p-4 text-base font-medium flex items-center justify-center  text-white border border-white/10 mt-1.5"
                        placeholderTextColor="#A5A5A5"
                        placeholder="e.g: Swiggy order"
                      />
                    )}
                  />
                </View>

                <TouchableOpacity
                  disabled={isPending}
                  onPress={handleSubmit(handleSaveTxn)}
                  className="bg-primary w-full mt-6 rounded-2xl p-4"
                >
                  <Text className="text-center text-white text-base font-medium">
                    {isPending ? "saving..." : "Save Transaction"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {scanning && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <ActivityIndicator color="#fff" size={18} />
        </View>
      )}

      <ReceiptModal
        onCapture={(base64, mimiType) => handleCapture(base64, mimiType)}
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <VoiceModal
        visible={isVoiceModalOpen}
        onExtracted={handleVoice}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </SafeAreaView>
  );
};
