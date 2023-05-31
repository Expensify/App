// On Android the window height does not include the status bar height, so we need to add it manually.
export default function getWindowHeightAdjustment(insets) {
    return insets.top;
}
