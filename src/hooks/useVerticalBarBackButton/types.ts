/**
 * Shows a back button in the vertical bar for a header that has one.
 *
 * @param goBack - What a press on the button does, the same as a press on the header's own.
 * @param shouldShowBackButton - Whether the header has a back button at all. Defaults to true.
 */
type UseVerticalBarBackButton = (goBack: () => void, shouldShowBackButton?: boolean) => void;

export default UseVerticalBarBackButton;
