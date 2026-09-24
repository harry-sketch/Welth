import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { getCategoryConfig } from "../../constants/categories";
import type {
  ITransactions,
  TInputMethodType,
} from "../../lib/services/transactions";

interface Props {
  onDelete?: () => void;
  txn: ITransactions;
  isPending?: boolean;
}

const INPUT_METHOD_ICONS: Record<
  TInputMethodType,
  keyof typeof Feather.glyphMap
> = {
  MANUAL: "edit-3",
  RECEIPT_SCAN: "camera",
  VOICE: "mic",
};

export const TxnRow = ({ txn, onDelete, isPending }: Props) => {
  const { amount, category, type, input_method, description, is_flagged } = txn;

  const config = getCategoryConfig(category);

  const isExpense = type === "EXPENSE";

  const row = (
    <View className="border border-zinc-100 bg-zinc-100 py-4 pl-3 pr-3.5 flex-row items-center justify-between rounded-2xl">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${config.color}22` }}
        >
          <Text className="text-lg">{config.icon}</Text>
        </View>

        <View>
          <Text className="text-sm font-medium text-zinc-900" numberOfLines={1}>
            {description || config.label}
          </Text>

          <View className="flex-row gap-2 items-center mt-1.5">
            <Feather
              name={INPUT_METHOD_ICONS[input_method]}
              size={14}
              color="#18181b"
            />
            <View
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: `${config.color}1A`,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{
                  color: config.color,
                }}
              >
                {config.label}
              </Text>
            </View>

            {is_flagged && (
              <View className="flex-row gap-1">
                <Feather name="alert-triangle" size={11} color="#FF6B4A" />
                <Text className="text-rose-400 text-[11px]">Flagged</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row">
        <Text
          className={`${isExpense ? "text-rose-400" : " text-emerald-400"} text-sm font-medium`}
        >
          {isExpense ? "-" : " +"}
        </Text>
        <Text
          className={`${isExpense ? "text-rose-400" : " text-emerald-400"} text-sm font-medium`}
        >
          {amount}
        </Text>
      </View>
    </View>
  );

  if (!onDelete && !isPending) {
    return <View className="mb-2.5">{row}</View>;
  }

  return (
    <View className="mb-2.5">
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <TouchableOpacity
            disabled={isPending}
            onPress={onDelete}
            className="bg-rose-400 rounded-2xl w-16 items-center justify-center ml-2"
          >
            <Feather name="trash-2" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      >
        {row}
      </Swipeable>
    </View>
  );
};
