import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { File } from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { AI_GRADIENT, COLORS, RECORDING_GRADIENT } from "../../constants/theme";
import {
  type ExtractedTransaction,
  extractTxnsFromVoice,
} from "../../lib/services/extractTransaction";
import { GradientIconBtn } from "./GradientIconBtn";

export type TStatus = "error" | "idle" | "recording" | "processing";

interface Props {
  visible: boolean;
  onClose: () => void;
  onExtracted: (result: ExtractedTransaction) => void;
}

export const VoiceModal = ({ visible, onExtracted, onClose }: Props) => {
  const [status, setStatus] = useState<TStatus>("idle");
  const [seconds, setSeconds] = useState(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) =>
    console.log("Recording status:", status),
  );

  const stopRecording = async () => {
    setStatus("processing");
    await recorder.stop();

    try {
      const uri = recorder.uri;

      if (!uri) throw new Error("No recording captured");

      const file = new File(uri);

      const base64 = await file.base64();

      const result = await extractTxnsFromVoice(base64, "audio/m4a");
      onExtracted(result);
      onClose();
      setStatus("idle");
    } catch (error) {
      console.log({ error });
      setStatus("error");
    }
  };

  const startRecording = async () => {
    setSeconds(0);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus("recording");
  };

  useEffect(() => {
    if (!visible) {
      setStatus("idle");
      setSeconds(0);
    }

    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setStatus("error");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();
  }, [visible]);

  useEffect(() => {
    if (status !== "recording") return;

    const timerID = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerID);
  }, [status]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <BlurView tint="dark" intensity={40} className="absolute inset-0" />
        <LinearGradient
          colors={["#1c1c22", "#121216", "#0a0a0c"]}
          style={{
            width: "100%",
            alignItems: "center",
            overflow: "hidden",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          <View className="w-10 h-1 rounded-full bg-white/15 mb-6" />

          {status === "error" ? (
            <>
              <Feather name="alert-circle" size={32} color="#FF6B4A" />
              <Text className="text-white/60 text-sm mt-3 mb-6 text-center">
                Couldn&apos;t process that. Check your microphone permission and
                try again.
              </Text>
              <TouchableOpacity
                className="bg-red-500 rounded-2xl py-4 w-full"
                onPress={onClose}
              >
                <Text className="text-center  text-white text-sm font-medium">
                  Close
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center justify-center gap-2">
                <MaterialCommunityIcons
                  name="robot"
                  color={COLORS.teal}
                  size={12}
                />

                <Text className="text-zinc-100 text-sm font-medium">
                  Ai Audio Log
                </Text>
              </View>

              <Text className="text-zinc-400/80 text-base font-normal my-1">
                {status === "recording"
                  ? "Listening..."
                  : status === "processing"
                    ? "Understanding that..."
                    : "Tell me about a transaction"}
              </Text>

              <Text className="text-zinc-400/70 text-sm font-normal mb-4">
                {status === "recording"
                  ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
                  : status === "processing"
                    ? "Transcribing and extracting the details"
                    : "I spent 400 on groceries yesterday"}
              </Text>

              <View className="justify-center items-center mb-8  w-full">
                {status === "recording" && (
                  <Text className="text-rose-400 mb-4 font-medium w-full text-center">
                    recording please wait...
                  </Text>
                )}
                {status === "processing" && (
                  <Text className="text-emerald-400 mb-4 font-medium w-full text-center">
                    processing please wait...
                  </Text>
                )}
                <GradientIconBtn
                  icon={status === "recording" ? "square" : "mic"}
                  colors={
                    status === "recording"
                      ? RECORDING_GRADIENT
                      : [AI_GRADIENT[1], AI_GRADIENT[0]]
                  }
                  disabled={status === "processing"}
                  onPress={
                    status === "recording" ? stopRecording : startRecording
                  }
                />
              </View>

              <TouchableOpacity
                className="bg-red-500 rounded-2xl py-4 w-full"
                onPress={onClose}
              >
                <Text className="text-center  text-white text-sm font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};
