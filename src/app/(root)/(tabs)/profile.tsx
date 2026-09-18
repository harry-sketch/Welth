import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  const { signOut } = useAuth();

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
    <SafeAreaView className="p-4">
      <Text>Profile Screen</Text>

      <TouchableOpacity
        className="bg-primary px-3 py-4 rounded-lg mt-4"
        onPress={handleSignOut}
      >
        <Text className="text-center text-white text-base font-medium">
          Logout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
