import { useAuth, useSignUp } from "@clerk/expo";
import { useCallback, useState } from "react";
import { SignUpMain } from "../../components/SignUp/SignUpMain";
import SignUpVerify from "../../components/SignUp/SignUpVerify";

export default function SignUnScreen() {
  const [email, setEmail] = useState<string>("");

  const { isSignedIn, isLoaded } = useAuth();

  const { signUp } = useSignUp();

  // Conditions
  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  // Handlers
  const handleEmail = useCallback((value: string) => {
    setEmail(value);
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (isVerifying) {
    return <SignUpVerify email={email} />;
  }

  return <SignUpMain handleEmail={handleEmail} />;
}
