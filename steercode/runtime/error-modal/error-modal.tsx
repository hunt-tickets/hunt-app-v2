/** @jsxImportSource react */
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import CodeSnippet from "./code-snippet";
import { messenger } from "../messenger";

type StackFrame = {
  methodName?: string;
  file?: string;
  lineNumber?: number;
  column?: number;
  arguments?: any[];
  collapse?: boolean;
};

type CodeFrame = {
  content: string;
  fileName: string;
  location: {
    row: number;
    column: number;
  };
};

type Log = {
  level: "warn" | "error" | "fatal";
  message?: {
    content: string;
    substitutions?: any[];
  };
  category: string;
  stack?: StackFrame[];
  componentStack?: CodeFrame[];
  symbolicated?: {
    stack?: StackFrame[] | { stack?: StackFrame[] };
    component?: any;
  };
  codeFrame?: CodeFrame;
  componentCodeFrame?: CodeFrame;
  count: number;
  [key: string]: any;
};

type LogBoxErrorData = {
  log: Log;
  logs: Log[];
  selectedIndex: number;
  onDismiss: () => void;
};

function getStack(log: Log): StackFrame[] {
  if (log.symbolicated?.stack && "stack" in log.symbolicated.stack) {
    return log.symbolicated.stack.stack || [];
  }
  return log.symbolicated?.stack as StackFrame[] || [];
}

export default function ErrorModal({
  visible,
  data,
  onClose,
}: {
  visible: boolean;
  data: LogBoxErrorData | null;
  onClose: () => void;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(300)).current;
  const [showStack, setShowStack] = useState(false);
  const [copyPressed, setCopyPressed] = useState(false);
  const copyScale = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    fade.setValue(0);
    slide.setValue(300);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  useEffect(() => {
    if (data) console.log("LogBox Error Data:", JSON.stringify(data, null, 2));
  }, [data]);

  const title = "App Error";

  const formatStack = (stack: StackFrame[], minimal: boolean = false) => {
    if (!stack || stack.length === 0) return "No stack trace available";

    let filteredStack = stack;
    if (minimal) {
      filteredStack = stack.filter((f) => !f.collapse).slice(0, 5);
    }

    return filteredStack
      .map((f, i) => {
        const method = f.methodName || "Anonymous";
        const file = f.file?.includes("/")
          ? f.file.split("/").slice(-2).join("/")
          : f.file || "unknown";
        const ln = f.lineNumber ?? "?";
        const col = f.column ?? "?";
        const collapsed = f.collapse ? " [collapsed]" : "";
        const args =
          f.arguments && f.arguments.length
            ? `\n   args: ${f.arguments.length} argument(s)`
            : "";
        return `${i + 1}. ${method}${collapsed}\n   at ${file}:${ln}:${col}${args}`;
      })
      .join("\n\n");
  };

  const onCopy = async (): Promise<string | undefined> => {
    if (!data) return;
    const stack = getStack(data.log);
    const cleanCode = data.log.codeFrame?.content?.replace(
      /\u001b\[[0-9;]*m/g,
      ""
    );
    const fileName =
      data.log.codeFrame?.fileName +
      ":" +
      data.log.codeFrame?.location.row +
      ":" +
      data.log.codeFrame?.location.column;
    const text = [
      "Fix this error:",
      `${data.log.message?.content || "No message available"}`,
      `File: ${fileName}`,
      cleanCode ? `Code Snippet:\n${cleanCode}` : undefined,
      stack.length ? `Stack:\n${formatStack(stack, true)}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    await Clipboard.setStringAsync(`\n\n\`\`\`\n${text}\n\`\`\``);
    return text;
  };

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onClose);
    data?.onDismiss?.();
  };

  if (!data) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <Animated.View style={[styles.scrim, { opacity: fade }]}>
        <Pressable style={styles.scrimPressable} onPress={dismiss} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slide }] }]}
      >
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.messageText} numberOfLines={6}>
              {data.log.message?.content || "No message available"}
            </Text>
          </View>

          {((Platform.OS === "ios" || Platform.OS === "android") &&
            (showStack || !!data.log.codeFrame)) ||
          Platform.OS === "web" ? (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentScrollContainer}
            >
              {data.log.codeFrame ? (
                <CodeSnippet codeFrame={data.log.codeFrame} />
              ) : (
                <View style={styles.noCodeFrameContainer}>
                  <Text style={styles.noCodeFrameText}>
                    No code snippet available
                  </Text>
                </View>
              )}

              <View style={styles.boxContainer}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStack((v) => !v);
                  }}
                  style={styles.boxHeaderRow}
                >
                  <Text style={styles.boxHeaderTitle}>
                    {showStack ? "Hide" : "Show"} Stack Trace
                  </Text>
                  <Text style={styles.boxHeaderCaret}>
                    {showStack ? "\u25B2" : "\u25BC"}
                  </Text>
                </Pressable>
                {showStack && (
                  <ScrollView style={styles.boxScroll}>
                    <Text selectable style={styles.stackText}>
                      {formatStack(getStack(data.log))}
                    </Text>
                  </ScrollView>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.contentPadding}>
              {data.log.codeFrame ? (
                <CodeSnippet codeFrame={data.log.codeFrame} />
              ) : (
                <View style={styles.noCodeFrameContainer}>
                  <Text style={styles.noCodeFrameText}>
                    No code snippet available
                  </Text>
                </View>
              )}

              <View style={styles.boxContainer}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStack((v) => !v);
                  }}
                  style={styles.boxHeaderRow}
                >
                  <Text style={styles.boxHeaderTitle}>
                    {showStack ? "Hide" : "Show"} Stack Trace
                  </Text>
                  <Text style={styles.boxHeaderCaret}>
                    {showStack ? "\u25B2" : "\u25BC"}
                  </Text>
                </Pressable>
                {showStack && (
                  <ScrollView style={styles.boxScroll}>
                    <Text selectable style={styles.stackText}>
                      {formatStack(getStack(data.log))}
                    </Text>
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          {/* Single full-width capsule button at bottom */}
          <View
            style={[
              styles.footerBar,
              { paddingBottom: Math.max(16, insets.bottom) },
            ]}
          >
            <Text style={styles.helpText}>
              Copy details and paste them into chat
            </Text>
            <Animated.View style={{ transform: [{ scale: copyScale }] }}>
              <Pressable
                onPress={async () => {
                  const message = await onCopy();
                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  if (message) {
                    messenger.post({ type: "FIX_ERROR_MESSAGE", message });
                  }
                  dismiss();
                }}
                onPressIn={() => {
                  setCopyPressed(true);
                  Animated.spring(copyScale, {
                    toValue: 0.96,
                    useNativeDriver: true,
                    speed: 18,
                    bounciness: 9,
                  }).start();
                }}
                onPressOut={() => {
                  setCopyPressed(false);
                  Animated.spring(copyScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 14,
                    bounciness: 6,
                  }).start();
                }}
                accessibilityRole="button"
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Copy & Dismiss</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scrimPressable: { flex: 1 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    marginHorizontal: 0,
    marginBottom: 0,
    minHeight: Dimensions.get("window").height * 0.65, // 65% of screen height
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    backgroundColor: "#f4f4f4", // light background
    borderWidth: 0,
    borderColor: "#27272a", // neutral-800
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: "#f4f4f4",
    borderBottomWidth: 0,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    color: "#1c1c1c",
    fontWeight: "500",
    fontSize: 24,
    marginBottom: 10,
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  contentScrollContainer: {
    paddingBottom: 8,
  },
  contentPadding: {
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  messageText: {
    color: "#1c1c1c",
    fontSize: 17,
    marginBottom: 12,
  },
  boxContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#f4f4f4", // light background
  },
  boxHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f4f4f4", // light background
  },
  boxHeaderTitle: {
    color: "#1c1c1c",
    fontWeight: "600",
  },
  boxHeaderCaret: {
    color: "#1c1c1c",
  },
  boxScroll: {
    maxHeight: 256, // ~64 * 4
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stackText: {
    color: "#1c1c1c",
    fontSize: 12,
    lineHeight: 18,
  },
  footerBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f4f4f4",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  copyButton: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#202020",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  copyButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  helpText: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "400",
  },
  noCodeFrameContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#f4f4f4",
  },
  noCodeFrameText: {
    color: "#1c1c1c",
    fontSize: 14,
    fontStyle: "italic",
  },
});
