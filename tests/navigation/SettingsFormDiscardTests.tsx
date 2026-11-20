import {act, render, waitFor} from '@testing-library/react-native';

import type * as DiscardHookModule from '@hooks/useDiscardChangesConfirmation';
import useFlowDiscardChangesConfirmation from '@hooks/useFlowDiscardChangesConfirmation';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer, StackActions, useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';

jest.mock('@react-navigation/native', () => jest.requireActual<typeof ReactNavigation>('@react-navigation/native'));
jest.mock('@hooks/useDiscardChangesConfirmation', () => jest.requireActual<typeof DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.ts'));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal').default);
jest.mock('@components/Modal/Global/ModalContext', () => jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal').createMockModalContextModule());
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));

const EDITOR = SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS;
const VERIFICATION = SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE;
const BANK = SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT;
const WALLET = SCREENS.SETTINGS.WALLET.ROOT;
const TEST_SCREENS = [EDITOR, VERIFICATION, BANK, WALLET];
const RootStack = createRootStackNavigator();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const RightModal = createSplitNavigator<RightModalNavigatorParamList>();
const Settings = createPlatformStackNavigator<ParamListBase>();
let rhpNavigation: Pick<NavigationProp<ParamListBase>, 'goBack'> | undefined;
let flowNames: readonly string[] = [];
let pendingInput = '';
const discard = jest.fn(() => {
    pendingInput = '';
});

function EmptyScreen() {
    return null;
}

function GuardedStep() {
    useFlowDiscardChangesConfirmation({screenNames: flowNames, getHasUnsavedChanges: () => !!pendingInput, onDiscard: discard});
    return null;
}

function SettingsStack() {
    return (
        <Settings.Navigator>
            {TEST_SCREENS.map((name) => (
                <Settings.Screen
                    key={name}
                    name={name}
                    component={name === WALLET ? EmptyScreen : GuardedStep}
                />
            ))}
        </Settings.Navigator>
    );
}

function RightModalStack() {
    const navigation = useNavigation();
    useEffect(() => {
        rhpNavigation = navigation;
        return () => {
            rhpNavigation = undefined;
        };
    }, [navigation]);
    return (
        <RightModal.Navigator
            defaultCentralScreen={SCREENS.RIGHT_MODAL.SETTINGS}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <RightModal.Screen
                name={SCREENS.RIGHT_MODAL.SETTINGS}
                component={SettingsStack}
            />
        </RightModal.Navigator>
    );
}

function Tabs() {
    return (
        <TabNav.Navigator>
            <TabNav.Screen
                name={SCREENS.HOME}
                component={EmptyScreen}
            />
        </TabNav.Navigator>
    );
}

function renderFlow(openSteps: string[], names: readonly string[]) {
    flowNames = names;
    return render(
        <NavigationContainer
            ref={navigationRef}
            initialState={{
                index: 1,
                routes: [
                    {name: NAVIGATORS.TAB_NAVIGATOR, state: {routes: [{name: SCREENS.HOME}]}},
                    {
                        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                        state: {routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS, state: {index: openSteps.length - 1, routes: openSteps.map((name) => ({name}))}}]},
                    },
                ],
            }}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.TAB_NAVIGATOR}
                    component={Tabs}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    component={RightModalStack}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
}

function clickOutside() {
    act(() => rhpNavigation?.goBack());
}

describe('Settings form operation guards (web)', () => {
    beforeEach(() => {
        resetMockConfirmModal();
        discard.mockClear();
        pendingInput = 'Unsaved input';
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it.each([
        {steps: [EDITOR, VERIFICATION], names: [EDITOR, VERIFICATION]},
        {steps: [BANK, BANK], names: [BANK]},
    ])('Cancel preserves input and only Discard cleans it up: %p', async ({steps, names}) => {
        // Given a dirty editor covered by verification or a later bank substep
        renderFlow(steps, names);
        // When abandonment is attempted and then cancelled
        clickOutside();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(discard).not.toHaveBeenCalled();
        await act(async () => resolveShowConfirmModal({action: MockModalActions.CLOSE}));
        // Then the RHP and values remain until a subsequent confirmed discard
        expect(pendingInput).toBe('Unsaved input');
        expect(navigationRef.current?.getRootState().routes).toHaveLength(2);
        clickOutside();
        await act(async () => resolveShowConfirmModal({action: MockModalActions.CONFIRM}));
        await waitFor(() => expect(navigationRef.current?.getRootState().routes).toHaveLength(1));
        expect(discard).toHaveBeenCalledTimes(1);
        expect(pendingInput).toBe('');
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
    });

    it('returns from verification to the retained editor without prompting or clearing changes', () => {
        // Given the editor owns the pending operation beneath verification
        renderFlow([EDITOR, VERIFICATION], [EDITOR, VERIFICATION]);
        // When only verification is popped
        act(() => navigationRef.current?.goBack());
        // Then internal Back does not abandon the operation
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(discard).not.toHaveBeenCalled();
        expect(pendingInput).toBe('Unsaved input');
    });

    it('elects direct-linked verification as owner when no editor exists underneath', () => {
        // Given verification was directly opened with pending changes
        renderFlow([VERIFICATION], [EDITOR, VERIFICATION]);
        // When the RHP is dismissed
        clickOutside();
        // Then verification itself provides fallback protection
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(discard).not.toHaveBeenCalled();
    });

    it('does not bypass confirmation for an unrelated replacement inside Settings', () => {
        // Given Settings hosts both the dirty editor and Wallet
        renderFlow([EDITOR], [EDITOR, VERIFICATION]);
        const key = navigationRef.current?.getRootState().routes.at(-1)?.state?.routes.at(0)?.state?.key;
        // When navigation replaces the pending operation with Wallet
        act(() => navigationRef.current?.dispatch({...StackActions.replace(WALLET), target: key}));
        // Then sharing a navigator does not grant a discard bypass
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });
});
