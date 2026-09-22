import { useUser } from "@clerk/expo";
import { Image, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { userStore } from "../../../store/userStore";

export default function HomeScreen() {
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
              <Image
                source={{ uri: user?.imageUrl }}
                resizeMode="contain"
                className="rounded-full h-16 w-16"
              />
            </View>
          </View>

          <View className="my-8">
            <Text className="text-sm text-zinc-600 font-normal">
              Total Balance
            </Text>
            <Text className=" text-zinc-950  text-5xl font-bold mt-1">
              {currency} 20,000
            </Text>
            <View className="flex-row gap-2">
              <Text className="text-emerald-600 text-sm font-medium">
                15,944
              </Text>

              <Text className="text-rose-600 text-sm font-medium">15,944</Text>
            </View>
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
