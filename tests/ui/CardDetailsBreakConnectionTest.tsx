import {render} from '@testing-library/react-native';

import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import useCardsList from '@hooks/useCardsList';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import PersonalCardDetailsHeaderMenu from '@pages/settings/Wallet/PersonalCardDetailsHeaderMenu';
import PersonalCardDetailsPage from '@pages/settings/Wallet/PersonalCardDetailsPage';
import DynamicWorkspaceCompanyCardDetailsPage from '@pages/workspace/companyCards/DynamicWorkspaceCompanyCardDetailsPage';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CompanyCardFeed} from '@src/types/onyx';

import type {ComponentProps} from 'react';
import type {ValueOf} from 'type-fest';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock('@components/CardUnsubmittedTransactionsPrompt', () => jest.fn(() => null));
jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ImageSVG', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemAction', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock('@components/Modal/Global/ModalContext', () => ({ModalActions: {CONFIRM: 'CONFIRM'}}));
jest.mock('@components/OfflineWithFeedback', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/PlaidCardFeedIcon', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScrollView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCardFeeds', () => () => [undefined]);
jest.mock('@hooks/useCardsList', () => jest.fn());
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardFeedIcons: () => ({})}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({}));
jest.mock('@hooks/useDynamicBackPath', () => () => '');
jest.mock('@hooks/useEnvironment', () => jest.fn());
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, getLocalDateFromDatetime: () => new Date()}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: () => [undefined]}));
jest.mock('@hooks/usePolicy', () => () => ({policyAccountID: 1}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true}));
jest.mock('@hooks/useThemeIllustrations', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/CardNavigationUtils', () => jest.fn());
jest.mock('@libs/CardUtils', () => ({
    getCardFeedIcon: jest.fn(),
    getCardFeedTextColor: jest.fn(),
    getCardLastUpdated: () => ({text: ''}),
    getCompanyCardCustomName: jest.fn(),
    getCompanyCardFeed: (feed: string) => feed,
    getCompanyFeeds: () => ({}),
    getDefaultCardName: jest.fn(),
    getDomainOrWorkspaceAccountID: () => 1,
    getPlaidInstitutionIconUrl: () => '',
    hasCardConnectionIssue: () => false,
    isPersonalCard: () => true,
    maskCardNumber: () => '',
}));
jest.mock('@libs/ErrorUtils', () => ({getLatestErrorField: () => ({})}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn());
jest.mock('@libs/PersonalDetailsUtils', () => ({temporaryGetDisplayNameOrDefault: () => ''}));
jest.mock('@libs/PolicyUtils', () => ({getConnectedIntegration: () => undefined}));
jest.mock('@libs/ReportUtils', () => ({getIntegrationIcon: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({goBack: jest.fn(), navigate: jest.fn(), setNavigationActionToMicrotaskQueue: jest.fn()}));
jest.mock('@pages/ErrorPage/NotFoundPage', () => jest.fn(() => null));
jest.mock('@pages/settings/Wallet/CardDetailsActionButtons', () => ({
    __esModule: true,
    default: jest.fn(() => null),
    CardDetailsActionButton: Object.assign(
        jest.fn(() => null),
        {Icon: jest.fn(() => null), Text: jest.fn(() => null)},
    ),
}));
jest.mock('@pages/settings/Wallet/PersonalCardDetailsHeaderMenu', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@pages/workspace/companyCards/utils', () => ({getExportMenuItem: () => undefined}));
jest.mock('@selectors/Card', () => ({companyCardCustomNamesSelector: jest.fn()}));
jest.mock('@userActions/Card', () => ({clearCardErrorField: jest.fn(), deletePersonalCard: jest.fn(), syncCard: jest.fn(), unassignCard: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({clearCompanyCardErrorField: jest.fn(), unassignWorkspaceCompanyCard: jest.fn(), updateWorkspaceCompanyCard: jest.fn()}));

type PersonalCardDetailsPageProps = ComponentProps<typeof PersonalCardDetailsPage>;
type DynamicWorkspaceCompanyCardDetailsPageProps = ComponentProps<typeof DynamicWorkspaceCompanyCardDetailsPage>;

const CARD_ID = '1';
const MOCK_BANK = CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK;
const QA_API_ROOT = 'https://qa.exops.io/';

type ServerRow = {
    environment: ValueOf<typeof CONST.ENVIRONMENT>;
    storedServer: ValueOf<typeof CONST.SERVER> | undefined;
    isUsingLocalWeb: boolean;
    shouldShowBreakConnection: boolean;
};

const SERVER_ROWS: ServerRow[] = [
    {environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.PRODUCTION, isUsingLocalWeb: false, shouldShowBreakConnection: false},
    {environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: undefined, isUsingLocalWeb: false, shouldShowBreakConnection: false},
    {environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.QA, isUsingLocalWeb: false, shouldShowBreakConnection: false},
    {environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.STAGING, isUsingLocalWeb: false, shouldShowBreakConnection: true},
    {environment: CONST.ENVIRONMENT.PRODUCTION, storedServer: CONST.SERVER.PRODUCTION, isUsingLocalWeb: true, shouldShowBreakConnection: true},
    {environment: CONST.ENVIRONMENT.STAGING, storedServer: undefined, isUsingLocalWeb: false, shouldShowBreakConnection: true},
    {environment: CONST.ENVIRONMENT.QA, storedServer: CONST.SERVER.PRODUCTION, isUsingLocalWeb: false, shouldShowBreakConnection: true},
    {environment: CONST.ENVIRONMENT.DEV, storedServer: CONST.SERVER.QA, isUsingLocalWeb: false, shouldShowBreakConnection: true},
];

function setUpServer({environment, storedServer, isUsingLocalWeb}: Omit<ServerRow, 'shouldShowBreakConnection'>, cardList?: Record<string, Card>) {
    jest.replaceProperty(CONFIG, 'IS_USING_LOCAL_WEB', isUsingLocalWeb);
    jest.replaceProperty(CONFIG.EXPENSIFY, 'QA_API_ROOT', QA_API_ROOT);
    jest.mocked(useEnvironment).mockReturnValue({
        environment,
        environmentURL: CONST.NEW_EXPENSIFY_URL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    });
    jest.mocked(useOnyx).mockImplementation((key) => {
        if (key === ONYXKEYS.ACTIVE_SERVER) {
            return [storedServer, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.CARD_LIST) {
            return [cardList, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
}

function createCard(bank: CompanyCardFeed): Card {
    return createMock<Card>({cardID: Number(CARD_ID), bank, accountID: 1});
}

function renderPersonalCardDetailsPage() {
    render(
        <PersonalCardDetailsPage
            route={createMock<PersonalCardDetailsPageProps['route']>({params: {cardID: CARD_ID}})}
            navigation={createMock<PersonalCardDetailsPageProps['navigation']>({})}
        />,
    );
    return jest.mocked(PersonalCardDetailsHeaderMenu).mock.lastCall?.[0].shouldShowBreakConnection;
}

function renderWorkspaceCompanyCardDetailsPage(bank: CompanyCardFeed) {
    jest.mocked(useCardsList).mockReturnValue([{[CARD_ID]: createCard(bank)}, {status: 'loaded'}]);
    render(
        <DynamicWorkspaceCompanyCardDetailsPage
            route={createMock<DynamicWorkspaceCompanyCardDetailsPageProps['route']>({
                params: {policyID: 'policy', feed: `${bank}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}1`, cardID: CARD_ID},
            })}
            navigation={createMock<DynamicWorkspaceCompanyCardDetailsPageProps['navigation']>({})}
        />,
    );
    return jest.mocked(MenuItemAction).mock.calls.some(([props]) => props.sentryLabel === CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.BREAK_CONNECTION);
}

describe('Card details "Break connection" visibility', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('PersonalCardDetailsPage', () => {
        it.each(SERVER_ROWS)(
            'sets "Break connection" to $shouldShowBreakConnection for a Mock Bank card in $environment with $storedServer stored and local web $isUsingLocalWeb',
            ({shouldShowBreakConnection, ...server}) => {
                // Given a Mock Bank personal card and the runtime env, stored server and local web flag from the row
                setUpServer(server, {[CARD_ID]: createCard(MOCK_BANK)});

                // When the personal card details page renders
                const isBreakConnectionShown = renderPersonalCardDetailsPage();

                // Then "Break connection" follows the server useActiveServer resolves, so a stored QA on production stays hidden
                expect(isBreakConnectionShown).toBe(shouldShowBreakConnection);
            },
        );

        it('hides "Break connection" for a real bank card on a non-production server', () => {
            // Given a real bank card while staging is the active server
            setUpServer(
                {environment: CONST.ENVIRONMENT.STAGING, storedServer: CONST.SERVER.STAGING, isUsingLocalWeb: false},
                {[CARD_ID]: createCard(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE)},
            );

            // When the personal card details page renders
            const isBreakConnectionShown = renderPersonalCardDetailsPage();

            // Then "Break connection" stays hidden because it only exists to test Mock Bank cards
            expect(isBreakConnectionShown).toBe(false);
        });
    });

    describe('DynamicWorkspaceCompanyCardDetailsPage', () => {
        it.each(SERVER_ROWS)(
            'sets "Break connection" to $shouldShowBreakConnection for a Mock Bank feed in $environment with $storedServer stored and local web $isUsingLocalWeb',
            ({shouldShowBreakConnection, ...server}) => {
                // Given a Mock Bank workspace card and the runtime env, stored server and local web flag from the row
                setUpServer(server);

                // When the workspace card details page renders
                const isBreakConnectionShown = renderWorkspaceCompanyCardDetailsPage(MOCK_BANK);

                // Then "Break connection" follows the server useActiveServer resolves, so a stored QA on production stays hidden
                expect(isBreakConnectionShown).toBe(shouldShowBreakConnection);
            },
        );

        it('hides "Break connection" for a real bank feed on a non-production server', () => {
            // Given a real bank feed while staging is the active server
            setUpServer({environment: CONST.ENVIRONMENT.STAGING, storedServer: CONST.SERVER.STAGING, isUsingLocalWeb: false});

            // When the workspace card details page renders
            const isBreakConnectionShown = renderWorkspaceCompanyCardDetailsPage(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE);

            // Then "Break connection" stays hidden because it only exists to test Mock Bank feeds
            expect(isBreakConnectionShown).toBe(false);
        });
    });
});
