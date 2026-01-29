import * as Browser from '@libs/Browser';
import type ShouldUseEmojiPickerSelection from './types';

const isMobileChrome = Browser.isMobileChrome();

const shouldUseEmojiPickerSelection: ShouldUseEmojiPickerSelection = () => isMobileChrome;

export default shouldUseEmojiPickerSelection;
