import { useSignIn } from "@clerk/expo";
import { SignInMain } from "../../components/SignIn/SignInMain";
import { SignInVerify } from "../../components/SignIn/SignInVerify";

export default function SignInScreen() {
  const { signIn } = useSignIn();

  if (signIn.status === "needs_client_trust") {
    return <SignInVerify />;
  }

  return <SignInMain />;
}
