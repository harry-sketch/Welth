import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
  onPress: () => void;
}

export const AiActionCard = ({ title, desc, icon, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
      }}
      onPress={onPress}
      className="rounded-2xl border-white/10 p-4 border flex-1 items-start bg-inputBg backdrop-blur-lg"
    >
      <View className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
        <Feather name={icon} size={18} color="#fff" />
      </View>
      <Text className="text-zinc-300 text-base font-medium mt-2">{title}</Text>

      <Text className="text-zinc-400 text-sm font-normal leading-4">
        {desc}
      </Text>
    </TouchableOpacity>
  );
};
