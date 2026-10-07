/**
 * Exercises the production modal factory while the platform navigator retains lazy screen callbacks.
 */
import {render} from '@testing-library/react-native';

import {SearchReportActionsModalStackNavigator, TravelModalStackNavigator} from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import type createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import SCREENS from '@src/SCREENS';

import type {ParamListBase} from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';

import type createMock from '../utils/createMock';

// The platform substitute records registrations without loading their pages.
type ModalNavigator = ReturnType<typeof createPlatformStackNavigator<ParamListBase>>;
type ModalNavigatorProps = React.ComponentProps<ModalNavigator['Navigator']>;
type ModalScreenRegistration = {
    name: React.ComponentProps<ModalNavigator['Screen']>['name'];
    isLazyLoaderDefined: boolean;
    getOptions: (routeKey: string) => PlatformStackNavigationOptions;
};
const mockScreenRegistrations: ModalScreenRegistration[] = [];

jest.mock('@hooks/useThemeStyles', () => () => ({modalStackNavigatorContainer: {}, modalStackNavigatorContainerWidth: () => ({})}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));
jest.mock('@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions', () => jest.fn());
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    const {default: createNavigatorMock} = jest.requireActual<{default: typeof createMock}>('../utils/createMock');
    const createNavigator = (): Pick<ModalNavigator, 'Navigator' | 'Screen'> => ({
        Navigator: ({children}: ModalNavigatorProps) => ReactMock.createElement(View, null, children),
        Screen: ({name, getComponent, options}) => {
            mockScreenRegistrations.push({
                name,
                isLazyLoaderDefined: typeof getComponent === 'function',
                getOptions: (routeKey) => {
                    if (typeof options !== 'function') {
                        throw new Error('Expected a modal screen option callback');
                    }
                    // Keep the callback's route type inside its generic registration until the test requests options.
                    const route = Object.assign(createNavigatorMock<Parameters<typeof options>[0]['route']>({key: routeKey}), {name});
                    const optionArgs = Object.assign(createNavigatorMock<Parameters<typeof options>[0]>({}), {route});
                    return options(optionArgs);
                },
            });
            return null;
        },
    });
    return {__esModule: true, default: createNavigator};
});
jest.mock('@pages/Travel/MyTripsPage', () => {
    throw new Error('A lazy travel page was loaded during registration');
});
jest.mock('@pages/Search/SearchHoldReasonPage', () => {
    throw new Error('A lazy search page was loaded during registration');
});

beforeEach(() => {
    mockScreenRegistrations.length = 0;
});

describe('modal screen registrations', () => {
    it('retains travel registration order, lazy loaders and common options with push overrides', () => {
        // Given common options that conflict with the travel verification override
        const commonOptions: PlatformStackNavigationOptions = {animationTypeForReplace: 'pop', title: 'Travel options'};
        const getCommonOptions = jest.fn<ReturnType<ReturnType<typeof useModalStackScreenOptions>>, Parameters<ReturnType<typeof useModalStackScreenOptions>>>(() => commonOptions);
        jest.mocked(useModalStackScreenOptions).mockReturnValue(getCommonOptions);

        // When the real exported travel navigator registers its screens
        render(<TravelModalStackNavigator />);

        // Then every screen keeps its lazy callback and insertion order without requiring a page
        expect(mockScreenRegistrations.map(({name}) => name)).toEqual([
            SCREENS.TRAVEL.MY_TRIPS,
            SCREENS.TRAVEL.TRAVEL_DOT_LINK_WEB_VIEW,
            SCREENS.TRAVEL.DYNAMIC_UPGRADE,
            SCREENS.TRAVEL.DYNAMIC_TRIP_SUMMARY,
            SCREENS.TRAVEL.DYNAMIC_TRIP_DETAILS,
            SCREENS.TRAVEL.DYNAMIC_DOMAIN_PERMISSION_INFO,
            SCREENS.TRAVEL.DYNAMIC_PUBLIC_DOMAIN_ERROR,
            SCREENS.TRAVEL.DYNAMIC_WORKSPACE_CONFIRMATION,
            SCREENS.TRAVEL.DYNAMIC_VERIFY_ACCOUNT,
            SCREENS.TRAVEL.ENABLE,
        ]);
        expect(mockScreenRegistrations.every(({isLazyLoaderDefined}) => isLazyLoaderDefined)).toBe(true);
        expect(getCommonOptions).not.toHaveBeenCalled();
        const defaultScreen = mockScreenRegistrations.find(({name}) => name === SCREENS.TRAVEL.MY_TRIPS);
        const verifyScreen = mockScreenRegistrations.find(({name}) => name === SCREENS.TRAVEL.DYNAMIC_VERIFY_ACCOUNT);
        expect(defaultScreen).toBeDefined();
        expect(verifyScreen).toBeDefined();
        if (!defaultScreen || !verifyScreen) {
            throw new Error('Expected travel screen registrations');
        }
        const route = {key: 'travel-route', name: SCREENS.TRAVEL.MY_TRIPS};
        const verifyRoute = {key: 'verify-route', name: SCREENS.TRAVEL.DYNAMIC_VERIFY_ACCOUNT};
        const defaultOptions = defaultScreen.getOptions(route.key);
        const verifyOptions = verifyScreen.getOptions(verifyRoute.key);
        expect(defaultOptions).toEqual(commonOptions);
        expect(verifyOptions).toEqual({...commonOptions, animationTypeForReplace: 'push'});
        expect(getCommonOptions.mock.calls).toEqual([[{route}], [{route: verifyRoute}]]);
    });

    it('applies NONE after common search options while retaining routes without overrides', () => {
        // Given common search animation and a route that does not override it
        const commonOptions: PlatformStackNavigationOptions = {animation: Animations.SLIDE_FROM_RIGHT, title: 'Search options'};
        const getCommonOptions = jest.fn<ReturnType<ReturnType<typeof useModalStackScreenOptions>>, Parameters<ReturnType<typeof useModalStackScreenOptions>>>(() => commonOptions);
        jest.mocked(useModalStackScreenOptions).mockReturnValue(getCommonOptions);

        // When the real search report actions navigator registers its screens
        render(<SearchReportActionsModalStackNavigator />);

        // Then the first registrations stay ordered and the hold route wins over common animation
        expect(mockScreenRegistrations.slice(0, 3).map(({name}) => name)).toEqual([
            SCREENS.SEARCH.DYNAMIC_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS,
            SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS,
            SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP,
        ]);
        expect(mockScreenRegistrations).toHaveLength(21);
        expect(mockScreenRegistrations.every(({isLazyLoaderDefined}) => isLazyLoaderDefined)).toBe(true);
        const holdScreen = mockScreenRegistrations.at(0);
        const defaultScreen = mockScreenRegistrations.find(({name}) => name === SCREENS.SEARCH.CHANGE_APPROVER.ROOT);
        expect(holdScreen).toBeDefined();
        expect(defaultScreen).toBeDefined();
        if (!holdScreen || !defaultScreen) {
            throw new Error('Expected search screen registrations');
        }
        const holdOptions = holdScreen.getOptions('hold-route');
        const defaultOptions = defaultScreen.getOptions('approver-route');
        expect(holdOptions).toEqual({...commonOptions, animation: Animations.NONE});
        expect(defaultOptions).toEqual(commonOptions);
        expect(getCommonOptions).toHaveBeenCalledTimes(2);
    });
});
