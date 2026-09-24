import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { isSameMonth } from "date-fns";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetModal } from "../../../components/Home/BudgetModal";
import { TxnRow } from "../../../components/Home/TxnRow";
import {
  type CategoryKey,
  getCategoryConfig,
} from "../../../constants/categories";
import { useAccountQuery } from "../../../hooks/queries/useAccountQuery";
import { useGetBudgetQuery } from "../../../hooks/queries/useBudgetQuery";
import { useTxnsQuery } from "../../../hooks/queries/useTxnsQuery";
import { formatPrice } from "../../../lib/helpers";
import { userStore } from "../../../store/userStore";

const QUICK_ACTIONS = [
  {
    icon: "camera",
    label: "AI Receipt Scan",
    action: "scan",
    color: "#1A85FF",
  },
  {
    icon: "mic",
    label: "Voice Entry",
    action: "voice",
    color: "#FF6B4A",
  },
  {
    icon: "plus",
    label: "Add Manually",
    action: "manual",
    color: "#059669",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  const { user } = useUser();

  const currency = userStore((state) => state.currency);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);

  // Acconts Data
  const {
    data: account = [],
    isLoading: isAccontLoading,
    refetch: accountRefetch,
    isRefetching: isAccountRefetching,
  } = useAccountQuery();

  // Transactions Data
  const {
    data: txnsData = [],
    refetch: txnsRetch,
    isLoading: isTxnsLoading,
    isRefetching: isTxnsRefetching,
  } = useTxnsQuery();

  // Budget data
  const { data: budget, refetch: budgetReftch } = useGetBudgetQuery();

  // Total Balance
  const totolBalance = useMemo(() => {
    return account.reduce((acc, sum) => acc + sum.balance, 0);
  }, [account]);

  //Filter Current Month Txns from Txns
  const currentMonthTxns = useMemo(() => {
    const now = new Date();
    return txnsData.filter(({ date }) => isSameMonth(new Date(date), now));
  }, [txnsData]);

  //Current Month Income
  const currentMonthIncome = useMemo(() => {
    return currentMonthTxns
      .filter(({ type }) => type === "INCOME")
      .reduce((sum, acc) => sum + acc.amount, 0);
  }, [currentMonthTxns]);

  // Current Month Expense
  const currentMonthExpense = useMemo(() => {
    const expenseTxns = currentMonthTxns.filter(
      ({ type }) => type === "EXPENSE",
    );
    const t = expenseTxns.reduce((sum, acc) => sum + acc.amount, 0);
    return t;
  }, [currentMonthTxns]);

  // Per Month Expense
  const monthExpenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    const gg = currentMonthTxns.filter(({ type }) => type === "EXPENSE");

    gg.forEach(({ amount, category }) => {
      map[category] = (map[category] ?? 0) + amount;
    });

    const t = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val]) => ({
        amount: val,
        category: key as CategoryKey,
        color: getCategoryConfig(key as CategoryKey).color,
      }));

    return t;
  }, [currentMonthTxns]);

  // Recent txns

  const recentTxns = useMemo(() => txnsData.slice(0, 5), [txnsData]);

  // Conditions
  const isRefreshing = isAccountRefetching || isTxnsRefetching;
  const isLoading = isTxnsLoading || isAccontLoading;

  // Handlers
  const refresh = () => {
    accountRefetch();
    txnsRetch();
    budgetReftch();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center bg-body items-center w-full p-4">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-200" edges={["top"]}>
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
        }
        className="flex-1 bg-body"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5 pb-5 rounded-b-[28px] bg-zinc-200">
          <View className="flex-row justify-between">
            <Image
              source={require("../../../../assets/images/welth.png")}
              style={{ width: 80, height: "100%" }}
              resizeMode="contain"
            />

            <View className="flex-row gap-2">
              <View>
                <Text className="text-sm font-medium text-zinc-600">
                  Good Afternoon
                </Text>
                <Text className="text-base font-semibold text-zinc-950">
                  {user?.fullName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/profile")}
              >
                <Image
                  source={{ uri: user?.imageUrl }}
                  resizeMode="contain"
                  className="rounded-full h-16 w-16"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="my-8">
            <Text className="text-sm text-zinc-800 font-normal">
              Total Balance
            </Text>
            <Text className=" text-zinc-950  text-5xl font-bold mt-1">
              {formatPrice(totolBalance, currency)}
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-row items-center gap-1">
                <Text className="text-emerald-600 text-sm font-medium">
                  {formatPrice(currentMonthIncome, currency)}
                </Text>
                <Feather name="arrow-up-right" size={14} color="#059669" />
              </View>

              <View className="flex-row items-center gap-1">
                <Text className="text-rose-600 text-sm font-medium">
                  {formatPrice(currentMonthExpense, currency)}
                </Text>

                <Feather name="arrow-down-right" size={14} color="#e11d48" />
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            {QUICK_ACTIONS.map(({ action, color, icon, label }) => (
              <TouchableOpacity
                key={label}
                onPress={() => {
                  router.push({
                    pathname: "/(root)/(tabs)/add-transaction",
                    params: { action },
                  });
                }}
                className="rounded-2xl border-zinc-100 py-4 border flex-1 items-center gap-2 bg-zinc-100"
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}26` }}
                >
                  <Feather name={icon} color={color} size={14} />
                </View>

                <Text className="text-xs font-medium">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/assistant")}
          className="border border-zinc-900 rounded-2xl mt-4 p-4 bg-zinc-200 flex-row items-center justify-between"
        >
          <View className="flex-row gap-2">
            <View className="bg-zinc-100 p-2 flex items-center justify-center rounded-full">
              <View className="bg-blue-600 rounded-full w-2 h-2" />
            </View>
            <Text className="text-zinc-900 font-normal text-base">
              Ask anything about your money
            </Text>
          </View>

          <Feather name="arrow-right" color="#2563eb" size={14} />
        </TouchableOpacity>

        <View>
          <TouchableOpacity
            onPress={() => setIsBudgetModalOpen(true)}
            className="border border-zinc-900 rounded-2xl my-4 p-4 bg-zinc-200 flex-1"
          >
            <View className="flex-row justify-between">
              <Text className="text-zinc-800 text-base font-medium mb-0.5">
                Monthly Budget
              </Text>
              <Feather name="edit" size={14} color="#059669" />
            </View>
            {budget ? (
              <>
                <Text className="text-sm font-normal text-zinc-400">
                  {formatPrice(currentMonthExpense, currency)} of{" "}
                  {formatPrice(Number(budget.amount), currency)} spent
                </Text>
                <View className="h-2 rounded-full bg-[#F0EEE7] overflow-hidden mt-2">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((currentMonthExpense / budget.amount) * 100),
                        100,
                      )}%`,
                      backgroundColor:
                        currentMonthExpense >= budget.amount
                          ? "#FF6B4A"
                          : currentMonthExpense >= budget.amount * 0.8
                            ? "#F7DC6F"
                            : "#3DDC84",
                    }}
                  />
                </View>
              </>
            ) : (
              <Text className="text-sm font-normal text-zinc-400">
                Tap to set a monthly spending budget
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="border border-zinc-900 rounded-2xl p-4 bg-zinc-200">
          <Text className="text-zonc-950 font-medium text-base mb-4">
            Expense Breakdown (This Month)
          </Text>

          <View className="flex-row items-center justify-between gap-8">
            <PieChart
              data={monthExpenseBreakdown.map(({ amount, color }) => ({
                value: amount,
                color,
              }))}
              radius={60}
              innerRadius={38}
              innerCircleColor="fff"
            />

            <View className="flex-1">
              {monthExpenseBreakdown
                .slice(0, 6)
                .map(({ amount, category, color }) => (
                  <View key={category} className="flex-row justify-between">
                    <View className="flex-row items-center flex-1 gap-2 mb-2 last:mb-0">
                      <View
                        style={{ backgroundColor: color }}
                        className="rounded-full h-2 w-2"
                      />
                      <Text className="text-sm font-medium text-zinc-700">
                        {category}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-zinc-900">
                      {formatPrice(amount, currency)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between">
            <Text className="text-zinc-200 font-medium text-base">
              Recent Transaction
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/transaction")}
            >
              <Text className="text-zinc-900 font-normal text-sm bg-zinc-200 p-2 rounded-2xl">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            {recentTxns.map((txn) => (
              <TxnRow key={txn.id} txn={txn} />
            ))}
          </View>
        </View>
      </ScrollView>

      {user && (
        <BudgetModal
          budget={budget}
          visible={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
