import type {PagerViewProps} from 'react-native-pager-view';
import {useEvent, useHandler} from 'react-native-reanimated';

type PageScrollHandler = NonNullable<PagerViewProps['onPageScroll']>;

type PageScrollEventData = Parameters<PageScrollHandler>[0]['nativeEvent'];
type PageScrollContext = Record<string, unknown>;

// Reanimated doesn't expose the type for animated event handlers, therefore we must infer it from the useHandler hook.
// The AnimatedPageScrollHandler type is the type of the onPageScroll prop from react-native-pager-view as an animated handler.
type AnimatedHandlers = Parameters<typeof useHandler<PageScrollEventData, PageScrollContext>>[0];
type AnimatedPageScrollHandler = AnimatedHandlers[string];

type Handlers = {
    onPageScroll?: AnimatedPageScrollHandler;
};
type Deps = Parameters<typeof useHandler>[1];

const usePageScrollHandler = (handlers: Handlers, dependencies: Deps): PageScrollHandler => {
    const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
    const subscribeForEvents = ['onPageScroll'];

    return useEvent(
        (event) => {
            'worklet';

            const {onPageScroll} = handlers;
            if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
                onPageScroll(event, context);
            }
        },
        subscribeForEvents,
        doDependenciesDiffer,
    );
};

export default usePageScrollHandler;
