import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { formatPrice } from "../../lib/helpers";
import type { IAccount, TAccountType } from "../../lib/services/account";
import { userStore } from "../../store/userStore";

interface Props {
  account: IAccount;
}

const iconMap: Record<TAccountType, keyof typeof Feather.glyphMap> = {
  CASH: "dollar-sign",
  BANK: "home",
  CREDIT_CARD: "credit-card",
  SAVINGS: "shield",
};

export const ProfileAccountRow = ({ account }: Props) => {
  const currency = userStore((state) => state.currency);

  return (
    <View className="flex-row items-center justify-between w-full py-2.5">
      <View className="flex-row items-center gap-2">
        <Feather name={iconMap[account.type]} size={14} color="#fff" />
        <View>
          {account.type === "CASH" ? (
            <View className="flex-row gap-1">
              <Text className="text-zinc-200 text-sm font-normal">
                {account.type}
              </Text>

              <Text className="text-zinc-100 font-xs">(default)</Text>
            </View>
          ) : (
            <Text className="text-zinc-200 text-sm font-normal">
              {account.type}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-zinc-100 text-sm font-semibold">
        {formatPrice(account.balance, currency)}
      </Text>
    </View>
  );
};
