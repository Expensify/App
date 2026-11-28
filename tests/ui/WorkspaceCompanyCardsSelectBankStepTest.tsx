import {render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import SelectBankStep from '@pages/workspace/companyCards/addNew/SelectBankStep';

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
jest.mock('@hooks/useEnvironment', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useThemeIllustrations', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/CardUtils', () => ({getBankCardDetailsImage: jest.fn(), getCorrectStepForPlaidSelectedBank: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({setAddNewCompanyCardStepAndData: jest.fn()}));

const QA_API_ROOT = 'https://qa.exops.io/';

describe('Workspace company cards bank selection', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it.each([
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.PRODUCTION, qaApiRoot: QA_API_ROOT, shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: undefined, qaApiRoot: QA_API_ROOT, shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.STAGING, qaApiRoot: QA_API_ROOT, shouldShowMockBank: true},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.QA, qaApiRoot: QA_API_ROOT, shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.STAGING, storedServer: undefined, qaApiRoot: QA_API_ROOT, shouldShowMockBank: true},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.STAGING, storedServer: CONST.SERVER.PRODUCTION, qaApiRoot: QA_API_ROOT, shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.QA, storedServer: CONST.SERVER.PRODUCTION, qaApiRoot: QA_API_ROOT, shouldShowMockBank: true},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.QA, storedServer: CONST.SERVER.PRODUCTION, qaApiRoot: '', shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.DEV, storedServer: CONST.SERVER.QA, qaApiRoot: QA_API_ROOT, shouldShowMockBank: true},
        {buildEnvironment: CONST.ENVIRONMENT.PRODUCTION, environment: CONST.ENVIRONMENT.DEV, storedServer: CONST.SERVER.QA, qaApiRoot: '', shouldShowMockBank: false},
        {buildEnvironment: CONST.ENVIRONMENT.DEV, environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.PRODUCTION, qaApiRoot: QA_API_ROOT, shouldShowMockBank: true},
    ])(
        'sets Mock Bank visibility to $shouldShowMockBank for a $buildEnvironment build in $environment with $storedServer stored and QA root "$qaApiRoot"',
        ({buildEnvironment, environment, storedServer, qaApiRoot, shouldShowMockBank}) => {
            // Given the build, runtime env and stored server from the row
            jest.replaceProperty(CONFIG, 'ENVIRONMENT', buildEnvironment);
            jest.replaceProperty(CONFIG, 'IS_USING_LOCAL_WEB', false);
            jest.replaceProperty(CONFIG.EXPENSIFY, 'QA_API_ROOT', qaApiRoot);
            jest.mocked(useEnvironment).mockReturnValue({
                environment,
                environmentURL: CONST.NEW_EXPENSIFY_URL,
                isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
                isDevelopment: environment === CONST.ENVIRONMENT.DEV,
            });
            jest.mocked(useOnyx).mockImplementation((key) => [key === ONYXKEYS.ACTIVE_SERVER ? storedServer : undefined, {status: 'loaded'}]);

            // When the workspace card step builds the selectable bank list
            render(<SelectBankStep />);

            // Then Mock Bank shows on a non-production build or when the resolved server is not production
            const banks = jest.mocked(SelectionList).mock.lastCall?.[0].data.map((item) => item.keyForList);
            expect(banks?.includes(CONST.COMPANY_CARDS.BANKS.MOCK_BANK)).toBe(shouldShowMockBank);
        },
    );
});
