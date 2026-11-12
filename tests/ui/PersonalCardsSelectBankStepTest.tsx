import {render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import useOnyx from '@hooks/useOnyx';

import {getActiveServer} from '@libs/ApiUtils';

import SelectBankStep from '@pages/settings/Wallet/PersonalCards/steps/SelectBankStep';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardBankIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useThemeIllustrations', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/ApiUtils', () => ({getActiveServer: jest.fn()}));
jest.mock('@libs/CardUtils', () => ({getPersonalBankCardDetailsImage: jest.fn()}));
jest.mock('@userActions/PersonalCards', () => ({setAddNewPersonalCardStepAndData: jest.fn()}));

describe('Personal cards bank selection', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it.each([
        {environment: CONST.ENVIRONMENT.PRODUCTION, activeServer: CONST.SERVER.PRODUCTION, shouldShowMockBank: false},
        {environment: CONST.ENVIRONMENT.PRODUCTION, activeServer: CONST.SERVER.STAGING, shouldShowMockBank: true},
        {environment: CONST.ENVIRONMENT.STAGING, activeServer: CONST.SERVER.PRODUCTION, shouldShowMockBank: true},
        {environment: CONST.ENVIRONMENT.DEV, activeServer: CONST.SERVER.PRODUCTION, shouldShowMockBank: true},
        {environment: CONST.ENVIRONMENT.PRODUCTION, activeServer: undefined, shouldShowMockBank: false},
    ])('sets Mock Bank visibility to $shouldShowMockBank for $environment on $activeServer', ({environment, activeServer, shouldShowMockBank}) => {
        // Given production must hide test banks, including before the active server has loaded.
        jest.replaceProperty(CONFIG, 'ENVIRONMENT', environment);
        jest.mocked(getActiveServer).mockReturnValue(CONST.SERVER.PRODUCTION);
        jest.mocked(useOnyx).mockImplementation((key) => [key === ONYXKEYS.ACTIVE_SERVER ? activeServer : undefined, {status: 'loaded'}]);

        // When the personal card step builds the selectable bank list.
        render(<SelectBankStep />);

        // Then only Mock Bank depends on the environment; every real bank remains available in order.
        const banks = jest.mocked(SelectionList).mock.lastCall?.[0].data.map((item) => item.keyForList);
        const expectedBanks = Object.values(CONST.PERSONAL_CARDS.BANKS).filter((bank) => shouldShowMockBank || bank !== CONST.PERSONAL_CARDS.BANKS.MOCK_BANK);
        expect(banks).toEqual(expectedBanks);
    });
});
