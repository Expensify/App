import type {ComponentRef, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports -- type only
import type {ScrollView} from 'react-native';

/** Where to scroll once the keyboard is open. */
type KeyboardScrollTarget = {
    /** Offsets past the end stop at the end. */
    offset: number;
};

type KeyboardScrollable = ComponentRef<typeof ScrollView>;

/** Scrolls to the target with the keyboard. Returns false on web, where the caller scrolls on its own. */
type ScrollWithKeyboard = (target: KeyboardScrollTarget) => boolean;

type KeyboardDrivenScroll = {
    scrollWithKeyboard: ScrollWithKeyboard;

    /** Call it when the input blurs. Moving to another input keeps the keyboard open, so the old target would otherwise still be applied. */
    cancelScrollWithKeyboard: () => void;
};

type UseKeyboardDrivenScroll = (scrollableRef: RefObject<KeyboardScrollable | null> | undefined) => KeyboardDrivenScroll;

export type {KeyboardDrivenScroll, KeyboardScrollTarget, KeyboardScrollable, ScrollWithKeyboard, UseKeyboardDrivenScroll};
