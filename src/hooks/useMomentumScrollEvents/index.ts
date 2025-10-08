import {useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';

function useMomentumScrollEvents() {
    const lastScrollEvent = useRef<number | null>(null);
    const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
    const updateInProgress = useRef<boolean>(false);

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     */
    const emitOnScroll = () => {
        if (updateInProgress.current) {
            return;
        }

        updateInProgress.current = true;
        DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
    };

    /**
     * Emits when the scrolling has ended.
     */
    const emitOnScrollEnd = () => {
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
    const emitScrollEvents = () => {
        emitOnScroll();

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
                emitOnScrollEnd();
            }, 250);
        }

        lastScrollEvent.current = timestamp;
    };

    return emitScrollEvents;
}

export default useMomentumScrollEvents;
