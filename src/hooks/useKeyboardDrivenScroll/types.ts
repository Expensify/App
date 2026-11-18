import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports -- type only
import type {ScrollView} from 'react-native';
import type {AnimatedRef} from 'react-native-reanimated';

type KeyboardScrollable = ComponentRef<typeof ScrollView>;

/**
 * For a focused input only, and offsets past the end stop at the end. On native it follows the keyboard and re-applies
 * the offset for 2 s or until focus moves. On web it scrolls once the transition is over, as there are no keyboard frames.
 */
type ScrollWithKeyboard = (offset: number) => void;

type UseKeyboardDrivenScroll = (scrollableRef: AnimatedRef<KeyboardScrollable>) => ScrollWithKeyboard;

export type {KeyboardScrollable, ScrollWithKeyboard, UseKeyboardDrivenScroll};
