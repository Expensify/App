import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DynamicVerifyAccountPage from '@pages/settings/DynamicVerifyAccountPage';

import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import {completeTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

/** The subset of VerifyAccountPageBase's props these tests assert on. Typing them keeps the captured call inspectable
 * without casting away the mock's argument type. */
type MockedVerifyAccountPageBaseProps = {
    navigateForwardTo?: Route;
    onValidationSuccess?: () => void;
    shouldShowCloseButton?: boolean;
};

const mockVerifyAccountPageBase = jest.fn<null, [MockedVerifyAccountPageBaseProps]>(() => null);

jest.mock('@pages/settings/VerifyAccountPageBase', () => ({
    __esModule: true,
    default: (props: MockedVerifyAccountPageBaseProps) => mockVerifyAccountPageBase(props),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'home'));
jest.mock('@hooks/useDynamicForwardPath', () => jest.fn(() => undefined));
jest.mock('@userActions/Policy/Policy', () => ({getAccessiblePolicies: jest.fn()}));
jest.mock('@userActions/Task', () => ({completeTask: jest.fn()}));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage(params: SettingsNavigatorParamList[typeof SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT] | undefined) {
    return render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT}
                        component={DynamicVerifyAccountPage}
                        initialParams={params}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
}

describe('DynamicVerifyAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockVerifyAccountPageBase.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('uses the workspace handoff only for the join-workspace task route', async () => {
        renderPage({isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: ROUTES.ONBOARDING_WORKSPACES.getRoute('home', true, true),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                onValidationSuccess: expect.any(Function),
                shouldShowCloseButton: true,
            }),
        );

        const props = mockVerifyAccountPageBase.mock.calls.at(-1)?.[0];
        props?.onValidationSuccess?.();

        expect(completeTask).toHaveBeenCalledWith(undefined, false, false, undefined, undefined, undefined, true, true, CONST.ACCOUNT_ID.CONCIERGE);
        expect(getAccessiblePolicies).toHaveBeenCalled();
    });

    it('preserves generic verification behavior without the task route parameter', async () => {
        renderPage(undefined);
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: undefined,
                onValidationSuccess: undefined,
                shouldShowCloseButton: false,
            }),
        );
    });

    it('does not forward a completed validation task to the workspace list', async () => {
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {validateEmail: '123'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {
            reportID: '123',
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        await waitForBatchedUpdates();

        renderPage({isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: undefined,
                onValidationSuccess: undefined,
            }),
        );
    });
});
