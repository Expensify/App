import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import Onyx from 'react-native-onyx';

import TestNavigationContainer from '../../utils/TestNavigationContainer';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/BankAccounts', () => ({
    clearPersonalBankAccount: jest.fn(),
}));

jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

jest.mock('@pages/settings/Wallet/InternationalDepositAccount/PersonalInfo/PersonalInfo', () => () => null);

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});

const TAB_ROUTES = [
    {name: SCREENS.HOME},
    {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
];

/**
 * Renders the page over a real navigation state with the given tab focused underneath the RHP.
 * The container is mounted first so the page resolves the tab from an attached navigationRef, as it does in the app.
 */
async function renderPageOverTab(focusedTabIndex: number) {
    render(
        <TestNavigationContainer
            initialState={{
                index: 1,
                routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {index: focusedTabIndex, routes: TAB_ROUTES}}, {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}],
            }}
        />,
    );
    render(<AddPersonalBankAccountPage />);

    await waitForBatchedUpdatesWithAct();
}

describe('AddPersonalBankAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
        await waitForBatchedUpdates();
    });

    it('closes the RHP when the flow was started from the Home tab', async () => {
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === SCREENS.HOME));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    // Settings is a tab as well, so this branch was unreachable too while the switch read the root route name
    it('returns to the wallet when the flow was started from the Settings tab', async () => {
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });
});
