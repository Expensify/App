import getNativeHiddenAccessibilityPropsNative from '@src/components/Button/getNativeHiddenAccessibilityProps/index.native';

const sharedAccessibilityModule: {default: typeof getNativeHiddenAccessibilityPropsNative} = jest.requireActual('@src/components/Button/getNativeHiddenAccessibilityProps/index.ts');

const getNativeHiddenAccessibilityPropsShared = sharedAccessibilityModule.default;

describe('Button getNativeHiddenAccessibilityProps', () => {
    it('returns hidden accessibility props for the shared web implementation when fully disabled', () => {
        expect(getNativeHiddenAccessibilityPropsShared(true, true)).toEqual({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'aria-hidden': true,
        });
    });

    it('returns undefined for the shared web implementation when enableNativeDisabled is false', () => {
        expect(getNativeHiddenAccessibilityPropsShared(false, true)).toBeUndefined();
    });

    it('returns undefined for the shared web implementation when the button is enabled', () => {
        expect(getNativeHiddenAccessibilityPropsShared(true, false)).toBeUndefined();
    });

    it('returns hidden accessibility props for the native implementation when fully disabled', () => {
        expect(getNativeHiddenAccessibilityPropsNative(true, true)).toEqual({
            accessible: false,
            focusable: false,
            accessibilityElementsHidden: true,
            importantForAccessibility: 'no-hide-descendants',
        });
    });

    it('returns undefined for the native implementation when enableNativeDisabled is false', () => {
        expect(getNativeHiddenAccessibilityPropsNative(false, true)).toBeUndefined();
    });

    it('returns undefined for the native implementation when the button is enabled', () => {
        expect(getNativeHiddenAccessibilityPropsNative(true, false)).toBeUndefined();
    });
});
