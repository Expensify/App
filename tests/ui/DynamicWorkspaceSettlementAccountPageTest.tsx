import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import BankOfAmerica from '@assets/images/bank-icons/bank-of-america.svg';
import Chase from '@assets/images/bank-icons/chase.svg';
import GenericBank from '@assets/images/bank-icons/generic-bank-account.svg';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import Icon from '@components/Icon';
import type * as WebBankIconsModule from '@components/Icon/BankIcons/index';
import type * as NativeBankIconsModule from '@components/Icon/BankIcons/index.native';
import type * as BankIconsUtilsModule from '@components/Icon/BankIconsUtils';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import type {SelectionListProps} from '@components/SelectionList/types';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';

import {getRouteParamForConnection} from '@libs/AccountingUtils';
import type * as PolicyConnectionsModule from '@libs/actions/PolicyConnections';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';

import Navigation from '@navigation/Navigation';

import DynamicWorkspaceSettlementAccountPage from '@pages/workspace/expensifyCard/DynamicWorkspaceSettlementAccountPage';
import type {WorkspaceSettlementAccountPageProps} from '@pages/workspace/expensifyCard/DynamicWorkspaceSettlementAccountPage';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

import type * as CardActionsModule from '@userActions/Card';
import {updateSettlementAccount} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type BankAccount from '@src/types/onyx/BankAccount';
import type {BankAccountList} from '@src/types/onyx/BankAccount';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
import type Policy from '@src/types/onyx/Policy';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useNavigationState: () => false,
    useRoute: () => ({key: 'settlement', name: 'Workspace_Dynamic_ExpensifyCard_Settings_Account', params: {policyID: 'policy123'}}),
    usePreventRemove: () => {},
}));
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@hooks/useWorkspaceAccountID', () => ({__esModule: true, default: () => 424242}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@userActions/Card', () => ({
    ...jest.requireActual<typeof CardActionsModule>('@userActions/Card'),
    updateSettlementAccount: jest.fn<ReturnType<typeof updateSettlementAccount>, Parameters<typeof updateSettlementAccount>>(),
}));
jest.mock('@libs/actions/PolicyConnections', () => ({
    ...jest.requireActual<typeof PolicyConnectionsModule>('@libs/actions/PolicyConnections'),
    openPolicyAccountingPage: jest.fn<ReturnType<typeof openPolicyAccountingPage>, Parameters<typeof openPolicyAccountingPage>>(),
}));

// List virtualization is below SettlementAccountSelector. The actual row icon, header and selection callback still execute.
jest.mock('@components/SelectionList', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    return ({data, onSelectRow, customListHeaderContent, initiallyFocusedItemKey}: SelectionListProps<BankAccountListItem>) => (
        <RN.View testID={`settlement-focused-${initiallyFocusedItemKey}`}>
            {customListHeaderContent}
            {data.map((item) => (
                <RN.Pressable
                    key={item.keyForList}
                    testID={`settlement-account-${item.value}`}
                    accessibilityState={{selected: item.isSelected}}
                    onPress={() => onSelectRow(item)}
                >
                    {item.leftElement}
                    <RN.Text>{item.text}</RN.Text>
                    <RN.Text>{item.alternateText}</RN.Text>
                </RN.Pressable>
            ))}
        </RN.View>
    );
});

const getNativeBankIcon = jest.requireActual<typeof NativeBankIconsModule>('../../src/components/Icon/BankIcons/index.native.ts').default;

const policyID = 'policy123';
const fundID = 424242;
const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}` as const;
const programKey = CONST.COUNTRY.US;
const policy = createMock<Policy>({id: policyID, name: 'Card workspace', role: CONST.POLICY.ROLE.ADMIN, outputCurrency: CONST.CURRENCY.USD});
const cardSettings: ExpensifyCardSettings = {
    [programKey]: {domainName: 'example.com', paymentBankAccountID: 11, paymentBankAccountAddressName: 'Unknown Credit Union', paymentBankAccountNumber: '12340011'},
};
const eligibleChase = createMock<BankAccount>({
    methodID: 22,
    title: 'Chase business',
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, allowDebit: true, state: CONST.BANK_ACCOUNT.STATE.OPEN, addressName: 'CHASE Bank', accountNumber: '12340022', bankAccountID: 22},
});
const eligibleUnknown = createMock<BankAccount>({
    methodID: 33,
    title: 'Credit union business',
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, allowDebit: true, state: CONST.BANK_ACCOUNT.STATE.OPEN, addressName: 'Unknown Credit Union', accountNumber: '12340033'},
});
const ineligible = createMock<BankAccount>({
    methodID: 44,
    title: 'Pending account',
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, allowDebit: true, state: CONST.BANK_ACCOUNT.STATE.SETUP, addressName: 'Chase Bank'},
});
const route: WorkspaceSettlementAccountPageProps['route'] = {key: 'settlement', name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT, params: {policyID}};

function renderSettlementPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <DynamicWorkspaceSettlementAccountPage
                route={route}
                navigation={createMock<WorkspaceSettlementAccountPageProps['navigation']>({})}
            />
        </ComposeProviders>,
    );
}

describe('DynamicWorkspaceSettlementAccountPage', () => {
    beforeEach(async () => {
        Onyx.init({keys: ONYXKEYS});
        jest.mocked(updateSettlementAccount).mockClear();
        jest.mocked(openPolicyAccountingPage).mockClear();
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(cardSettingsKey, cardSettings);
        });
        await waitForBatchedUpdatesWithAct();
    });
    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    it('uses eligible accounts ahead of the fallback and emits account IDs', async () => {
        // Given real backend account fields, only debit-enabled business accounts past setup are eligible.
        const accounts: BankAccountList = {[`22`]: eligibleChase, [`33`]: eligibleUnknown, [`44`]: ineligible};
        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, accounts);
        });
        await waitForBatchedUpdatesWithAct();
        const page = renderSettlementPage();
        await waitForBatchedUpdatesWithAct();

        // When the actual page composes list rows, institution names must reach the real icon matcher unchanged.
        expect(screen.getByText('Chase business')).toBeOnTheScreen();
        expect(screen.getByText('Credit union business')).toBeOnTheScreen();
        expect(screen.queryByText('Pending account')).toBeNull();
        expect(screen.queryByTestId('settlement-account-11')).toBeNull();
        expect(screen.getByText('Account ending in 0022')).toBeOnTheScreen();
        expect(page.UNSAFE_getAllByType(Icon).some((node) => node.props.src === Chase)).toBe(true);
        expect(page.UNSAFE_getAllByType(Icon).some((node) => node.props.src === GenericBank)).toBe(true);
        fireEvent.press(screen.getByTestId('settlement-account-22'));
        fireEvent.press(screen.getByTestId('settlement-account-33'));

        // Then accountData.bankAccountID and methodID fallback both retain their exact action arguments.
        expect(updateSettlementAccount).toHaveBeenCalledTimes(2);
        expect(updateSettlementAccount).toHaveBeenNthCalledWith(1, 'example.com', fundID, policyID, programKey, 22, 11, false);
        expect(updateSettlementAccount).toHaveBeenNthCalledWith(2, 'example.com', fundID, policyID, programKey, 33, 11, false);
        expect(Navigation.goBack).toHaveBeenCalledTimes(2);
    });

    it.each(['Unknown Credit Union', 'BankOfAmerica', ''])('renders the selected fallback for institution "%s" without eligible accounts', async (bankName) => {
        // Given no eligible account, nested card settings are the source of the selected fallback and its last four digits.
        await act(async () => {
            await Onyx.set(cardSettingsKey, {[programKey]: {...cardSettings[programKey], paymentBankAccountAddressName: bankName}});
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[`44`]: ineligible});
        });
        await waitForBatchedUpdatesWithAct();
        const page = renderSettlementPage();
        await waitForBatchedUpdatesWithAct();

        // When the fallback row is selected, its existing account ID and selection state must survive arbitrary names.
        const row = screen.getByTestId('settlement-account-11');
        expect(row.props.accessibilityState).toEqual({selected: true});
        expect(screen.getByText('Account ending in 0011')).toBeOnTheScreen();
        expect(screen.getByTestId('settlement-focused-11')).toBeOnTheScreen();
        const expectedIcon = bankName === 'BankOfAmerica' ? BankOfAmerica : GenericBank;
        expect(page.UNSAFE_getAllByType(Icon).some((node) => node.props.src === expectedIcon)).toBe(true);
        fireEvent.press(row);

        // Then the real selector delivers the selected ID rather than a display name or list index.
        expect(updateSettlementAccount).toHaveBeenCalledTimes(1);
        expect(updateSettlementAccount).toHaveBeenNthCalledWith(1, 'example.com', fundID, policyID, programKey, 11, 11, false);
    });

    it.each([
        {connection: undefined, enabled: true, active: true, visible: false},
        {connection: CONST.POLICY.CONNECTIONS.NAME.QBO, enabled: false, active: true, visible: false},
        {connection: CONST.POLICY.CONNECTIONS.NAME.QBO, enabled: true, active: false, visible: false},
        // Exact Online is only listed for its waitlist, so it is not a connection a policy can reconcile against.
        ...Object.values(CONST.POLICY.CONNECTIONS.NAME)
            .filter((connection): connection is PolicyConnectionName => connection !== CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE)
            .map((connection) => ({connection, enabled: true, active: true, visible: !!getRouteParamForConnection(connection)})),
    ] satisfies Array<{connection: PolicyConnectionName | undefined; enabled: boolean; active: boolean; visible: boolean}>)(
        'preserves reconciliation link visibility for $connection, enabled=$enabled, active=$active',
        async ({connection, enabled, active, visible}) => {
            // Given independent connection and reconciliation state, no single flag is enough to authorize a link.
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, active ? {...policy, connections: {quickbooksOnline: {}}} : policy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${fundID}`, enabled);
                if (connection) {
                    await Onyx.set(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${fundID}`, connection);
                }
            });
            await waitForBatchedUpdatesWithAct();

            // When the actual page uses the real accounting mapping, absent or disabled connections remain hidden.
            const page = renderSettlementPage();
            await waitForBatchedUpdatesWithAct();
            const html = page.UNSAFE_queryAllByType(RenderHTML);

            // Then known mappings retain the route, fund and masked account while other states render no reconciliation HTML.
            expect(html).toHaveLength(visible ? 1 : 0);
            if (visible && connection) {
                const routeParam = getRouteParamForConnection(connection);
                expect(routeParam).toBeDefined();
                if (!routeParam) {
                    throw new Error('Expected a mapped connection');
                }
                expect(html.at(0)?.props.html).toContain(
                    `${ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, routeParam)}/${DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path}?fundID=${fundID}`,
                );
                expect(html.at(0)?.props.html).toContain(`${CONST.MASKED_PAN_PREFIX}0011`);
            }
        },
    );
});

describe.each(['web', 'native'])('real %s bank icon names', (platform) => {
    it.each([
        {bankName: 'CHASE Bank', key: 'CHASE', cachedComponent: Chase},
        {bankName: 'BankOfAmerica', key: 'BANK_OF_AMERICA', cachedComponent: BankOfAmerica},
        {bankName: 'Unknown Credit Union', key: '', cachedComponent: GenericBank},
        {bankName: '', key: '', cachedComponent: GenericBank},
    ] as const)('preserves matching and fallback for $bankName', ({bankName, key, cachedComponent}) => {
        // Given setup-owned SVG functions, web extraction needs a distinct real transformed component at their default property.
        const realChase = jest.requireActual<typeof Chase>('@assets/images/bank-icons/chase.svg');
        const realBankOfAmerica = jest.requireActual<typeof BankOfAmerica>('@assets/images/bank-icons/bank-of-america.svg');
        for (const component of [Chase, BankOfAmerica, GenericBank, realChase, realBankOfAmerica]) {
            expect(component).toBeDefined();
            expect(component).not.toBeNull();
        }
        expect(Chase).not.toBe(BankOfAmerica);
        expect(GenericBank).not.toBe(Chase);
        expect(GenericBank).not.toBe(BankOfAmerica);
        expect(realChase).not.toBe(Chase);
        expect(realBankOfAmerica).not.toBe(BankOfAmerica);
        expect(realChase).not.toBe(realBankOfAmerica);
        const chaseDefault = Object.getOwnPropertyDescriptor(Chase, 'default');
        const americaDefault = Object.getOwnPropertyDescriptor(BankOfAmerica, 'default');
        expect(chaseDefault).toBeUndefined();
        expect(americaDefault).toBeUndefined();
        expect(Object.isExtensible(Chase)).toBe(true);
        expect(Object.isExtensible(BankOfAmerica)).toBe(true);
        const styles = createMock<ThemeStyles>({bankIconContainer: {}, cardIcon: {}});
        const getWebBankIcon = jest.requireActual<typeof WebBankIconsModule>('../../src/components/Icon/BankIcons/index.ts').default;
        const {getBankIconAsset, getBankNameKey} = jest.requireActual<typeof BankIconsUtilsModule>('@components/Icon/BankIconsUtils');
        try {
            if (platform === 'web') {
                const chaseNamespace = Object.assign(Chase, {default: realChase});
                const americaNamespace = Object.assign(BankOfAmerica, {default: realBankOfAmerica});
                expect(chaseNamespace.default).toBe(realChase);
                expect(americaNamespace.default).toBe(realBankOfAmerica);
            }

            // When the actual matcher, loader and platform consumer run, neither the loader nor the result is stubbed.
            expect(getBankNameKey(bankName.toLowerCase())).toBe(key);
            const result = (platform === 'web' ? getWebBankIcon : getNativeBankIcon)({bankName, styles});
            const webComponent = key === 'CHASE' ? realChase : realBankOfAmerica;

            // Then distinct nonempty platform oracles expose omitted extraction, wrong module bindings and missing fallbacks.
            expect(result.icon).toBeDefined();
            expect(result.icon).not.toBeNull();
            if (key) {
                const asset = getBankIconAsset(key, false);
                expect(asset).toBe(cachedComponent);
                if (platform === 'web') {
                    expect(result.icon).toBe(webComponent);
                    expect(result.icon).not.toBe(asset);
                    if (asset === null || (typeof asset !== 'object' && typeof asset !== 'function') || !('default' in asset)) {
                        throw new Error('Expected the web SVG namespace default');
                    }
                    expect(asset.default).toBe(webComponent);
                } else {
                    expect(result.icon).toBe(cachedComponent);
                    expect(result.icon).not.toBe(webComponent);
                    expect(Object.getOwnPropertyDescriptor(cachedComponent, 'default')).toBeUndefined();
                }
            } else {
                expect(result.icon).toBe(GenericBank);
            }
            expect(result.iconSize).toBe(variables.iconSizeExtraLarge);
            expect(result.iconStyles).toEqual([styles.bankIconContainer]);
        } finally {
            if (chaseDefault) {
                Object.defineProperty(Chase, 'default', chaseDefault);
            } else {
                expect(Reflect.deleteProperty(Chase, 'default')).toBe(true);
            }
            if (americaDefault) {
                Object.defineProperty(BankOfAmerica, 'default', americaDefault);
            } else {
                expect(Reflect.deleteProperty(BankOfAmerica, 'default')).toBe(true);
            }
            expect(Object.getOwnPropertyDescriptor(Chase, 'default')).toEqual(chaseDefault);
            expect(Object.getOwnPropertyDescriptor(BankOfAmerica, 'default')).toEqual(americaDefault);
        }
    });
});
