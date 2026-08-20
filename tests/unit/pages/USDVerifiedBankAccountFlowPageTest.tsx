import {render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import BankInfo from '@pages/ReimbursementAccount/USD/BankInfo/BankInfo';
import Country from '@pages/ReimbursementAccount/USD/Country';
import USDVerifiedBankAccountFlowPage from '@pages/ReimbursementAccount/USD/USDVerifiedBankAccountFlowPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, appBG: {}})));
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@pages/ReimbursementAccount/USD/BankInfo/BankInfo', () => jest.fn(() => null));
jest.mock('@pages/ReimbursementAccount/USD/Country', () => jest.fn(() => null));
const [mockBankInfo, mockCountry] = [jest.mocked(BankInfo), jest.mocked(Country)];
type PageProps = React.ComponentProps<typeof USDVerifiedBankAccountFlowPage>;
function renderPage(params: PageProps['route']['params']) {
    const props = {route: createMock<PageProps['route']>({params}), navigation: createMock<PageProps['navigation']>({})} satisfies PageProps;
    return render(React.createElement(USDVerifiedBankAccountFlowPage, props));
}
it('preserves policy-less, valid-policy, and Country-to-Plaid routing behavior', () => {
    const view = renderPage({page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT});
    expect([view.toJSON() === null, mockCountry.mock.calls.length, mockBankInfo.mock.calls.length]).toEqual([false, 0, 0]);
    renderPage({policyID: 'policy-1', page: CONST.BANK_ACCOUNT.PAGE_NAMES.BANK_ACCOUNT});
    const props = mockBankInfo.mock.calls.at(0)?.at(0);
    if (!props) {
        throw new Error('Expected the selected BankInfo child to render');
    }
    expect([props.policyID, typeof props.onSubmit, typeof props.onBackButtonPress]).toEqual(['policy-1', 'function', 'function']);
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
