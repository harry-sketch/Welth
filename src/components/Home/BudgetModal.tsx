import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUpdateBudgetMutation } from "../../hooks/mutations/useUpdateBudgetMutation";
import type { IBudget } from "../../lib/services/budget";

interface Props {
  visible: boolean;
  budget?: IBudget;
  onClose: () => void;
}

export const BudgetModal = ({ visible, onClose, budget }: Props) => {
  const [amt, setAmt] = useState<string>("");

  useEffect(() => {
    if (visible) {
      if (budget?.amount) {
        setAmt(String(budget?.amount));
      }
    }
  }, [budget?.amount, visible]);

  const { mutateAsync, error, isPending, isError } = useUpdateBudgetMutation();

  const handleSave = async () => {
    try {
      if (Number(amt) < 0) return;

      await mutateAsync({
        amount: Number(amt),
      });

      onClose();
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/40"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="bg-zinc-100 px-6 pt-3 pb-2 rounded-2xl">
          <Text className="text-zinc-950 text-base font-semibold">
            Edit Monthy Budget
          </Text>
          <View className="my-4">
            <TextInput
              value={amt}
              onChangeText={(v) => setAmt(v)}
              placeholder="Enter Budget..."
              className="bg-white border border-[#E8E6DF] rounded-xl px-4 py-3.5 text-sm text-brand-bg"
              placeholderTextColor="#A5A5A5"
              keyboardType="numeric"
              autoFocus
            />

            {(isError || error) && (
              <Text className="text-red-400 text-sm font-medium">
                {error.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            disabled={isPending}
            className="p-2 items-center"
            onPress={handleSave}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="bg-emerald-700 w-full text-center py-4 rounded-2xl text-white text-base font-medium">
                Save
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="p-2 items-center" onPress={onClose}>
            <Text className="bg-red-500 w-full text-center py-4 rounded-2xl text-white text-base font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
