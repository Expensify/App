// Web: the picker uses the `value` attribute, which VoiceOver already announces.
// Avoid duplicating the selected label in the accessibility label.
const shouldAnnounceSelectedLabel = false;

export default shouldAnnounceSelectedLabel;
