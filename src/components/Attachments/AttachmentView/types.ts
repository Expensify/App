import type {GestureResponderEvent} from 'react-native';
import type {AttachmentFile} from '@components/Attachments/types';

type AttachmentViewBaseProps = {
    /** Whether this view is the active screen  */
    isFocused?: boolean;

    /** Whether this AttachmentView is shown as part of a AttachmentCarousel */
    isUsedInCarousel?: boolean;

    /** File object can be an instance of File or Object */
    file?: AttachmentFile;

    isAuthTokenRequired?: boolean;

    /** When "isUsedInCarousel" is set to true, determines whether there is only one item in the carousel */
    isSingleCarouselItem?: boolean;

    /** Whether this AttachmentView is shown as part of an AttachmentModal */
    isUsedInAttachmentModal?: boolean;

    /** The index of the carousel item */
    carouselItemIndex?: number;

    /** The index of the currently active carousel item */
    carouselActiveItemIndex?: number;

    /** Function for handle on press */
    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;

    /** Function for handle on error */
    onError?: () => void;

    /** Handles scale changed event */
    onScaleChanged?: (scale: number) => void;
};

export default AttachmentViewBaseProps;
