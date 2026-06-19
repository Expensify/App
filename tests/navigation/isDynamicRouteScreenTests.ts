import isDynamicRouteScreen from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteScreen';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

describe('isDynamicRouteScreen', () => {
    it('should return true for a static dynamic route screen (DYNAMIC_VERIFY_ACCOUNT)', () => {
        expect(isDynamicRouteScreen(SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT)).toBe(true);
    });

    it('should return true for a multi-segment dynamic route screen (DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT)', () => {
        expect(isDynamicRouteScreen(SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT)).toBe(true);
    });

    it('should return true for a parametric dynamic route screen (DYNAMIC_FLAG_COMMENT)', () => {
        expect(isDynamicRouteScreen(SCREENS.DYNAMIC_FLAG_COMMENT)).toBe(true);
    });

    it('should return true for DYNAMIC_KEYBOARD_SHORTCUTS', () => {
        expect(isDynamicRouteScreen(SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS)).toBe(true);
    });

    it('should return true for DYNAMIC_ADDRESS_COUNTRY', () => {
        expect(isDynamicRouteScreen(SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_COUNTRY)).toBe(true);
    });

    it('should return false for a regular screen (HOME)', () => {
        expect(isDynamicRouteScreen(SCREENS.HOME)).toBe(false);
    });

    it('should return false for a regular screen (REPORT)', () => {
        expect(isDynamicRouteScreen(SCREENS.REPORT)).toBe(false);
    });

    it('should return false for a regular settings screen (Settings_Root)', () => {
        expect(isDynamicRouteScreen(SCREENS.SETTINGS.ROOT)).toBe(false);
    });

    it('should return false for a screen name not present in normalizedConfigs', () => {
        expect(isDynamicRouteScreen('NonExistentScreen_12345' as Screen)).toBe(false);
    });
});
