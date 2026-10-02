import {render} from '@testing-library/react-native';

import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import SelectionScreen from '@components/SelectionScreen';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';

import {updateDualEntryCardProgramAccount} from '@libs/actions/connections/DualEntry';
import {updateRilletCardProgramAccount} from '@libs/actions/connections/Rillet';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';
import type {CardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

import type {ComponentType, PropsWithChildren} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

type ExportPageProps = {policy: Policy};
type SelectorPageProps = ExportPageProps & {route: {params: {feed: CardFeedWithDomainID}}};

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

const RilletExportPage = require<{default: ComponentType<ExportPageProps>}>('@pages/workspace/accounting/rillet/export/RilletExportPage').default;
const DualEntryExportPage = require<{default: ComponentType<ExportPageProps>}>('@pages/workspace/accounting/dualentry/export/DualEntryExportPage').default;
const RilletCardProgramAccountSelector = require<{default: ComponentType<SelectorPageProps>}>('@pages/workspace/accounting/rillet/export/RilletCardProgramAccountSelector').default;
const DualEntryCardProgramAccountSelectorPage = require<{
    default: ComponentType<SelectorPageProps>;
}>('@pages/workspace/accounting/dualentry/export/DualEntryCardProgramAccountSelectorPage').default;

jest.mock(
    '@components/ConnectionLayout',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/Accordion',
    () =>
        ({children, isExpanded}: PropsWithChildren<{isExpanded: boolean}>) =>
            isExpanded ? children : null,
);
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => ({BrickRoadIndicator: () => null}));
jest.mock('@components/SelectionScreen', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => () => null);
jest.mock('@components/Text', () => () => null);
jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => () => null);

jest.mock('@hooks/useAccordionAnimation', () => (isExpanded: boolean) => ({isAccordionExpanded: isExpanded, shouldAnimateAccordionSection: false}));
jest.mock('@hooks/useCardFeeds', () => () => [{}]);
jest.mock('@hooks/useCardsLists', () => () => [{}]);
jest.mock('@hooks/useDefaultFundID', () => () => 12345);
jest.mock('@hooks/useExpensifyCardFeeds', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({Telescope: 1})}));
jest.mock('@hooks/useSelectionListSearch', () => (data: unknown[]) => ({filteredData: data, textInputOptions: {}}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@libs/actions/connections/Rillet', () => ({updateRilletCardProgramAccount: jest.fn()}));
jest.mock('@libs/actions/connections/DualEntry', () => ({updateDualEntryCardProgramAccount: jest.fn()}));
jest.mock('@expensify/react-native-hybrid-app', () => ({default: {isHybridApp: () => false}, __esModule: true}));

const POLICY_ID = 'policy1';
const EXPENSIFY_CARD_FEED = getCardFeedWithDomainID(CONST.EXPENSIFY_CARD.BANK, 12345);
const CARD_SETTINGS_KEY = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}12345`;

function buildPolicy(exportToMultipleAccounts?: boolean) {
    return createMock<Policy>({
        id: POLICY_ID,
        areExpensifyCardsEnabled: true,
        connections: {
            rillet: {
                config: {
                    export: {
                        exportToMultipleAccounts,
                        creditCardAccountCode: '2100',
                        cardProgramAccounts: {[CONST.EXPENSIFY_CARD.BANK]: '2200'},
                    },
                },
                data: {
                    accounts: [
                        {id: 'rillet-workspace', code: '2100', name: 'Workspace card'},
                        {id: 'rillet-expensify', code: '2200', name: 'Expensify Card'},
                        {id: 'rillet-legacy', code: '2300', name: 'Legacy card'},
                    ].map((account) => ({
                        ...account,
                        type: CONST.RILLET_ACCOUNT_TYPE.LIABILITY,
                        subtype: CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD,
                        status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
                    })),
                },
            },
            dualEntry: {
                config: {
                    export: {
                        exportToMultipleAccounts,
                        creditCardAccountID: 'workspace-card',
                        cardProgramAccounts: {[CONST.EXPENSIFY_CARD.BANK]: 'expensify-card'},
                    },
                },
                data: {
                    accounts: [
                        {id: 'workspace-card', name: 'Workspace card', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD, isActive: true},
                        {id: 'expensify-card', name: 'Expensify Card', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD, isActive: true},
                    ],
                },
            },
        },
    });
}

function getExpensifyCardRow() {
    return jest
        .mocked(MenuItemField)
        .mock.calls.map(([properties]) => properties)
        .find(({name}) => name === 'workspace.common.expensifyCard');
}

function getSelectionScreenProps() {
    const properties = jest.mocked(SelectionScreen).mock.lastCall?.[0];
    if (!properties) {
        throw new Error('Expected SelectionScreen to render');
    }
    return properties;
}

const integrations = [
    {
        name: 'Rillet',
        ExportPage: RilletExportPage,
        SelectorPage: RilletCardProgramAccountSelector,
        exportRoute: ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(POLICY_ID),
        selectorRoute: ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT_SELECTOR,
        feedListRoute: ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT.getRoute(POLICY_ID),
        selectedAccount: '2200',
        defaultAccount: '2100',
        defaultSelectionValue: '2100',
        expectedAccountName: '2200 Expensify Card',
        updateAccount: updateRilletCardProgramAccount,
    },
    {
        name: 'DualEntry',
        ExportPage: DualEntryExportPage,
        SelectorPage: DualEntryCardProgramAccountSelectorPage,
        exportRoute: ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT.getRoute(POLICY_ID),
        selectorRoute: ROUTES.POLICY_ACCOUNTING_DUALENTRY_CARD_PROGRAM_ACCOUNT_SELECTOR,
        feedListRoute: ROUTES.POLICY_ACCOUNTING_DUALENTRY_CARD_PROGRAM_ACCOUNT.getRoute(POLICY_ID),
        selectedAccount: 'expensify-card',
        defaultAccount: 'workspace-card',
        defaultSelectionValue: '',
        expectedAccountName: 'expensify-card Expensify Card',
        updateAccount: updateDualEntryCardProgramAccount,
    },
];

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useExpensifyCardFeeds).mockReturnValue({[CARD_SETTINGS_KEY]: createMock<ExpensifyCardSettings>({US: {paymentBankAccountID: 1}})});
});

describe.each(integrations)(
    '$name Expensify Card default',
    ({ExportPage, SelectorPage, exportRoute, selectorRoute, feedListRoute, selectedAccount, defaultAccount, defaultSelectionValue, expectedAccountName, updateAccount}) => {
        it.each([false, undefined, true])('shows the saved default when exporting to multiple accounts is %s', (exportToMultipleAccounts) => {
            // Given an Expensify Card default and no company-card feed records
            const policy = buildPolicy(exportToMultipleAccounts);

            // When the export settings page opens
            render(<ExportPage policy={policy} />);

            // Then the applicable default remains visible and opens its selector directly
            const row = getExpensifyCardRow();
            expect(row?.value).toBe(expectedAccountName);
            row?.onPress?.(createMock<GestureResponderEvent>({}));
            expect(Navigation.navigate).toHaveBeenCalledWith(selectorRoute.getRoute(POLICY_ID, EXPENSIFY_CARD_FEED));
        });

        it.each([
            ['flat', {paymentBankAccountID: 1}],
            ['legacy nested', {CURRENT: {paymentBankAccountID: 1}}],
            ['current nested', {US: {paymentBankAccountID: 1}}],
            ['GB nested', {GB: {paymentBankAccountID: 1}}],
            ['mixed', {paymentBankAccountID: 0, US: {paymentBankAccountID: 1}}],
        ])('recognizes %s Expensify Card settings', (_name, settings) => {
            // Given a supported card-settings format
            jest.mocked(useExpensifyCardFeeds).mockReturnValue({[CARD_SETTINGS_KEY]: createMock<ExpensifyCardSettings>(settings)});

            // When the multiple-account option is off
            render(<ExportPage policy={buildPolicy(false)} />);

            // Then the Expensify Card default remains available
            expect(getExpensifyCardRow()?.value).toBe(expectedAccountName);
        });

        it.each([
            ['missing card settings', undefined, true],
            ['missing payment account', {}, true],
            ['nested payment account disabled', {paymentBankAccountID: 1, US: {paymentBankAccountID: 0}}, true],
            ['cards disabled', {US: {paymentBankAccountID: 1}}, false],
        ])('hides the default with %s', (_name, settings, areExpensifyCardsEnabled) => {
            // Given cards cannot be used on this workspace
            const policy = buildPolicy(false);
            policy.areExpensifyCardsEnabled = areExpensifyCardsEnabled;
            jest.mocked(useExpensifyCardFeeds).mockReturnValue(settings ? {[CARD_SETTINGS_KEY]: createMock<ExpensifyCardSettings>(settings)} : {});

            // When the export settings page opens
            render(<ExportPage policy={policy} />);

            // Then it does not offer an unavailable Expensify Card default
            expect(getExpensifyCardRow()).toBeUndefined();
        });

        it('opens the Expensify Card picker without a company-card feed and returns to Export after selecting the workspace account', () => {
            // Given an Expensify Card default opened directly from Export
            const policy = buildPolicy(false);

            // When the picker opens without any company-card feed record
            render(
                <SelectorPage
                    policy={policy}
                    route={{params: {feed: EXPENSIFY_CARD_FEED}}}
                />,
            );
            const properties = getSelectionScreenProps();

            // Then the saved account is selected and the picker permits changing it
            expect(properties.shouldBeBlocked).toBe(false);
            expect(properties.initiallyFocusedOptionKey).toBe(selectedAccount);
            const defaultOption = properties.data.find((item) => item.keyForList === defaultAccount);
            expect(defaultOption).toBeDefined();
            if (!defaultOption) {
                throw new Error('Expected the workspace default account');
            }
            properties.onSelectRow(defaultOption);
            expect(updateAccount).toHaveBeenCalledWith(POLICY_ID, CONST.EXPENSIFY_CARD.BANK, defaultSelectionValue, selectedAccount);
            expect(Navigation.goBack).toHaveBeenCalledWith(exportRoute);
        });

        it('keeps a third-party feed without matching cards blocked and preserves its back route', () => {
            // Given an unavailable third-party feed while Expensify Cards are set up
            const feed = getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, 12345);

            // When its existing picker route opens
            render(
                <SelectorPage
                    policy={buildPolicy(true)}
                    route={{params: {feed}}}
                />,
            );

            // Then Expensify Card availability does not unblock the other feed
            const properties = getSelectionScreenProps();
            expect(properties.shouldBeBlocked).toBe(true);
            properties.onBackButtonPress?.();
            expect(Navigation.goBack).toHaveBeenCalledWith(feedListRoute);
        });
    },
);

describe('Rillet legacy Expensify Card default', () => {
    it('persists the workspace GL code when replacing a legacy Expensify Card account', () => {
        // Given a legacy account with no current feed selection
        const policy = buildPolicy(false);
        const exportSettings = policy.connections?.rillet?.config.export;
        if (!exportSettings) {
            throw new Error('Expected Rillet export settings');
        }
        exportSettings.expensifyCardAccount = 'rillet-legacy';
        exportSettings.cardProgramAccounts = createMock<typeof exportSettings.cardProgramAccounts>({});
        render(
            <RilletCardProgramAccountSelector
                policy={policy}
                route={{params: {feed: EXPENSIFY_CARD_FEED}}}
            />,
        );

        // When the workspace default is chosen
        const properties = getSelectionScreenProps();
        expect(properties.initiallyFocusedOptionKey).toBe('2300');
        const defaultOption = properties.data.find((item) => item.keyForList === '2100');
        if (!defaultOption) {
            throw new Error('Expected the workspace default account');
        }
        properties.onSelectRow(defaultOption);

        // Then the explicit choice overrides the legacy account and preserves the rollback value
        expect(updateRilletCardProgramAccount).toHaveBeenCalledWith(POLICY_ID, CONST.EXPENSIFY_CARD.BANK, '2100', undefined);
    });

    it.each([
        ['legacy only', undefined, '2300 Legacy card'],
        ['current and legacy', '2200', '2200 Expensify Card'],
        ['explicit workspace selection and legacy', '2100', '2100 Workspace card'],
    ])('resolves %s accounts while multiple-account export is off', (_name, currentAccount, expectedAccountName) => {
        // Given a legacy account ID and an optional current GL-code selection
        const policy = buildPolicy(false);
        const exportSettings = policy.connections?.rillet?.config.export;
        if (!exportSettings) {
            throw new Error('Expected Rillet export settings');
        }
        exportSettings.expensifyCardAccount = 'rillet-legacy';
        exportSettings.cardProgramAccounts = createMock<typeof exportSettings.cardProgramAccounts>({[CONST.EXPENSIFY_CARD.BANK]: currentAccount});

        // When the export settings page opens
        render(<RilletExportPage policy={policy} />);

        // Then the current selection takes precedence over the legacy account
        expect(getExpensifyCardRow()?.value).toBe(expectedAccountName);
    });
});

describe('DualEntry Expensify Card selection rollback', () => {
    it('preserves a saved mapping equal to the workspace default when selecting another account', () => {
        // Given an explicit Expensify Card mapping equal to the workspace default
        const policy = buildPolicy(false);
        const exportSettings = policy.connections?.dualEntry?.config.export;
        if (!exportSettings) {
            throw new Error('Expected DualEntry export settings');
        }
        exportSettings.cardProgramAccounts[CONST.EXPENSIFY_CARD.BANK] = 'workspace-card';
        render(
            <DualEntryCardProgramAccountSelectorPage
                policy={policy}
                route={{params: {feed: EXPENSIFY_CARD_FEED}}}
            />,
        );

        // When a different account is selected
        const properties = getSelectionScreenProps();
        const otherOption = properties.data.find((item) => item.keyForList === 'expensify-card');
        if (!otherOption) {
            throw new Error('Expected the alternate Expensify Card account');
        }
        properties.onSelectRow(otherOption);

        // Then a failed save can restore the original explicit mapping
        expect(updateDualEntryCardProgramAccount).toHaveBeenCalledWith(POLICY_ID, CONST.EXPENSIFY_CARD.BANK, 'expensify-card', 'workspace-card');
    });
});
