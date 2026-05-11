import React from 'react';
import {render} from '@testing-library/react-native';
import Navigation from '../../src/libs/Navigation/Navigation';
import linkingConfig from '../../src/libs/Navigation/linkingConfig';

jest.mock('../../src/libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(),
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

describe('Navigation - Deep Link Back Navigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reset to home tab when going back from a deep-linked report', () => {
        // Mock the active route as a deep-linked report
        Navigation.getActiveRoute.mockReturnValue({
            name: 'Report',
            params: {reportID: '123', isFromDeepLink: true},
        });

        // Call goBack
        Navigation.goBack();

        // Expect navigation to reset to Home
        expect(Navigation.navigate).toHaveBeenCalledWith('Home');
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('should not reset to home tab when going back from a normal report', () => {
        // Mock the active route as a normal report (not from deep link)
        Navigation.getActiveRoute.mockReturnValue({
            name: 'Report',
            params: {reportID: '123'},
        });

        // Call goBack
        Navigation.goBack();

        // Expect normal goBack to be called
        expect(Navigation.goBack).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should handle missing active route gracefully', () => {
        // Mock no active route
        Navigation.getActiveRoute.mockReturnValue(null);

        // Call goBack
        Navigation.goBack();

        // Expect normal goBack to be called
        expect(Navigation.goBack).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
