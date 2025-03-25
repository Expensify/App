// Selection position returned from react-native-keyboard-controller is platform-dependent, so set different paddings for Android and iOS.
function getBottomSuggestionPadding(): number {
    return 30;
}

export default getBottomSuggestionPadding;
