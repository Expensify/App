import type {ComponentRef, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, TextInput, View} from 'react-native';

type ScrollFocusedInputToTop = (
    scrollViewRef: RefObject<ComponentRef<typeof ScrollView> | null>,
    /** A view wrapping the whole scroll view content, used as the origin to measure the input against. */
    scrollContentRef: RefObject<ComponentRef<typeof View> | null>,
    inputRef: RefObject<Pick<TextInput, 'isFocused' | 'measureLayout'> | null>,
) => void;

// eslint-disable-next-line import/prefer-default-export
export type {ScrollFocusedInputToTop};
