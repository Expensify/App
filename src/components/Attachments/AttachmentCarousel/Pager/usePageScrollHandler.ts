import type {PagerViewProps} from 'react-native-pager-view';
import {useEvent, useHandler} from 'react-native-reanimated';

type PageScrollHandler = NonNullable<PagerViewProps['onPageScroll']>;
type OnPageScrollEventData = Parameters<PageScrollHandler>[0]['nativeEvent'];
type OnPageScrollREAHandler = Parameters<typeof useHandler<OnPageScrollEventData, Record<string, unknown>>>[0][string];

type Handlers = {
    onPageScroll?: OnPageScrollREAHandler;
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
