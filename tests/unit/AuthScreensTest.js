import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnyxProvider} from 'react-native-onyx';
import AuthScreens from '@libs/Navigation/AppNavigator/AuthScreens';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';

// Mock Navigation
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    resetToHome: jest.fn(),
    navigationRef: {
        current: {
            dispatch: jest.fn(),
        },
    },
}));

// Mock useRoute
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        dispatch: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
        name: 'Home',
    }),
}));

const Stack = createNativeStackNavigator();

describe('AuthScreens', () => {
    const renderComponent = (props = {}) => {
        return render(
            <OnyxProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="AuthScreens">
                            {() => <AuthScreens {...props} />}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </OnyxProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call resetToHome when navigating back from deep-linked report', () => {
        // Simulate the scenario where user came from a deep link
        const route = {
            params: {exitTo: ROUTES.REPORT},
            name: 'Report',
        };
        
        // Mock useRoute to return the deep link route
        jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue(route);
        
        renderComponent({
            isAuthenticated: true,
            pendingDeepLink: null,
        });
        
        // Simulate navigation back
        jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
            params: {},
            name: 'Home',
        });
        
        // Trigger re-render
        renderComponent({
            isAuthenticated: true,
            pendingDeepLink: null,
        });
        
        expect(Navigation.resetToHome).toHaveBeenCalled();
    });

    it('should not call resetToHome when navigating normally', () => {
        renderComponent({
            isAuthenticated: true,
            pendingDeepLink: null,
        });
        
        expect(Navigation.resetToHome).not.toHaveBeenCalled();
    });
});