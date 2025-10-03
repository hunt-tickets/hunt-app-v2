import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to tabs immediately
  return <Redirect href="/(tabs)" />;
}