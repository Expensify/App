import type {ComponentRef, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps, View} from 'react-native';

type UseKeepSubmitButtonInViewParams = {
    /** Whether the form scrolls its submit button into view */
    isEnabled: boolean;

    /** The scroll view of the form */
    scrollViewRef: RefObject<ComponentRef<typeof ScrollView> | null>;

    /** The content of the form, which the focused input is measured against */
    contentRef: RefObject<ComponentRef<typeof View> | null>;
};

type UseKeepSubmitButtonInView = (params: UseKeepSubmitButtonInViewParams) => Pick<ScrollViewProps, 'onLayout' | 'onContentSizeChange'>;

// eslint-disable-next-line import/prefer-default-export
export type {UseKeepSubmitButtonInView};
