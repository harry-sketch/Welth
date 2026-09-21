import { Feather } from "@expo/vector-icons";
import cc from "currency-codes";
import getSymbol from "currency-symbol-map";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type TCurrencyCodeType = { symbol: string; code: string; name: string };

export const ALL_CURRIENCIES: TCurrencyCodeType[] = cc
  .codes()
  .map((c) => ({
    code: c,
    name: cc.code(c)?.currency ?? "",
    symbol: getSymbol(c) ?? c,
  }))
  .filter((c) => c.symbol !== c.code);

interface Props {
  isVisible: boolean;
  onClose: () => void;
  selectedCode: string;
  handleSelectCurrency: (curr: TCurrencyCodeType) => void;
}

const CurrencyPicker = ({
  onClose,
  isVisible,
  selectedCode,
  handleSelectCurrency,
}: Props) => {
  const [search, setSearch] = useState<string>("");

  const filterCurr = useMemo(() => {
    if (!search.toLowerCase()) return ALL_CURRIENCIES;

    return ALL_CURRIENCIES.filter(
      ({ code, name }) =>
        code.toLowerCase().includes(search.toLowerCase()) ??
        name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const onCurrencyListClick = (curr: TCurrencyCodeType) => {
    handleSelectCurrency(curr);
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      presentationStyle="formSheet"
      animationType="slide"
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pt-3 pb-2 items-center gap-3 flex-row">
          <TextInput
            autoFocus
            value={search}
            onChangeText={(val) => setSearch(val)}
            placeholder="Search currency"
            className="p-3 text-black w-1/2 h-full bg-zinc-200 border border-zinc-400 rounded-xl text-base font-medium flex-1"
            placeholderTextColor="#A5A5A5"
          />

          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary text-sm font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          keyboardShouldPersistTaps="handled"
          keyExtractor={({ code }) => code}
          data={filterCurr}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onCurrencyListClick(item)}
              className="px-5 py-3 border-b border-zinc-400 flex-row items-center gap-2"
            >
              <Text className="w-8 text-sm">{item.symbol}</Text>

              <Text className="text-sm">{item.code}</Text>

              <Text className="text-sm">{item.name}</Text>

              {item.code === selectedCode && (
                <Feather
                  name="check"
                  size={16}
                  color="#55BF9A"
                  className="text-right"
                />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default CurrencyPicker;
