import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetBudgetQuery } from "../../../hooks/queries/useBudgetQuery";
import { useTxnsQuery } from "../../../hooks/queries/useTxnsQuery";
import { callGemini } from "../../../lib/services/assistant";
import { userStore } from "../../../store/userStore";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "How much did I spend on food this month?",
  "What's my biggest expense this week?",
  "Am I over budget anywhere?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! Ask me anything about your spending or budgets in last 30 days.",
  },
];

export default function AssistantScreen() {
  const { user } = useUser();

  const [sending, setSending] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const { refetch: refetchTxn } = useTxnsQuery();
  const { refetch: refetchBudget } = useGetBudgetQuery();

  const currency = userStore((state) => state.currency);

  const sendMessage = async (input: string) => {
    if (!input.trim() || sending || !user) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const [{ data: budget = null }, { data: transactions = [] }] =
        await Promise.all([refetchBudget(), refetchTxn()]);

      const reply = await callGemini(transactions, budget, currency, input);

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: reply, role: "assistant" },
      ]);

      setSending(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Something went wrong!!",
          role: "assistant",
        },
      ]);
      console.log({ error });
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-body px-2" edges={["top"]}>
      <Text className="text-zinc-100 font-bold text-2xl">Assistant</Text>

      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === "ios" ? -70 : 0}
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          keyExtractor={({ id }) => id}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 12,
          }}
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View
                className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
              >
                <View
                  className={`rounded-2xl px-3.5 py-2.5 ${
                    isUser
                      ? "bg-inputBg border border-white/10"
                      : "bg-white border border-[#E8E6DF]"
                  }`}
                >
                  <Text
                    className={`text-sm ${isUser ? "text-zinc-50" : "text-brand-bg"}`}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            sending ? (
              <View className="self-start mb-3 bg-white border border-[#E8E6DF] rounded-2xl px-3.5 py-2.5">
                <ActivityIndicator size="small" color="#000" />
              </View>
            ) : null
          }
        />

        {messages.length <= 1 && (
          <View className="pb-2 gap-2">
            {SUGGESTED_PROMPTS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => sendMessage(m)}
                className="bg-white rounded-xl border border-[#E8E6DF] px-3.5 py-2.5 self-start"
              >
                <Text className="text-brand-text-secondary text-xs">{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View
          className="flex-row items-center gap-2 pt-2"
          style={{ paddingBottom: 90 }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your money..."
            placeholderTextColor="#8A8D96"
            editable={!sending}
            className="flex-1 bg-inputBg border border-white/10 rounded-2xl px-4 py-3 text-sm text-white"
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={sending}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center border border-white/90"
            style={{ opacity: sending ? 0.6 : 1 }}
          >
            <Feather name="arrow-up" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
