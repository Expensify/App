type NativeHiddenAccessibilityProps = {
    accessible: false;
    focusable: false;
    accessibilityElementsHidden: true;
    importantForAccessibility: 'no-hide-descendants';
};

type GetNativeHiddenAccessibilityProps = (enableNativeDisabled: boolean, isDisabledOrLoading: boolean) => NativeHiddenAccessibilityProps | undefined;

export type {NativeHiddenAccessibilityProps};
export default GetNativeHiddenAccessibilityProps;
