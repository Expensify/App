import type {FlashListRef} from '@shopify/flash-list';

// No-op on native. Inverted wheel handling is only needed on web where the
// inverted `scaleY: -1` transform reverses wheel direction.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useInvertedWheelHandler<T>(ref: React.RefObject<FlashListRef<T> | null>) {}

export default useInvertedWheelHandler;
