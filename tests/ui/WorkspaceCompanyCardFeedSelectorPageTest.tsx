import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceCompanyCardFeedSelectorPage from '@pages/workspace/companyCards/WorkspaceCompanyCardFeedSelectorPage';

import {clearAddNewCardFlow} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

const POLICY_ID = 'policy123';

let mockIsUserValidated = false;
let mockIsBlockedToAddNewFeeds = false;
let mockCapturedOnResume: ((payload?: () => void) => void) | undefined;
const mockVerifyAccountAndResume = jest.fn<void, [payload?: () => void]>();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: (onResume: (payload?: () => void) => void) => {
        mockCapturedOnResume = onResume;
        return {isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume};
    },
}));

jest.mock('@components/HeaderWithBackButton', () => () => null);
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

jest.mock('@components/MenuItem/presets/MenuItemAction', () => {
    const {Pressable} = jest.requireActual<{Pressable: React.ComponentType<{testID: string; accessibilityRole: 'button'; onPress: () => void}>}>('react-native');
    return ({onPress}: {onPress: () => void}) => (
        <Pressable
            testID="addCardsMenuItem"
            accessibilityRole="button"
            onPress={onPress}
        />
    );
});

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => ({shouldShowRbrForFeedNameWithDomainID: {}}),
}));

jest.mock('@hooks/useCompanyCardIcons', () => ({
    useCompanyCardFeedIcons: () => ({}),
}));

jest.mock('@hooks/useCompanyCards', () => ({
    __esModule: true,
    default: () => ({companyCardFeeds: {}, feedName: undefined}),
}));

jest.mock('@hooks/useIsBlockedToAddFeed', () => ({
    __esModule: true,
    default: () => ({isBlockedToAddNewFeeds: mockIsBlockedToAddNewFeeds}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Plus: 'Plus'}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/useOtherFeedsForFeedSelector', () => ({
    __esModule: true,
    default: () => [],
}));

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => ({id: POLICY_ID, name: 'Acme'}),
}));

jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({canWrite: true}),
}));

jest.mock('@hooks/usePrimaryContactMethod', () => ({
    __esModule: true,
    default: () => 'admin@example.com',
}));

jest.mock('@hooks/useThemeIllustrations', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: (path: string) => path,
}));

jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), goBack: jest.fn()},
}));

jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

jest.mock('@userActions/Card', () => ({updateSelectedFeed: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({clearAddNewCardFlow: jest.fn(), linkCardFeedToPolicy: jest.fn()}));

const mockNavigate = jest.mocked(Navigation.navigate);
const mockClearAddNewCardFlow = jest.mocked(clearAddNewCardFlow);

const expectedUpgradeRoute = () =>
    ROUTES.WORKSPACE_UPGRADE.getRoute(POLICY_ID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(POLICY_ID));

type WorkspaceCompanyCardFeedSelectorPageScreenProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

const route: WorkspaceCompanyCardFeedSelectorPageScreenProps['route'] = {
    key: 'workspace-company-cards-select-feed',
    name: SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as WorkspaceCompanyCardFeedSelectorPageScreenProps['navigation'];

function renderFeedSelectorPage() {
    return render(
        <WorkspaceCompanyCardFeedSelectorPage
            route={route}
            navigation={navigation}
        />,
    );
}

function pressAddCards() {
    fireEvent.press(screen.getByTestId('addCardsMenuItem'));
}

describe('WorkspaceCompanyCardFeedSelectorPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsUserValidated = false;
        mockIsBlockedToAddNewFeeds = false;
        mockCapturedOnResume = undefined;
    });

    it('navigates a validated user on a plan blocked from new feeds straight to the upgrade screen', () => {
        mockIsUserValidated = true;
        mockIsBlockedToAddNewFeeds = true;
        renderFeedSelectorPage();

        pressAddCards();

        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(mockClearAddNewCardFlow).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(expectedUpgradeRoute());
    });

    it('navigates a validated unblocked user straight to the add new card flow', () => {
        mockIsUserValidated = true;
        renderFeedSelectorPage();

        pressAddCards();

        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(mockClearAddNewCardFlow).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path);
    });

    it.each([
        ['blocked from adding new feeds', true, expectedUpgradeRoute],
        ['allowed to add new feeds', false, () => DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path],
    ])('defers to account verification for an unvalidated user %s and resumes the branching after validation', async (_, isBlocked, expectedRoute) => {
        mockIsBlockedToAddNewFeeds = isBlocked;
        renderFeedSelectorPage();

        // When an unvalidated user presses Add cards, the flow is deferred to the verify account screen
        pressAddCards();
        expect(mockVerifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockClearAddNewCardFlow).not.toHaveBeenCalled();

        // When validation succeeds and the flow resumes, the upgrade gate runs and picks the right destination
        await act(async () => {
            mockCapturedOnResume?.();
        });
        expect(mockClearAddNewCardFlow).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(expectedRoute());
    });
});
