import { useSharedValue } from 'react-native-reanimated';
import { useCallback } from 'react';

export function useScrollAnimation() {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const scrollDirection = useSharedValue<'up' | 'down'>('up');

  const onScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // Determine scroll direction
    if (currentScrollY > lastScrollY.value) {
      scrollDirection.value = 'down';
    } else {
      scrollDirection.value = 'up';
    }
    
    scrollY.value = Math.max(0, currentScrollY);
    lastScrollY.value = currentScrollY;
  }, [scrollY, lastScrollY, scrollDirection]);

  return {
    scrollY,
    scrollDirection,
    onScroll,
  };
}