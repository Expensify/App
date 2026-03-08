/**
 * Native: Uses accessible + accessibilityLabel for iOS VoiceOver / Android TalkBack.
 * The opacity:0 Text element used on web doesn't work reliably on native.
 */
import type {GetProgressBarA11yProps} from './types';

const getProgressBarA11yProps: GetProgressBarA11yProps = (label) => ({
    accessible: !!label,
    accessibilityLabel: label,
});

export default getProgressBarA11yProps;
