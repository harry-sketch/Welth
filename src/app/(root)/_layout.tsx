import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RootTabLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <Slot />;
}
