import type {GestureResponderEvent} from 'react-native';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type IconAsset from '@src/types/utils/IconAsset';

const CONTEXT_MENU_ICON_NAMES = [
    'Bell',
    'Bug',
    'ChatBubbleReply',
    'ChatBubbleUnread',
    'Checkmark',
    'Concierge',
    'Copy',
    'Download',
    'Exit',
    'Flag',
    'LinkCopy',
    'Mail',
    'Pencil',
    'Pin',
    'Stopwatch',
    'ThreeDots',
    'Trashcan',
] as const;

type BaseContextMenuActionParams = {
    translate: LocalizedTranslate;
};

type ContextMenuAction = {
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

export {CONTEXT_MENU_ICON_NAMES};
export type {BaseContextMenuActionParams, ContextMenuAction};
