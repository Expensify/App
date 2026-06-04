import {isMobile} from '@libs/Browser';

const getAccessibilityLabelConfig = () => {
    // Mobile Web: the picker uses the `value` attribute, which VoiceOver already announces.
    // Avoid duplicating the selected label in the accessibility label.
    return {
        shouldAnnounceSelectedLabel: false,
        shouldUseCustomAccessibilityLabel: isMobile(),
    };
};

export default getAccessibilityLabelConfig;
