import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTransactionScreen() {
  const params = useLocalSearchParams<{ action?: string }>();
  return (
    <SafeAreaView>
      <Text>{params.action}</Text>
      <Text>Add-Transaction Screen</Text>
    </SafeAreaView>
  );
}
