import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, useRouter } from "expo-router";
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
import {
  createVerificationSchema,
  type TVerificationCodeType,
} from "../../lib/auth";

export const SignInVerify = () => {
  const router = useRouter();

  const { signIn, fetchStatus } = useSignIn();

  // Condition
  const isLoading = fetchStatus === "fetching";

  const { control, handleSubmit } = useForm<TVerificationCodeType>({
    resolver: zodResolver(createVerificationSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });

  const handleVerifyCode = async (values: TVerificationCodeType) => {
    await signIn.mfa.verifyEmailCode({
      code: values.code,
    });

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
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center items-center p-4 w-full bg-body"
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
          name="code"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              className="bg-inputBg rounded-lg px-3 py-4 text-white mb-4"
              placeholderTextColor="#A5A5A5"
              placeholder="Enter code"
            />
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(handleVerifyCode)}
          className="bg-primary px-3 py-4 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white text-base font-medium">
              Submit Code
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
