import {useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';

type UseEmitComposerScrollEventsOptions = {
    enabled?: boolean;
    inverted: boolean | null | undefined;
};

/**
 * This is used to trigger scroll behavior in the composer on web. On native, this is a no-op.
 * The scroll events are only emitted when the list is inverted, since it is only used in the report screen in combination with the composer.
 * Since our custom FlatList implementation can either be a `KeyboardDismissibleFlatList` or a regular `FlatList`,
 * we need to emit the scroll events inside the scroll handler of the specific implementation.
 * @param inverted - Whether the list is inverted.
 * @returns A function that can be used to emit the scroll events.
 */
function useEmitComposerScrollEvents(options?: UseEmitComposerScrollEventsOptions) {
    const {enabled = true, inverted} = options ?? {};

    const lastScrollEvent = useRef<number | null>(null);
    const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
    const updateInProgress = useRef<boolean>(false);

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     */
    const onScroll = () => {
        if (!enabled || !inverted) {
            return;
        }

        if (updateInProgress.current) {
            return;
        }

        updateInProgress.current = true;
        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
    };

    /**
     * Emits when the scrolling has ended.
     */
    const onScrollEnd = () => {
        if (!enabled || !inverted) {
            return;
        }

        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        updateInProgress.current = false;
    };

    /**
     * Decides whether the scrolling has ended or not. If it has ended,
     * then it calls the onScrollEnd function. Otherwise, it calls the
     * onScroll function and pass the event to it.
     *
     * This is a temporary work around, since react-native-web doesn't
     * support onScrollBeginDrag and onScrollEndDrag props for FlatList.
     * More info:
     * https://github.com/necolas/react-native-web/pull/1305
     *
     * This workaround is taken from below and refactored to fit our needs:
     * https://github.com/necolas/react-native-web/issues/1021#issuecomment-984151185
     *
     */
    const emitComposerScrollEvents = () => {
        if (!enabled || !inverted) {
            return;
        }

        onScroll();

        const timestamp = Date.now();

        if (scrollEndTimeout.current) {
            clearTimeout(scrollEndTimeout.current);
        }

        if (lastScrollEvent.current) {
            scrollEndTimeout.current = setTimeout(() => {
                if (lastScrollEvent.current !== timestamp) {
                    return;
                }
                // Scroll has ended
                lastScrollEvent.current = null;
                onScrollEnd();
            }, 250);
        }

        lastScrollEvent.current = timestamp;
    };

    return emitComposerScrollEvents;
}

export default useEmitComposerScrollEvents;
