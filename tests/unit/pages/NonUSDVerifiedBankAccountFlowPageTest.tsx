import {act, render} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import NonUSDVerifiedBankAccountFlowPage from '@pages/ReimbursementAccount/NonUSD/NonUSDVerifiedBankAccountFlowPage';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {createNavigationContainerRef, NavigationContainer, StackActions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, appBG: {}})));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@userActions/FormActions', () => ({setDraftValues: jest.fn()}));
jest.mock('@pages/ReimbursementAccount/NonUSD/BankInfo/BankInfo', () => jest.fn(() => null));

type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_NON_USD>;
const Stack = createStackNavigator<ReimbursementAccountNavigatorParamList>();

function renderPage(params: PageProps['route']['params']) {
    const navigationRef = createNavigationContainerRef<ReimbursementAccountNavigatorParamList>();
    return {
        ...render(
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator>
                    <Stack.Screen
                        name={SCREENS.REIMBURSEMENT_ACCOUNT_NON_USD}
                        component={NonUSDVerifiedBankAccountFlowPage}
                        initialParams={params}
                    />
                </Stack.Navigator>
            </NavigationContainer>,
        ),
        navigationRef,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

it('stores the focused Wallet non-USD business bank account route', () => {
    // Given a Wallet business setup focused on the account-holder details page
    renderPage({
        page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
        subPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS,
        action: 'edit',
        backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
    });

    // Then the route is persisted for an exact resume
    expect(jest.mocked(setDraftValues)).toHaveBeenCalledWith(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
        currentPage: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
        currentSubPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS,
        currentPageAction: 'edit',
    });
});

it('does not store route progress outside Wallet Make payments', () => {
    // Given the same non-USD business bank account page opened from a workspace flow
    renderPage({
        policyID: 'policy-1',
        page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
        subPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS,
    });

    // Then Wallet-only resume state is not written
    expect(jest.mocked(setDraftValues)).not.toHaveBeenCalled();
});

it('stores the earlier Wallet route when Back focuses it again', () => {
    // Given a later Bank information route is pushed over an earlier mounted route
    const earlierParams = {
        page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
        subPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.CONFIRMATION,
        backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
    };
    const {navigationRef} = renderPage(earlierParams);
    act(() => {
        navigationRef.dispatch(
            StackActions.push(SCREENS.REIMBURSEMENT_ACCOUNT_NON_USD, {
                page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
                subPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS,
                backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
            }),
        );
    });
    jest.mocked(setDraftValues).mockClear();

    // When Back removes the later route and React Navigation focuses the earlier route again
    act(() => {
        navigationRef.goBack();
    });

    // Then the earlier route replaces the deeper saved position used on the next reopen
    expect(jest.mocked(setDraftValues)).toHaveBeenCalledWith(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
        currentPage: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.BANK_INFO,
        currentSubPage: CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.CONFIRMATION,
        currentPageAction: null,
    });
});
