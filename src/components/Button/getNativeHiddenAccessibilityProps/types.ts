type NativeHiddenAccessibilityProps = {
    accessible: false;
    focusable: false;
    accessibilityElementsHidden: true;
    importantForAccessibility: 'no-hide-descendants';
};

type WebHiddenAccessibilityProps = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'aria-hidden': true;
};

type HiddenAccessibilityProps = NativeHiddenAccessibilityProps | WebHiddenAccessibilityProps;

type GetNativeHiddenAccessibilityProps = (enableNativeDisabled: boolean, isDisabledOrLoading: boolean) => HiddenAccessibilityProps | undefined;

export type {HiddenAccessibilityProps, NativeHiddenAccessibilityProps, WebHiddenAccessibilityProps};
export default GetNativeHiddenAccessibilityProps;
