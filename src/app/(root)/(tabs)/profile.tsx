import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccountQuery } from "../../../hooks/queries/useAccountQuery";
import { formatPrice } from "../../../lib/helpers";
import { userStore } from "../../../store/userStore";

export default function ProfileScreen() {
  const router = useRouter();

  const { user } = useUser();

  const { signOut } = useAuth();

  const currency = userStore((state) => state.currency);

  const {
    data: accountData = [],
    isLoading,
    isRefetching,
    refetch: accountRefetch,
  } = useAccountQuery();

  // Total Balance
  const totolBalance = useMemo(() => {
    return accountData.reduce((acc, sum) => acc + sum.balance, 0);
  }, [accountData]);

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          router.push("/(auth)/sign-in");
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="px-2 bg-body flex-1" edges={["top"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={accountRefetch}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <Text className="text-zinc-100 font-bold text-2xl">Profile</Text>

        <View className="bg-inputBg rounded-2xl p-4 mt-1 border border-white/10">
          <Image
            source={{ uri: user?.imageUrl }}
            resizeMode="contain"
            className="rounded-full h-32 w-32 mx-auto"
          />

          <View className="flex items-center justify-center mt-4">
            <Text className="text-base font-bold text-zinc-100">
              {user?.fullName}
            </Text>

            <Text className="text-base font-medium text-zinc-400">
              {user?.emailAddresses[0].emailAddress}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-zinc-300 text-sm font-medium mb-1">
            Accounts
          </Text>

          <View className="rounded-2xl border-white/10 p-4 border flex-1 items-start bg-inputBg backdrop-blur-lg">
            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center gap-2">
                <Feather />

                <Text className="text-zinc-200 text-sm font-normal">
                  Cash (default)
                </Text>
              </View>
              <Text className="text-zinc-100 text-sm font-semibold">
                {isLoading ? (
                  <ActivityIndicator color="#fff" size={10} />
                ) : (
                  formatPrice(totolBalance, currency)
                )}
              </Text>
            </View>
          </View>
        </View>

        <View className="my-4">
          <Text className="text-zinc-300 text-sm font-medium mb-1">
            Prefrences
          </Text>

          <View className="rounded-2xl border-white/10 p-4 border flex-1 items-start bg-inputBg backdrop-blur-lg"></View>
        </View>

        <TouchableOpacity
          className="bg-red-600 px-3 py-4 rounded-2xl flex-row justify-start items-center gap-2"
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={16} color="#fff" />
          <Text className="text-center text-white text-base font-medium">
            Sign out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
