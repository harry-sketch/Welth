import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CurrencyPicker from "../../../components/Onboarding/CurrencyPicker";
import { ProfileAccountRow } from "../../../components/Profile/ProfileAccountRow";
import { useAccountQuery } from "../../../hooks/queries/useAccountQuery";
import { useSupabase } from "../../../hooks/useSupabase";
import { userStore } from "../../../store/userStore";

export default function ProfileScreen() {
  const router = useRouter();

  const { user } = useUser();

  const { signOut } = useAuth();

  const supabase = useSupabase();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [biometricLock, setBiometricLock] = useState(false);

  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] =
    useState<boolean>(false);

  const currency = userStore((state) => state.currency);

  const setCurrency = userStore((state) => state.setCurrency);

  const {
    data: accountData = [],
    isLoading: isAccountsLoading,
    isRefetching,
    isError: isAccountsError,
    error: accountsError,
    refetch: accountRefetch,
  } = useAccountQuery();

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

  const handleCurrencySelect = async (selected: { code: string }) => {
    setIsCurrencyPickerOpen(false);
    if (!user) return;
    try {
      const { error } = await supabase
        .from("users")
        .update({ currency: selected.code })
        .eq("clerk_id", user.id);
      if (error) throw error;
      setCurrency(selected.code);
    } catch {
      Alert.alert("Error", "Couldn't update your currency.");
    }
  };

  const handlePickAvatar = async () => {
    if (!user) return;

    const libPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libPermission.granted) return;

    const pic = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    });

    if (pic.canceled) return;

    setUploadingAvatar(true);

    try {
      const asset = pic.assets[0];

      const filename = asset.uri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${asset.base64}`;

      await user.setProfileImage({ file: dataUrl });

      setUploadingAvatar(false);
    } catch (error) {
      console.log({ error });
      setUploadingAvatar(false);
    }
  };

  return (
    <SafeAreaView className="px-2 bg-body flex-1" edges={["top"]}>
      <ScrollView
        className="flex-1"
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

        <View className="bg-inputBg rounded-2xl p-4 mt-1 border border-white/10 items-center">
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.8}
            className="rounded-full bg-[#1A1D26] items-center justify-center overflow-hidden border-2 border-[#2A2E3A]"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#8A8D96" />
            ) : user?.imageUrl && user.hasImage ? (
              <Image
                source={{ uri: user?.imageUrl }}
                resizeMode="contain"
                className="rounded-full h-32 w-32 mx-auto"
              />
            ) : (
              <Feather name="user" size={30} color="#8A8D96" />
            )}
            <View className="absolute bottom-0 inset-x-0 h-6 bg-black/50 items-center justify-center">
              <Feather name="camera" size={13} color="#F2EFE9" />
            </View>
          </TouchableOpacity>

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
            {isAccountsLoading ? (
              <View>
                <ActivityIndicator color="#fff" size={10} />
              </View>
            ) : isAccountsError || accountsError ? (
              <View className="bg-white px-4 py-5 items-center">
                <Text className="text-brand-text-muted text-xs">
                  Couldn&apos;t load your accounts.
                </Text>
              </View>
            ) : accountData.length === 0 ? (
              <View className="bg-white px-4 py-5 items-center">
                <Text className="text-brand-text-muted text-xs">
                  No Accounts found
                </Text>
              </View>
            ) : (
              accountData.map((account) => (
                <ProfileAccountRow key={account.id} account={account} />
              ))
            )}
          </View>
        </View>

        <View className="my-4">
          <Text className="text-zinc-300 text-sm font-medium mb-1">
            Prefrences
          </Text>

          <TouchableOpacity
            onPress={() => setIsCurrencyPickerOpen(true)}
            className="rounded-2xl border-white/10 p-4 border flex-1 items-start bg-inputBg backdrop-blur-lg justify-between flex-row"
          >
            <View className="flex-row items-center gap-2">
              <Feather name="dollar-sign" size={14} color="#fff" />
              <Text className="text-zinc-200 text-sm font-normal">
                Currency
              </Text>
            </View>

            <Text className="text-zinc-100 text-sm font-semibold">
              {currency}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-inputBg border border-white/10 p-3 rounded-2xl flex-row justify-between items-center gap-2 mb-4">
          <View className="flex-row gap-2">
            <Feather name="lock" size={15} color="#fff" />
            <Text className="text-zinc-200 text-sm font-normal">
              Biometric lock
            </Text>
          </View>
          <Switch value={biometricLock} onValueChange={setBiometricLock} />
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

      <CurrencyPicker
        selectedCode={currency}
        handleSelectCurrency={(curr) =>
          handleCurrencySelect({ code: curr.code })
        }
        isVisible={isCurrencyPickerOpen}
        onClose={() => setIsCurrencyPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
