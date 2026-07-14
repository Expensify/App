import type {AnimatedFlashListWithCellRendererProps} from '@components/AnimatedFlashListWithCellRenderer';
import AnimatedFlashListWithCellRenderer from '@components/AnimatedFlashListWithCellRenderer';

import {useComposedEventHandler} from 'react-native-reanimated';

import {useKeyboardDismissibleFlashListActions} from './KeyboardDismissibleFlashListContext';

function KeyboardDismissibleFlashList<T>({onScroll: onScrollProp, inverted, ref, ...restProps}: AnimatedFlashListWithCellRendererProps<T>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlashListActions();

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, onScrollProp ?? null]);

    return (
        <AnimatedFlashListWithCellRenderer
            {...restProps}
            inverted={inverted}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

export default KeyboardDismissibleFlashList;
