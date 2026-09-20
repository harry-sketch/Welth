import { useAuth } from "@clerk/expo";
import { Redirect, Slot, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSyncUser } from "../../hooks/useSyncUser";
import { userStore } from "../../store/userStore";

export default function RootTabLayout() {
  useSyncUser();

  const pathname = usePathname();

  const { isLoaded, isSignedIn } = useAuth();

  const needsOnBoarding = userStore((store) => store.needsOnBoarding);

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/sign-in" />;

  if (needsOnBoarding === null) {
    return (
      <View className="flex-1 justify-center bg-body items-center w-full p-4">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (pathname !== "/onboarding" && needsOnBoarding) {
    return <Redirect href="/(root)/onboarding" />;
  }

  return <Slot />;
}
