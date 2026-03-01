/* eslint-disable import/prefer-default-export -- type-only module */
import type {GestureResponderEvent} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';

type ActionDescriptor = {
    id: string;
    icon: IconAsset;
    text: string;
    onPress: (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => void;
    successIcon?: IconAsset;
    successText?: string;
    description?: string;
    isAnonymousAction?: boolean;
    disabled?: boolean;
    shouldShowLoadingSpinnerIcon?: boolean;
    shouldPreventDefaultFocusOnPress?: boolean;
    sentryLabel: string;
};

export type {ActionDescriptor};
