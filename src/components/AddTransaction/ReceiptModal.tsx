import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AI_GRADIENT, COLORS } from "../../constants/theme";
import { GradientIconBtn } from "./GradientIconBtn";

interface props {
  visible: boolean;
  onClose: () => void;
  onCapture: (base64: string, mimiType: string) => void;
}

export const ReceiptModal = ({ visible, onClose, onCapture }: props) => {
  const cameraRef = useRef<null | CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [status, requestPermission] = useCameraPermissions();

  const handleLib = async () => {
    try {
      const libPerms = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!libPerms.granted) return;

      const pic = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        base64: true,
      });

      if (pic.canceled) return;

      const asset = pic.assets[0];

      if (asset.base64) {
        onCapture(asset.base64, "image/jpeg");
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      });

      if (pic?.base64) {
        onCapture(pic.base64, "image/jpeg");
      }
      setCapturing(false);
    } catch (error) {
      console.log({ error });
      setCapturing(false);
    }
  };

  useEffect(() => {
    if (visible && !status?.granted) {
      requestPermission();
    }
  }, [status?.granted, requestPermission, visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-body">
        {status?.granted && (
          <CameraView ref={cameraRef} facing="back" style={{ flex: 1 }} />
        )}

        <View className="absolute inset-0 flex items-center justify-center px-10">
          <View className="border-2 border-dashed w-full aspect-[3/4] border-white/90 rounded-2xl" />
        </View>

        <SafeAreaView
          className="absolute inset-0 border"
          edges={["top", "bottom"]}
        >
          <View className="px-3 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="bg-black w-10 h-10 flex-row items-center justify-center  rounded-full"
            >
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>

            <View className="bg-black/90 px-3 py-1.5 rounded-xl border border-black flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="robot-outline"
                size={12}
                color={COLORS.teal}
              />

              <Text className="text-zinc-200 text-sm font-medium">
                Align the receipt
              </Text>
            </View>
          </View>

          <View className="flex-1" />

          <View className="pb-6 px-10 flex-row items-center justify-between">
            <TouchableOpacity
              className="w-12 h-12 bg-black/90 rounded-full flex items-center justify-center"
              onPress={handleLib}
            >
              <Feather name="image" color="#ccc" size={20} />
            </TouchableOpacity>

            <GradientIconBtn
              icon="camera"
              colors={[AI_GRADIENT[1], AI_GRADIENT[0]]}
              size={72}
              iconSize={26}
              loading={capturing}
              disabled={!status?.granted}
              onPress={handleCapture}
              borderColor="rgba(255,255,255,0.85)"
            />

            <View className="h-12 w-12" />
          </View>
        </SafeAreaView>

        {!status?.granted && status?.canAskAgain === false && (
          <View className="absolute inset-0 items-center justify-center bg-black/80 px-10">
            <Feather name="camera-off" size={32} color="#8A8D96" />
            <Text className="text-white/70 text-sm mt-3 text-center">
              Camera access is off. Enable it in Settings to scan receipts.
            </Text>
            <TouchableOpacity onPress={onClose} className="mt-6">
              <Text className="text-white text-sm font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};
