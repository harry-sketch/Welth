import { useLocalSearchParams } from "expo-router";
import { AddTransactionPage } from "../../../components/AddTransaction/AddTransaction";

export default function AddTransactionScreen() {
  const params = useLocalSearchParams<{ action?: string }>();

  return <AddTransactionPage params={params?.action} />;
}
