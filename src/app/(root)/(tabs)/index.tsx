import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
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
    color: "#3DDC84",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  const { user } = useUser();

  const currency = userStore((state) => state.currency);

  return (
    <SafeAreaView className="flex-1 bg-zinc-200" edges={["top"]}>
      <ScrollView
        className="flex-1 bg-body"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5 pb-5 rounded-b-[28px] bg-zinc-200">
          <View className="flex-row justify-between">
            <Image
              source={require("../../../../assets/images/welth.png")}
              className="h-16 w-32"
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
              ₹ 20,000
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-row items-center gap-1">
                <Text className="text-emerald-600 text-sm font-medium">
                  15,944
                </Text>
                <Feather name="arrow-up-right" size={14} color="#059669" />
              </View>

              <View className="flex-row items-center gap-1">
                <Text className="text-rose-600 text-sm font-medium">
                  10,000
                </Text>

                <Feather name="arrow-down-right" size={14} color="#e11d48" />
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            {QUICK_ACTIONS.map(({ action, color, icon, label }) => (
              <TouchableOpacity
                key={label}
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

          {/* <View className="flex-row gap-2 w-full">
            <TouchableOpacity className="rounded-2xl border-zinc-900 py-4 border flex-1 items-center gap-2">
              <View className="w-9 h-9 rounded-full items-center justify-center">
                <Text>AI Receipt Scan</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-2xl border-zinc-900 py-4 border flex-1 items-center gap-2">
              <View className="w-9 h-9 rounded-full items-center justify-center">
                <Text>AI Receipt Scan</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-2xl border-zinc-900 py-4 border flex-1 items-center gap-2">
              <View className="w-9 h-9 rounded-full items-center justify-center">
                <Text>AI Receipt Scan</Text>
              </View>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
