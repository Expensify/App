import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type TextComponent from '@components/Text';

import DateUtils from '@libs/DateUtils';

import PolicyAccountingPage from '@pages/workspace/accounting/PolicyAccountingPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type * as ReactNavigation from '@react-navigation/native';

import {addDays, getUnixTime, subDays} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy-1';
const OVERFLOW_MENU_ITEM_PREFIX = 'overflow:';

const mockStartIntegrationFlow = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: () => {},
        useRoute: () => ({params: {}}),
        useNavigation: () => ({}),
        useIsFocused: () => true,
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: jest.fn(),
        navigate: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: () => Promise.resolve(),
    },
}));

jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    __esModule: true,
    AccountingContextProvider: ({children}: {children: React.ReactNode}) => children,
    useAccountingActions: () => ({startIntegrationFlow: mockStartIntegrationFlow}),
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: {current: {}}}),
}));

jest.mock('@pages/workspace/withPolicyConnections', () => ({
    __esModule: true,
    default: (Component: React.ComponentType<{policy: Policy}>) => Component,
}));

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScrollView', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/MenuItemList', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Section', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/CollapsibleSection', () => ({__esModule: true, default: () => null}));
jest.mock('@components/ActivityIndicator', () => ({__esModule: true, default: () => null}));

// The real menu only renders its entries inside a popover once pressed. Rendering their labels inline lets the tests
// read which credentials entry the page offers without driving the popover.
jest.mock('@components/ThreeDotsMenu', () => {
    const {default: MockText} = jest.requireActual<{default: typeof TextComponent}>('@components/Text');
    return {
        __esModule: true,
        default: ({menuItems}: {menuItems: PopoverMenuItem[]}) => menuItems.map((menuItem) => <MockText key={menuItem.text}>{`${OVERFLOW_MENU_ITEM_PREFIX}${menuItem.text}`}</MockText>),
    };
});

jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({canWrite: true, showReadOnlyModal: () => {}}),
}));

// The real `withPolicyConnections` HOC reads `policy` from Onyx and strips it from the component's public props. It is
// mocked to an identity wrapper above, so the component under test takes `policy` directly.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the HOC that would inject `policy` is mocked out, so it is passed as a prop here
const PolicyAccountingPageUnderTest = PolicyAccountingPage as unknown as React.ComponentType<{policy: Policy}>;

/**
 * A healthy QBO connection (synced, no error) whose refresh token expires at the given time. `data` is populated so the
 * connection does not read as a first sync still in progress.
 */
function buildQBOPolicy(refreshTokenExpiresAt: Date, isAuthenticationError = false): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace'),
        id: POLICY_ID,
        connections: createMock<Policy['connections']>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {
                    credentials: {
                        companyID: '12345',
                        refreshTokenExpiresAt: getUnixTime(refreshTokenExpiresAt),
                    },
                },
                data: {},
                lastSync: {
                    isSuccessful: !isAuthenticationError,
                    isAuthenticationError,
                    isConnected: true,
                    successfulDate: subDays(new Date(), 1).toISOString(),
                    source: 'NEWEXPENSIFY',
                },
            },
        }),
    };
}

function formatExpiryDate(expiryDate: Date): string {
    return DateUtils.formatWithUTCTimeZone(expiryDate.toISOString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT, undefined);
}

async function renderPage(policy: Policy) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PolicyAccountingPageUnderTest policy={policy} />
        </ComposeProviders>,
    );
    await waitForBatchedUpdates();
}

describe('PolicyAccountingPage QBO refresh token expiry warning', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should warn with the expiry date and offer to reconnect when the token expires within the warning window', async () => {
        // Given a healthy QBO connection whose refresh token expires in a few days
        const expiryDate = addDays(new Date(), 3);
        await renderPage(buildQBOPolicy(expiryDate));

        // Then the connection row explains when the connection will expire
        expect(screen.getByText(`Your QuickBooks Online connection expires on ${formatExpiryDate(expiryDate)}.`, {exact: false})).toBeOnTheScreen();

        // And the overflow menu gains a credentials entry that reads Reconnect rather than Enter your credentials
        expect(screen.getByText(`${OVERFLOW_MENU_ITEM_PREFIX}Reconnect`)).toBeOnTheScreen();
        expect(screen.queryByText(`${OVERFLOW_MENU_ITEM_PREFIX}Enter your credentials`)).not.toBeOnTheScreen();

        // When the user presses the Reconnect link in the warning
        fireEvent.press(screen.getByRole('link', {name: 'Reconnect'}), {preventDefault: () => {}});

        // Then the QBO connect flow starts so a fresh token is issued before the current one lapses
        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({name: CONST.POLICY.CONNECTIONS.NAME.QBO, isIntuitEnterpriseSuite: false});
    });

    it('should say the connection expired when the token is past its expiry but no sync has failed yet', async () => {
        // Given a QBO connection whose refresh token lapsed yesterday while the last sync still reads as successful
        const expiryDate = subDays(new Date(), 1);
        await renderPage(buildQBOPolicy(expiryDate));

        // Then the row says the connection already expired and still offers to reconnect
        expect(screen.getByText(`Your QuickBooks Online connection expired on ${formatExpiryDate(expiryDate)}.`, {exact: false})).toBeOnTheScreen();
        expect(screen.getByRole('link', {name: 'Reconnect'})).toBeOnTheScreen();
    });

    it('should not warn while the token is still far from expiring', async () => {
        // Given a healthy QBO connection whose refresh token is valid well past the warning window
        await renderPage(buildQBOPolicy(addDays(new Date(), CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_WARNING_DAYS + 30)));

        // Then no expiry warning is shown and the overflow menu offers no credentials entry, as a healthy QBO connection
        // has nothing to re-enter
        expect(screen.queryByText('Your QuickBooks Online connection', {exact: false})).not.toBeOnTheScreen();
        expect(screen.queryByRole('link', {name: 'Reconnect'})).not.toBeOnTheScreen();
        expect(screen.queryByText(`${OVERFLOW_MENU_ITEM_PREFIX}Reconnect`)).not.toBeOnTheScreen();
        expect(screen.queryByText(`${OVERFLOW_MENU_ITEM_PREFIX}Enter your credentials`)).not.toBeOnTheScreen();
    });

    it('should leave the authentication error in charge once a sync has already failed on the expired token', async () => {
        // Given a QBO connection whose token lapsed and whose last sync already failed to authenticate
        await renderPage(buildQBOPolicy(subDays(new Date(), 1), true));

        // Then the standard authentication error is shown instead of a second, redundant expiry warning
        expect(screen.queryByText('Your QuickBooks Online connection', {exact: false})).not.toBeOnTheScreen();
        expect(screen.getByText('due to an authentication error', {exact: false})).toBeOnTheScreen();
    });
});
