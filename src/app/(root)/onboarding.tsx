import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  return (
    <SafeAreaView
      className="flex-1 justify-center bg-body items-center w-full p-4"
      edges={["top"]}
    >
      <Text>On-Boarding</Text>
    </SafeAreaView>
  );
}
