import { useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
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
import { createSignUpSchema, type TSignUpType } from "../../lib/auth";

interface Props {
  handleEmail: (value: string) => void;
}

export const SignUpMain = ({ handleEmail }: Props) => {
  const { fetchStatus, signUp } = useSignUp();

  // Conditions
  const isLoading = fetchStatus === "fetching";

  const { handleSubmit, control } = useForm<TSignUpType>({
    resolver: zodResolver(createSignUpSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const handleSignIn = async (values: TSignUpType) => {
    handleEmail(values.email);
    const { error } = await signUp.password({
      password: values.password,
      emailAddress: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();

    if (sendError) {
      console.error(JSON.stringify(error, null, 2));
      return;
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
          className="w-72 h-36 mx-auto"
          resizeMode="contain"
        />

        <Text className="text-zinc-200 text-center mb-8">
          Your AI-Powered System for money
        </Text>

        <View className="flex flex-row w-full mb-4 gap-2 items-center justify-center">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                className="bg-inputBg rounded-lg px-3 py-4 text-white w-1/2 h-full"
                placeholderTextColor="#A5A5A5"
                placeholder="First Name"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                className="bg-inputBg rounded-lg px-3 py-4 text-white w-1/2 text-left"
                placeholderTextColor="#A5A5A5"
                placeholder="Last Name"
              />
            )}
          />
        </View>

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
          <Text className="text-white">Alread have an account?</Text>
          <Link
            href="/(auth)/sign-in"
            style={{
              color: "#55BF9A",
            }}
          >
            Sign In
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
