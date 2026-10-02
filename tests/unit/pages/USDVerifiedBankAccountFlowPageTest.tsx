import {act, render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import BankInfo from '@pages/ReimbursementAccount/USD/BankInfo/BankInfo';
import ConnectBankAccount from '@pages/ReimbursementAccount/USD/ConnectBankAccount/ConnectBankAccount';
import Country from '@pages/ReimbursementAccount/USD/Country';
import USDVerifiedBankAccountFlowPage from '@pages/ReimbursementAccount/USD/USDVerifiedBankAccountFlowPage';

import {setDraftValues} from '@userActions/FormActions';
import {clearReimbursementAccount} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {createNavigationContainerRef, NavigationContainer, StackActions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

let mockReimbursementAccount: {achData?: {state?: string; subStep?: string}} | undefined;

jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockReimbursementAccount]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, appBG: {}})));
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), dismissModal: jest.fn()}));
jest.mock('@userActions/FormActions', () => ({setDraftValues: jest.fn()}));
jest.mock('@userActions/ReimbursementAccount', () => ({clearReimbursementAccount: jest.fn()}));
jest.mock('@pages/ReimbursementAccount/USD/BankInfo/BankInfo', () => jest.fn(() => null));
jest.mock('@pages/ReimbursementAccount/USD/ConnectBankAccount/ConnectBankAccount', () => jest.fn(() => null));
jest.mock('@pages/ReimbursementAccount/USD/Country', () => jest.fn(() => null));
const [mockBankInfo, mockConnectBankAccount, mockCountry] = [jest.mocked(BankInfo), jest.mocked(ConnectBankAccount), jest.mocked(Country)];
type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD>;
const Stack = createStackNavigator<ReimbursementAccountNavigatorParamList>();

function renderPage(params: PageProps['route']['params']) {
    const navigationRef = createNavigationContainerRef<ReimbursementAccountNavigatorParamList>();
    return {
        ...render(
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator>
                    <Stack.Screen
                        name={SCREENS.REIMBURSEMENT_ACCOUNT_USD}
                        component={USDVerifiedBankAccountFlowPage}
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
    mockReimbursementAccount = undefined;
});
it('preserves policy-less, valid-policy, and Country-to-Plaid routing behavior', () => {
    renderPage({page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT});
    renderPage({policyID: '', page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT});
    renderPage({policyID: 'policy-1', page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT});
    const [{policyID: absent}, {policyID: empty}, props] = mockBankInfo.mock.calls.map(([callProps]) => callProps);
    if (!props) {
        throw new Error('Expected the selected BankInfo child to render');
    }
    expect([absent, empty, props.policyID, typeof props.onSubmit, typeof props.onBackButtonPress]).toEqual([undefined, '', 'policy-1', 'function', 'function']);
    renderPage({policyID: 'policy-1'});
    const countryProps = mockCountry.mock.calls.at(0)?.at(0);
    if (!countryProps?.onSubmit) {
        throw new Error('Expected the default Country child with a submit callback');
    }
    expect([countryProps.stepNames, countryProps.policyID]).toEqual([CONST.BANK_ACCOUNT.STEP_NAMES, 'policy-1']);
    countryProps.onSubmit();
    expect(jest.mocked(Navigation.navigate)).toHaveBeenCalledWith(
        ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID: 'policy-1', page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT, subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.PLAID}),
    );
});

it('stores the focused Wallet business bank account route', () => {
    // Given a Wallet business setup focused on the manual bank-information page
    renderPage({
        page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
        action: 'edit',
        backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
    });

    // Then the route is persisted for an exact resume
    expect(jest.mocked(setDraftValues)).toHaveBeenCalledWith(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
        currentPage: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        currentSubPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
        currentPageAction: 'edit',
    });
});

it('stores the manual bank-information page that is actually rendered', () => {
    // Given the bank account state switched to manual entry while the route still contains a stale Plaid subpage
    mockReimbursementAccount = {achData: {subStep: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL}};

    // When the Wallet bank-information page is focused
    renderPage({
        page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.PLAID,
        backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
    });

    // Then dismissal resumes the rendered manual form, whose routing and account values remain in the form draft
    expect(jest.mocked(setDraftValues)).toHaveBeenCalledWith(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
        currentPage: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        currentSubPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
        currentPageAction: null,
    });
});

it('does not store route progress outside Wallet Make payments', () => {
    // Given the same business bank account page opened from a workspace flow
    jest.mocked(setDraftValues).mockClear();
    renderPage({
        policyID: 'policy-1',
        page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
    });

    // Then Wallet-only resume state is not written
    expect(jest.mocked(setDraftValues)).not.toHaveBeenCalled();
});

it('stores the earlier Wallet route when Back focuses it again', () => {
    // Given a later Bank information route is pushed over an earlier mounted route
    const earlierParams = {
        page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
        backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
    };
    const {navigationRef} = renderPage(earlierParams);
    act(() => {
        navigationRef.dispatch(
            StackActions.push(SCREENS.REIMBURSEMENT_ACCOUNT_USD, {
                page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
                subPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.PLAID,
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
        currentPage: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT,
        currentSubPage: CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES.MANUAL,
        currentPageAction: null,
    });
});

it('clears Workspace account state after dismissing pending validation', () => {
    // Given a pending Workspace account displayed on the validation page
    mockReimbursementAccount = {achData: {state: CONST.BANK_ACCOUNT.STATE.PENDING}};
    renderPage({policyID: 'policy-1', page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION});
    const validationProps = mockConnectBankAccount.mock.calls.at(-1)?.at(0);
    if (!validationProps) {
        throw new Error('Expected the validation page to render');
    }

    // When the user dismisses the validation flow
    validationProps.onBackButtonPress();
    const dismissOptions = jest.mocked(Navigation.dismissModal).mock.calls.at(-1)?.at(0);
    expect(clearReimbursementAccount).not.toHaveBeenCalled();
    act(() => dismissOptions?.afterTransition?.());

    // Then Workspace account state is cleared only after the closing transition
    expect(Navigation.dismissModal).toHaveBeenCalledWith({afterTransition: clearReimbursementAccount});
    expect(clearReimbursementAccount).toHaveBeenCalledTimes(1);
});

it('preserves Wallet account state after dismissing pending validation', () => {
    // Given a pending Wallet account displayed on the validation page
    mockReimbursementAccount = {achData: {state: CONST.BANK_ACCOUNT.STATE.PENDING}};
    const {unmount} = renderPage({page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION, backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
    const validationProps = mockConnectBankAccount.mock.calls.at(-1)?.at(0);
    if (!validationProps) {
        throw new Error('Expected the validation page to render');
    }

    // When the user leaves the validation flow
    validationProps.onBackButtonPress();
    act(() => unmount());

    // Then the Wallet resume state remains available
    expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
    expect(clearReimbursementAccount).not.toHaveBeenCalled();
});
