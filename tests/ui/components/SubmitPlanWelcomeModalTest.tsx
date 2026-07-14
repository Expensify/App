import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SubmitPlanWelcomeModal from '@components/SubmitPlanWelcomeModal';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ViewProps} from 'react-native';
import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

const mockAutoCreateSubmitWorkspace = jest.fn();
const mockGoBack = jest.fn();
const mockSetSubmitMigrationModalShown = jest.fn();

// Capture the callback the modal registers with useBeforeRemove so we can simulate the modal being
// removed from the navigation stack and assert the shown-state persistence fires.
let beforeRemoveCallback: (() => void) | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useBeforeRemove', () => (callback: () => void) => {
    beforeRemoveCallback = callback;
});

jest.mock('@hooks/useAutoCreateSubmitWorkspace', () => () => mockAutoCreateSubmitWorkspace);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({firstName: 'John', lastName: 'Doe'}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: (...args: unknown[]) => {
        mockGoBack(...args);
    },
}));

jest.mock('@userActions/User', () => ({
    setSubmitMigrationModalShown: (...args: unknown[]) => {
        mockSetSubmitMigrationModalShown(...args);
    },
}));

jest.mock('@components/ImageSVG', () => {
    const {View} = require<typeof ReactNative>('react-native');
    return (props: ViewProps) => <View {...props} />;
});

const Stack = createStackNavigator();

// The modal renders FormAlertWithSubmitButton, which uses usePressLoading -> useFocusEffect. That hook
// needs a navigation context, so the modal must be rendered inside a NavigationContainer/screen.
function withNavigation(ui: React.ReactElement): React.ReactElement {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="SubmitPlanWelcomeModal">{() => ui}</Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

describe('SubmitPlanWelcomeModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockAutoCreateSubmitWorkspace.mockClear();
        mockGoBack.mockClear();
        mockSetSubmitMigrationModalShown.mockClear();
        beforeRemoveCallback = undefined;
    });

    function renderModal() {
        return render(<OnyxListItemProvider>{withNavigation(<SubmitPlanWelcomeModal />)}</OnyxListItemProvider>);
    }

    it('creates a Submit workspace with the current user name when "Get the free plan" is pressed', async () => {
        renderModal();

        fireEvent.press(screen.getByText('submitPlanWelcomeModal.confirmText'));

        // FormAlertWithSubmitButton runs onSubmit through usePressLoading, which defers the work by one macrotask, so wait for the call.
        await waitFor(() => expect(mockAutoCreateSubmitWorkspace).toHaveBeenCalledWith('John', 'Doe', false));
    });

    it('navigates back (dismissing the modal) when "No thanks" is pressed', () => {
        renderModal();

        fireEvent.press(screen.getByText('submitPlanWelcomeModal.dismissText'));

        expect(mockGoBack).toHaveBeenCalled();
        expect(mockAutoCreateSubmitWorkspace).not.toHaveBeenCalled();
    });

    it('marks the migration modal as shown when it is removed from the navigation stack', () => {
        renderModal();

        expect(beforeRemoveCallback).toBeDefined();
        beforeRemoveCallback?.();

        expect(mockSetSubmitMigrationModalShown).toHaveBeenCalledTimes(1);
    });
});
