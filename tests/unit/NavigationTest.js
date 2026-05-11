import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Navigation from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// Mock the navigation ref
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

const TestNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name={SCREENS.HOME} component={() => null} />
            <Stack.Screen name={SCREENS.REPORT} component={() => null} />
        </Stack.Navigator>
    </NavigationContainer>
);

describe('Navigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reset navigation to home screen', () => {
        const dispatchSpy = jest.spyOn(Navigation.navigationRef.current, 'dispatch');
        
        Navigation.resetToHome();
        
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'RESET',
                payload: expect.objectContaining({
                    index: 0,
                    routes: expect.arrayContaining([
                        expect.objectContaining({
                            name: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
                            state: expect.objectContaining({
                                routes: expect.arrayContaining([
                                    expect.objectContaining({
                                        name: SCREENS.HOME,
                                    }),
                                ]),
                            }),
                        }),
                    ]),
                }),
            })
        );
    });

    it('should handle empty navigation ref gracefully', () => {
        // Temporarily set navigationRef to null
        const originalRef = Navigation.navigationRef.current;
        Navigation.navigationRef.current = null;
        
        expect(() => Navigation.resetToHome()).not.toThrow();
        
        // Restore original ref
        Navigation.navigationRef.current = originalRef;
    });
});