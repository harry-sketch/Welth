import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeleteTxn } from "../../hooks/mutations/useDeleteTxn";
import { useTxnsQuery } from "../../hooks/queries/useTxnsQuery";
import { currentMonthDays, dayKey } from "../../lib/helpers";
import type { TTransactionType } from "../../lib/services/transactions";
import { TxnRow } from "../Home/TxnRow";

export default function TransactionPage() {
  const [query, setQuery] = useState<string>("");

  const {
    data: txnsData = [],
    error: fetchError,
    isError: isTxnError,
    isRefetching: isTxnRefetching,
    refetch: txnRefetch,
  } = useTxnsQuery();

  const { mutateAsync } = useDeleteTxn();

  const filterTxns = useMemo(() => {
    const q = query.toLowerCase();

    if (!q) return txnsData;

    const filTxns = txnsData.filter(
      ({ category, description }) =>
        category.toLowerCase().includes(q) ||
        description?.toLowerCase().includes(q),
    );

    return filTxns;
  }, [query, txnsData]);

  const dailyIncomeExpense = useMemo(() => {
    const days = currentMonthDays();

    return days.flatMap(({ key, label }) => {
      const income = txnsData
        .filter(
          (tx) => tx.type === "INCOME" && dayKey(new Date(tx.date)) === key,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = txnsData
        .filter(
          (tx) => tx.type === "EXPENSE" && dayKey(new Date(tx.date)) === key,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
      return [
        { value: income, label, frontColor: "#34d399" },
        { value: expense, frontColor: "#fb7185" },
      ];
    });
  }, [txnsData]);

  const handleDelete = async ({
    type,
    amount,
    txnId,
    accountId,
  }: {
    type: TTransactionType;
    txnId: string;
    amount: number;
    accountId: string;
  }) => {
    try {
      Alert.alert("Delete Transaction", "Are you sure you want to delete ?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await mutateAsync({
              accountId,
              amount,
              txnId,
              type,
            });
            txnRefetch();

            if (deleteError) {
              Alert.alert("Error", "Couldn't delete this transaction");
            }
          },
        },
      ]);
    } catch (error) {
      console.log({ error });
    }
  };

  if (fetchError || isTxnError) {
    return (
      <View className="flex-1 justify-center bg-body items-center w-full p-4">
        <Text className="text-zinc-100">{fetchError?.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-body" edges={["top"]}>
      <View className="flex-row items-center justify-between px-2">
        <Text className="text-zinc-100 font-bold text-2xl">Transaction</Text>

        <View className="bg-zinc-100 p-1.5 rounded-full">
          <Feather name="download-cloud" size={18} color="#000" />
        </View>
      </View>

      <View className="my-4">
        <TextInput
          value={query}
          onChangeText={(val) => setQuery(val)}
          className="bg-inputBg rounded-2xl p-4 text-sm font-medium flex items-center justify-center  text-white border border-white/10"
          placeholderTextColor="#A5A5A5"
          placeholder="Search..."
        />
      </View>

      <FlatList
        refreshControl={
          <RefreshControl refreshing={isTxnRefetching} onRefresh={txnRefetch} />
        }
        contentContainerClassName="px-2"
        data={filterTxns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TxnRow
            txn={item}
            onDelete={() =>
              handleDelete({
                amount: item.amount,
                txnId: item.id,
                type: item.type,
                accountId: item.account_id,
              })
            }
          />
        )}
        ListHeaderComponent={
          <View className="border border-white/10 rounded-2xl mb-4 bg-zinc-100 p-4">
            <View className="flex-row justify-between">
              <Text className="text-zinc-900 text-sm font-semibold">
                Daily Income vs Expense
              </Text>

              <View className="flex-row gap-4">
                <View className="flex-row gap-1 items-center">
                  <View className="bg-emerald-400 w-2 h-2 rounded-full" />
                  <Text className="text-emerald-400 text-sm font-medium">
                    Income
                  </Text>
                </View>
                <View className="flex-row gap-1 items-center">
                  <View className="bg-rose-400 w-2 h-2 rounded-full" />
                  <Text className="text-rose-400 text-sm font-medium">
                    Expense
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-8"
            >
              <BarChart
                data={dailyIncomeExpense}
                width={Math.max(dailyIncomeExpense.length * 9, 280)}
                height={120}
                barWidth={6}
                spacing={4}
                hideYAxisText
                xAxisColor="#E8E6DF"
                yAxisColor="transparent"
                rulesColor="#F0EEE7"
                noOfSections={3}
                xAxisLabelTextStyle={{ color: "#8A8D96", fontSize: 7 }}
                isThreeD={false}
                roundedTop
              />
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-96">
            <Feather name="inbox" size={32} color="#BDC3C7" />
            <Text className="text-mutedText text-sm mt-3">
              {query ? "No matching transactions" : "No transactions yet"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
