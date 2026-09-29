import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import DynamicReimbursementAccountVerifyAccountPage from '@pages/ReimbursementAccount/DynamicReimbursementAccountVerifyAccountPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockVerifyAccountPageBase = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@pages/settings/VerifyAccountPageBase', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockVerifyAccountPageBase(props),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'bank-account/new'));

const POLICY_ID = '1';
const BACK_TO = ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID);

// The modal stack registers the entry screen as SCREENS.REIMBURSEMENT_ACCOUNT with the REIMBURSEMENT_ACCOUNT_ROOT params.
type TestParamList = ReimbursementAccountNavigatorParamList & {
    [SCREENS.REIMBURSEMENT_ACCOUNT]: ReimbursementAccountNavigatorParamList[typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT];
};

const Stack = createPlatformStackNavigator<TestParamList>();

function EntryScreen() {
    return null;
}

function renderPage(isNonUSDSetup?: string) {
    return render(
        <OnyxListItemProvider>
            <NavigationContainer
                ref={navigationRef}
                initialState={{
                    index: 1,
                    routes: [
                        {name: SCREENS.REIMBURSEMENT_ACCOUNT, params: {policyID: POLICY_ID, backTo: BACK_TO}},
                        // Like in the app, the verify route inherits the entry route's query params, backTo included.
                        {name: SCREENS.DYNAMIC_REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT, params: {policyID: POLICY_ID, backTo: BACK_TO, isNonUSDSetup}},
                    ],
                }}
            >
                <Stack.Navigator>
                    <Stack.Screen
                        name={SCREENS.REIMBURSEMENT_ACCOUNT}
                        component={EntryScreen}
                    />
                    <Stack.Screen
                        name={SCREENS.DYNAMIC_REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT}
                        component={DynamicReimbursementAccountVerifyAccountPage}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
}

describe('DynamicReimbursementAccountVerifyAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockVerifyAccountPageBase.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    // The entry point decides between the USD and non-USD flows and passes it in isNonUSDSetup, and the entry screen's backTo is handed on,
    // so a user who validates here lands on the same step a validated user is sent to directly. Without a forward path the page falls back to going back.
    it.each<{name: string; optionPressed: ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE>; isNonUSDSetup: string | undefined; expected: string | undefined}>([
        {
            name: 'USD setup when connecting manually in the USD flow',
            optionPressed: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            isNonUSDSetup: undefined,
            expected: ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.COUNTRY, backTo: BACK_TO}),
        },
        {
            name: 'non-USD setup when connecting manually in the non-USD flow',
            optionPressed: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            isNonUSDSetup: 'true',
            expected: ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY, backTo: BACK_TO}),
        },
        {
            name: 'USD setup when connecting with Plaid',
            optionPressed: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
            isNonUSDSetup: undefined,
            expected: ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.COUNTRY, backTo: BACK_TO}),
        },
        {name: 'no route when no option was pressed', optionPressed: CONST.BANK_ACCOUNT.SETUP_TYPE.NONE, isNonUSDSetup: undefined, expected: undefined},
    ])('forwards to $name', async ({optionPressed, isNonUSDSetup, expected}) => {
        // Given the admin picked a connection option before being asked to validate
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED, optionPressed);

        // When the verify account page renders with the flow the entry point chose
        renderPage(isNonUSDSetup);
        await waitForBatchedUpdates();

        // Then it hands VerifyAccountPageBase the step that option leads to, so only this page navigates after validation
        expect(mockVerifyAccountPageBase).toHaveBeenLastCalledWith(expect.objectContaining({navigateForwardTo: expected}));
    });
});
