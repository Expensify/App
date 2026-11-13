import {render} from '@testing-library/react-native';

import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useCardsList from '@hooks/useCardsList';

import type * as ApiUtils from '@libs/ApiUtils';
import type * as CardUtils from '@libs/CardUtils';
import type * as ErrorUtils from '@libs/ErrorUtils';
import type * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';

import DynamicWorkspaceCompanyCardDetailsPage from '@pages/workspace/companyCards/DynamicWorkspaceCompanyCardDetailsPage';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {View as ViewType} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

// ─── Captured state ──────────────────────────────────────────────────────────

type CapturedMenuItemField = {name: string; value: string | undefined};
let capturedMenuItemFields: CapturedMenuItemField[] = [];

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@hooks/useCardFeeds', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useCardsList', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({policyAccountID: 1})));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => jest.fn(() => ({canWrite: true})));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardFeedIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));
jest.mock('@hooks/usePersonalDetails', () => ({
    usePersonalDetail: jest.fn(() => [{displayName: 'Alice Smith'}, {status: 'loaded'}]),
}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (v: string) => v,
        getLocalDateFromDatetime: () => undefined,
        dateFnsLocale: undefined,
    })),
);

jest.mock('@libs/ApiUtils', () => ({...jest.requireActual<typeof ApiUtils>('@libs/ApiUtils'), getActiveServer: jest.fn(() => 'production')}));
jest.mock('@libs/CardNavigationUtils', () => jest.fn());
jest.mock('@libs/CardUtils', () => ({
    ...jest.requireActual<typeof CardUtils>('@libs/CardUtils'),
    getCompanyFeeds: jest.fn(() => ({})),
    getDomainOrWorkspaceAccountID: jest.fn(() => 1),
    maskCardNumber: jest.fn(() => 'XXXX-1234'),
    getCardLastUpdated: jest.fn(() => ({text: 'Never', localDate: undefined})),
    getPlaidInstitutionIconUrl: jest.fn(() => undefined),
}));
jest.mock('@libs/ErrorUtils', () => ({...jest.requireActual<typeof ErrorUtils>('@libs/ErrorUtils'), getLatestErrorField: jest.fn(() => ({}))}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    ...jest.requireActual<typeof PersonalDetailsUtils>('@libs/PersonalDetailsUtils'),
    temporaryGetDisplayNameOrDefault: jest.fn(() => 'Alice Smith'),
}));
jest.mock('@libs/PolicyUtils', () => ({...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'), getConnectedIntegration: jest.fn(() => undefined)}));
jest.mock('@libs/ReportUtils', () => ({...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'), getIntegrationIcon: jest.fn(() => undefined)}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn(() => ''));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), setNavigationActionToMicrotaskQueue: jest.fn()}));

jest.mock('@react-navigation/native', () => {
    const actual: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {...actual, useFocusEffect: jest.fn()};
});

jest.mock('@pages/ErrorPage/NotFoundPage', () => () => null);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@pages/settings/Wallet/CardDetailsActionButtons', () => ({
    __esModule: true,
    default: () => null,
    CardDetailsActionButton: () => null,
}));
jest.mock('@components/CardUnsubmittedTransactionsPrompt', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ImageSVG', () => () => null);
jest.mock('@components/MenuItem', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    function MockMenuItem() {
        return <View />;
    }
    MockMenuItem.BrickRoadIndicator = () => <View />;
    return {__esModule: true, default: MockMenuItem};
});
jest.mock('@components/MenuItem/presets/MenuItemAction', () => () => null);
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItemWithTopDescription', () => () => null);
jest.mock('@components/Modal/Global/ModalContext', () => ({ModalActions: {CONFIRM: 'confirm'}}));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/PlaidCardFeedIcon', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Text', () => () => null);
jest.mock('@userActions/CompanyCards', () => ({
    clearCompanyCardErrorField: jest.fn(),
    unassignWorkspaceCompanyCard: jest.fn(),
    updateWorkspaceCompanyCard: jest.fn(),
}));

const mockMenuItemField = jest.mocked(MenuItemField);
const mockUseCardsList = jest.mocked(useCardsList);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CARD_ID = '99';
const FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#1` as const;
const BANK = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

function pageElement() {
    return (
        <DynamicWorkspaceCompanyCardDetailsPage
            // @ts-expect-error - Minimal test stub; the page reads route.params only and does not use the navigation prop
            route={{key: 'test', name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS, params: {policyID: 'p1', cardID: CARD_ID, feedName: FEED, bank: BANK}}}
            navigation={{}}
        />
    );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DynamicWorkspaceCompanyCardDetailsPage', () => {
    beforeEach(() => {
        capturedMenuItemFields = [];
        mockMenuItemField.mockClear();
        mockMenuItemField.mockImplementation(({name, value}: {name?: string; value?: string}) => {
            capturedMenuItemFields.push({name: name ?? '', value});
            return null;
        });
    });

    it('shows nameValuePairs.cardTitle as the card name field value when the card has a stored title', () => {
        // Given a card with a custom title saved by the admin
        const cardData = createMock<Card>({cardID: Number(CARD_ID), nameValuePairs: {cardTitle: 'Travel Visa'}, accountID: 1});
        mockUseCardsList.mockReturnValue([{[CARD_ID]: cardData}, {status: 'loaded'}]);

        // When the details page renders
        render(pageElement());

        // Then the card name field shows the stored cardTitle
        const cardNameField = capturedMenuItemFields.find((f) => f.name === 'workspace.moreFeatures.companyCards.cardName');
        expect(cardNameField?.value).toBe('Travel Visa');
    });

    it("falls back to the cardholder's default name when no cardTitle is stored on the card", () => {
        // Given a card that was never renamed (nameValuePairs has no cardTitle)
        const cardData = createMock<Card>({cardID: Number(CARD_ID), nameValuePairs: {}, accountID: 1});
        mockUseCardsList.mockReturnValue([{[CARD_ID]: cardData}, {status: 'loaded'}]);

        // When the details page renders
        render(pageElement());

        // Then the card name field shows the display-name fallback
        const cardNameField = capturedMenuItemFields.find((f) => f.name === 'workspace.moreFeatures.companyCards.cardName');
        expect(cardNameField?.value).toBe("Alice Smith's card");
    });
});
