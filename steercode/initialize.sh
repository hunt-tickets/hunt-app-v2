#!/usr/bin/env bash

bun expo install expo-clipboard modern-screenshot react-native-safe-area-context expo-haptics
bunx patch-package --patch-dir .steercode/patches
