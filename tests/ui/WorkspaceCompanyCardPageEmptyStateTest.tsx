import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceCompanyCardPageEmptyState from '@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState';

import {clearAddNewCardFlow} from '@userActions/CompanyCards';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

const POLICY_ID = 'policy123';

let mockIsUserValidated = false;
let mockIsActingAsDelegate = false;
let mockOtherFeeds: Array<{value: string}> = [];
let mockCapturedOnResume: ((payload?: () => void) => void) | undefined;
const mockVerifyAccountAndResume = jest.fn<void, [payload?: () => void]>();
const mockShowDelegateNoAccessModal = jest.fn();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: (onResume: (payload?: () => void) => void) => {
        mockCapturedOnResume = onResume;
        return {isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume};
    },
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isActingAsDelegate: mockIsActingAsDelegate}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal}),
}));

jest.mock('@components/FeatureList', () => {
    const {Pressable} = jest.requireActual<{Pressable: React.ComponentType<{testID: string; accessibilityRole: 'button'; onPress: () => void}>}>('react-native');
    return ({onCtaPress}: {onCtaPress: () => void}) => (
        <Pressable
            testID="addCardsCta"
            accessibilityRole="button"
            onPress={onCtaPress}
        />
    );
});

jest.mock('@pages/workspace/companyCards/WorkspaceCompanyCardExpensifyCardPromotionBanner', () => () => null);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/useOtherFeedsForFeedSelector', () => ({
    __esModule: true,
    default: () => mockOtherFeeds,
}));

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => ({id: POLICY_ID, policyAccountID: 123, outputCurrency: 'USD'}),
}));

jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({showReadOnlyModal: jest.fn(), withReadOnlyFallback: (callback: () => void) => callback}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

jest.mock('@libs/CardUtils', () => ({hasIssuedExpensifyCard: () => true}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: (path: string) => path,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@userActions/CompanyCards', () => ({clearAddNewCardFlow: jest.fn()}));

const mockNavigate = jest.mocked(Navigation.navigate);
const mockClearAddNewCardFlow = jest.mocked(clearAddNewCardFlow);

function renderEmptyState() {
    return render(<WorkspaceCompanyCardPageEmptyState policyID={POLICY_ID} />);
}

function pressAddCards() {
    fireEvent.press(screen.getByTestId('addCardsCta'));
}

describe('WorkspaceCompanyCardPageEmptyState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsUserValidated = false;
        mockIsActingAsDelegate = false;
        mockOtherFeeds = [];
        mockCapturedOnResume = undefined;
    });

    it('navigates a validated user with feeds from other workspaces straight to the feed selector', () => {
        mockIsUserValidated = true;
        mockOtherFeeds = [{value: 'feed1'}];
        renderEmptyState();

        pressAddCards();

        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(POLICY_ID));
        expect(mockClearAddNewCardFlow).not.toHaveBeenCalled();
    });

    it('navigates a validated user without other feeds straight to the add new card flow', () => {
        mockIsUserValidated = true;
        renderEmptyState();

        pressAddCards();

        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(mockClearAddNewCardFlow).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path);
    });

    it.each([
        ['with feeds from other workspaces', [{value: 'feed1'}], () => ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(POLICY_ID)],
        ['without other feeds', [], () => DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path],
    ])('defers to account verification for an unvalidated user and resumes the branching %s', async (_, otherFeeds, expectedRoute) => {
        mockOtherFeeds = otherFeeds;
        renderEmptyState();

        // When an unvalidated user presses the CTA, the flow is deferred to the verify account screen
        pressAddCards();
        expect(mockVerifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();

        // When validation succeeds and the flow resumes, the branching runs and picks the right destination
        await act(async () => {
            mockCapturedOnResume?.();
        });
        expect(mockNavigate).toHaveBeenCalledWith(expectedRoute());
    });

    it('shows the delegate no access modal instead of any navigation for a delegate', () => {
        mockIsActingAsDelegate = true;
        renderEmptyState();

        pressAddCards();

        expect(mockShowDelegateNoAccessModal).toHaveBeenCalledTimes(1);
        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
