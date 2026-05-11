import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import MigratedUserWelcomeModalGuard from '@libs/Navigation/AppNavigator/MigratedUserWelcomeModalGuard';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@hooks/useActiveRoute', () => ({
    __esModule: true,
    default: () => ({name: 'MigratedUserWelcomeModal'}),
}));

describe('MigratedUserWelcomeModalGuard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should navigate to report page when Let\'s go is pressed', () => {
        const {getByText} = render(<MigratedUserWelcomeModalGuard />);
        
        const letGoButton = getByText('Let\'s go!');
        fireEvent.press(letGoButton);
        
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT);
    });

    it('should navigate to previous route if available', () => {
        // Mock activeRoute to simulate a previous route
        jest.mock('@hooks/useActiveRoute', () => ({
            __esModule: true,
            default: () => ({name: 'Report'}),
        }));
        
        const {getByText} = render(<MigratedUserWelcomeModalGuard />);
        
        const letGoButton = getByText('Let\'s go!');
        fireEvent.press(letGoButton);
        
        expect(Navigation.navigate).toHaveBeenCalledWith('Report');
    });
});