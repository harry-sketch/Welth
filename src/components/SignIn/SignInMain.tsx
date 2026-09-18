import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createSignInSchema, type TSignInType } from "../../lib/auth";

export const SignInMain = () => {
  const router = useRouter();

  const { fetchStatus, signIn } = useSignIn();

  // Condition
  const isLoading = fetchStatus === "fetching";

  const { control, handleSubmit } = useForm<TSignInType>({
    resolver: zodResolver(createSignInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (values: TSignInType) => {
    const { error } = await signIn.password({
      password: values.password,
      emailAddress: values.email,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl, session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const routeUrl = decorateUrl("/");
          router.push(routeUrl as Href);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-body items-center w-full p-4"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="w-full">
        <Image
          source={require("@/assets/images/welth-light.png")}
          className="w-72 h-40 mx-auto"
          resizeMode="contain"
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              className="bg-inputBg rounded-lg px-3 py-4 text-white"
              placeholderTextColor="#A5A5A5"
              placeholder="Email"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#1A1A1A] rounded-lg px-3 py-4 text-base font-medium text-white my-4"
              placeholderTextColor="#A5A5A5"
              placeholder="password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(handleSignIn)}
          className="bg-primary px-3 py-4 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white text-xl font-medium">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex justify-end mt-2 flex-row gap-2">
          <Text className="text-white">New User?</Text>
          <Link
            href="/(auth)/sign-up"
            style={{
              color: "#55BF9A",
            }}
          >
            Sign Up
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
