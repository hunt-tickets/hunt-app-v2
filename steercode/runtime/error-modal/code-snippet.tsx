/** @jsxImportSource react */
// CodeSnippet.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";

type CodeFrameData = {
  content: string;
  fileName: string;
  location: {
    row: number;
    column: number;
  };
};

type Props = {
  codeFrame: CodeFrameData;
};

export default function CodeSnippet({ codeFrame }: Props) {
  const [showCodeFrame, setShowCodeFrame] = useState(false);

  const renderFormattedCode = (text: string) => {
    if (!text) return null;

    // Strip all ANSI codes - this should give us perfect formatting like clipboard
    const cleanText = text.replace(/\u001b\[[0-9;]*m/g, "");

    // Split into lines and render each line separately to allow horizontal scrolling
    const lines = cleanText.split("\n");
    const maxLineLength = Math.max(...lines.map((line) => line.length));
    const minWidth = Math.max(400, maxLineLength * 8); // Approximate character width

    return (
      <View style={{ minWidth }}>
        {lines.map((line, index) => (
          <Text
            key={index}
            style={[styles.codeFrameText, { color: "#1c1c1c" }]}
          >
            {line}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowCodeFrame(!showCodeFrame);
        }}
        style={({ pressed }) => [
          styles.dropdownButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.dropdownButtonText}>
          {showCodeFrame ? "Hide" : "Show"} Code Snippet
        </Text>
        <Text style={styles.dropdownArrow}>{showCodeFrame ? "▲" : "▼"}</Text>
      </Pressable>

      {showCodeFrame && (
        <View style={styles.codeFrameContainer}>
          <View style={styles.codeFrameHeader}>
            <Text style={styles.codeFrameHeaderText}>
              {codeFrame.fileName.split("/").pop()}
              {codeFrame.location &&
                `:${codeFrame.location.row}:${codeFrame.location.column}`}
            </Text>
          </View>
          <ScrollView
            style={styles.codeFrameScroll}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.scrollContent}
          >
            <ScrollView
              style={styles.verticalScroll}
              horizontal={false}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
            >
              {renderFormattedCode(codeFrame.content)}
            </ScrollView>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f4f4f4", // light background
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#1c1c1c",
    fontWeight: "600",
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#1c1c1c",
  },
  codeFrameContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
    backgroundColor: "#f4f4f4", // light background
  },
  codeFrameHeader: {
    backgroundColor: "#f4f4f4", // light background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  codeFrameHeaderText: {
    fontSize: 12,
    color: "#1c1c1c",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "Monaco, monospace",
    }),
    fontWeight: "600",
  },
  codeFrameScroll: {
    backgroundColor: "#f4f4f4", // light background
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 256, // Limit vertical height to match stack trace
  },
  verticalScroll: {
    maxHeight: 232, // Account for new padding (256 - 12*2)
  },
  scrollContent: {
    paddingRight: 20, // Extra padding for horizontal scrolling
  },
  codeFrameTextContainer: {
    // Container for properly formatted code text
  },
  codeFrameText: {
    fontSize: 12,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "Monaco, monospace",
    }),
    lineHeight: 18,
    textAlign: "left",
    ...Platform.select({
      web: {
        whiteSpace: "pre" as any, // Prevent wrapping on web
        wordBreak: "keep-all" as any,
      },
    }),
  },
});
