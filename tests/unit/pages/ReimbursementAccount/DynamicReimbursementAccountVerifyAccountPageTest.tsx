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

const Stack = createPlatformStackNavigator<ReimbursementAccountNavigatorParamList>();

function renderPage(setupType: ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE> | undefined, isNonUSDSetup: string | undefined) {
    return render(
        <OnyxListItemProvider>
            <NavigationContainer
                ref={navigationRef}
                initialState={{
                    index: 0,
                    routes: [
                        // Inherits the entry route's query params, as in the app
                        {name: SCREENS.DYNAMIC_REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT, params: {policyID: POLICY_ID, backTo: BACK_TO, setupType, isNonUSDSetup}},
                    ],
                }}
            >
                <Stack.Navigator>
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

    // Must match where handleConnectManually / handleConnectPlaid send an already validated user
    it.each<{name: string; setupType: ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE> | undefined; isNonUSDSetup: string | undefined; expected: string | undefined}>([
        {
            name: 'USD setup when connecting manually in the USD flow',
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            isNonUSDSetup: undefined,
            expected: ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.COUNTRY, backTo: BACK_TO}),
        },
        {
            name: 'non-USD setup when connecting manually in the non-USD flow',
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            isNonUSDSetup: 'true',
            expected: ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY, backTo: BACK_TO}),
        },
        {
            name: 'USD setup when connecting with Plaid',
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
            isNonUSDSetup: undefined,
            expected: ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.COUNTRY, backTo: BACK_TO}),
        },
        {name: 'no route when the route carries no option', setupType: undefined, isNonUSDSetup: undefined, expected: undefined},
    ])('forwards to $name', async ({setupType, isNonUSDSetup, expected}) => {
        // Given the entry point already reset the Onyx option on validation
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED, CONST.BANK_ACCOUNT.SETUP_TYPE.NONE);

        // When the page renders with the option and flow from the route
        renderPage(setupType, isNonUSDSetup);
        await waitForBatchedUpdates();

        // Then it forwards to the step for that option
        expect(mockVerifyAccountPageBase).toHaveBeenLastCalledWith(expect.objectContaining({navigateForwardTo: expected}));
    });
});
