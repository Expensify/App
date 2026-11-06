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

type UseKeyboardDrivenScroll = (scrollableRef: RefObject<KeyboardScrollable | null> | undefined) => ScrollWithKeyboard;

export type {KeyboardScrollTarget, KeyboardScrollable, ScrollWithKeyboard, UseKeyboardDrivenScroll};
