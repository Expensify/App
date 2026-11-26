import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports -- type only
import type {ScrollView} from 'react-native';
import type {AnimatedRef} from 'react-native-reanimated';

type KeyboardScrollable = ComponentRef<typeof ScrollView>;

type ScrollWithKeyboardOptions = {
    /** By default, a drag since the input got focus cancels the call, as the user scrolled away from it. Pass true for calls that aren't a reaction to a focus, e.g. the keyboard reopening for an input that kept it. */
    shouldIgnoreEarlierDrag?: boolean;
};

/**
 * For a focused input only, and offsets past the end stop at the end. On native it follows the keyboard and re-applies
 * the offset for 2 s or until focus moves. On web it scrolls once the transition is over, as there are no keyboard frames.
 */
type ScrollWithKeyboard = (offset: number, options?: ScrollWithKeyboardOptions) => void;

type UseKeyboardDrivenScroll = (scrollableRef: AnimatedRef<KeyboardScrollable>) => ScrollWithKeyboard;

export type {KeyboardScrollable, ScrollWithKeyboard, ScrollWithKeyboardOptions, UseKeyboardDrivenScroll};
