import {PagerViewProps} from 'react-native-pager-view';
import {useEvent, useHandler} from 'react-native-reanimated';

type PageScrollHandler = NonNullable<PagerViewProps['onPageScroll']>;
type PageScrollHandlerParams = Parameters<PageScrollHandler>;
const usePageScrollHandler = (handlers: PageScrollHandlerParams[0], dependencies: PageScrollHandlerParams[1]): PageScrollHandler => {
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
