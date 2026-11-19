/** Covers the rendered card benefits separately from card enrollment and verification workflows. */
import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import CompanyCardsEmptyStateGeneric from '@assets/images/companyCards/companycards-generic.svg';
import CompanyCardsEmptyStateUKEU from '@assets/images/companyCards/companycards-uk_eu.svg';
import CompanyCardsEmptyStateUSCA from '@assets/images/companyCards/companycards-us_ca.svg';
import ExpensifyCardIllustration from '@assets/images/expensifyCard/cardIllustration.svg';
import CreditCardsNew from '@assets/images/simple-illustrations/simple-illustration__credit-cards.svg';
import HandCard from '@assets/images/simple-illustrations/simple-illustration__handcard.svg';
import MagnifyingGlassMoney from '@assets/images/simple-illustrations/simple-illustration__magnifyingglass-money.svg';
import MoneyReceipts from '@assets/images/simple-illustrations/simple-illustration__money-receipts.svg';
import MoneyWings from '@assets/images/simple-illustrations/simple-illustration__moneywings.svg';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceCompanyCardPageEmptyState from '@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState';
import WorkspaceExpensifyCardPageEmptyState from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardPageEmptyState';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {PropsWithChildren, ReactElement} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'cardBenefitsPolicy';
const ACCOUNT_ID = 123;
const USER_LOGIN = 'admin@company.com';
const PRESS_EVENT = {nativeEvent: {}};
const currentUser = {accountID: ACCOUNT_ID, login: USER_LOGIN};
const cardRoute: PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route'] = {
    key: 'card-benefits-route',
    name: SCREENS.WORKSPACE.EXPENSIFY_CARD,
    params: {policyID: POLICY_ID},
};

let mockIllustrations: Record<string, IconAsset | null | undefined>;
const mockVerifyAccountAndResume = jest.fn();

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => mockIllustrations,
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: false}),
    useLockedAccountActions: () => ({showLockedAccountModal: jest.fn()}),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn(), closeModal: jest.fn()}),
}));

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: () => ({isUserValidated: false, verifyAccountAndResume: mockVerifyAccountAndResume}),
}));

jest.mock('@hooks/useOtherFeedsForFeedSelector', () => ({__esModule: true, default: () => []}));
jest.mock('@hooks/useExpensifyCardFeedsForFeedSelector', () => ({__esModule: true, default: () => ({allFeeds: []})}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));

// These page wrappers and the promotion banner have no responsibility for rendering benefit items.
jest.mock(
    '@pages/workspace/WorkspacePageWithSections',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock('@pages/workspace/companyCards/WorkspaceCompanyCardExpensifyCardPromotionBanner', () => () => null);

function renderCardPage(page: ReactElement) {
    return render(
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <CurrentUserPersonalDetailsContext.Provider value={currentUser}>
                    <LocaleContextProvider>{page}</LocaleContextProvider>
                </CurrentUserPersonalDetailsContext.Provider>
            </ThemeStylesProvider>
        </ThemeProvider>,
    );
}

async function expectCompanyBenefits() {
    const support = await screen.findByLabelText(translateLocal('workspace.moreFeatures.companyCards.feed.features.support'));
    const assignCards = await screen.findByLabelText(translateLocal('workspace.moreFeatures.companyCards.feed.features.assignCards'));
    const automaticImport = await screen.findByLabelText(translateLocal('workspace.moreFeatures.companyCards.feed.features.automaticImport'));
    expect(within(support).UNSAFE_getByType(Icon).props.src).toBe(mockIllustrations.CreditCardsNew);
    expect(within(assignCards).UNSAFE_getByType(Icon).props.src).toBe(mockIllustrations.HandCard);
    expect(within(automaticImport).UNSAFE_getByType(Icon).props.src).toBe(mockIllustrations.MagnifyingGlassMoney);
}

describe('card empty-state benefit composition', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIllustrations = {
            CreditCardsNew,
            HandCard,
            MagnifyingGlassMoney,
            MoneyReceipts,
            MoneyWings,
            CompanyCardsEmptyStateGeneric,
            CompanyCardsEmptyStateUKEU,
            CompanyCardsEmptyStateUSCA,
            ExpensifyCardIllustration,
        };
        const policy: Policy = {
            ...createRandomPolicy(ACCOUNT_ID, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            policyAccountID: ACCOUNT_ID,
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: USER_LOGIN,
            employeeList: {[USER_LOGIN]: {role: CONST.POLICY.ROLE.ADMIN}},
            isFromFullPolicy: true,
            pendingAction: null,
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('renders the company-card benefits and disclaimer while leaving verification on the CTA', async () => {
        // Given an unverified admin whose company-card benefits are informational
        renderCardPage(
            <WorkspaceCompanyCardPageEmptyState
                policyID={POLICY_ID}
                shouldShowGBDisclaimer
            />,
        );
        await expectCompanyBenefits();
        const support = translateLocal('workspace.moreFeatures.companyCards.feed.features.support');

        // When the reader inspects a benefit instead of starting setup
        fireEvent.press(screen.getByLabelText(support), PRESS_EVENT);

        // Then all three illustrated labels stay ordered and only the separate CTA can verify the account
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([CreditCardsNew, HandCard, MagnifyingGlassMoney]);
        expect(within(screen.getByLabelText(support)).UNSAFE_getByType(Icon).props.src).toBe(CreditCardsNew);
        expect(screen.UNSAFE_getAllByType(ImageSVG).at(0)?.props.src).toBe(CompanyCardsEmptyStateUSCA);
        expect(screen.getByText(translateLocal('workspace.moreFeatures.companyCards.feed.title'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.companyCards.feed.subtitle'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.companyCards.ukRegulation'))).toBeOnTheScreen();
        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('workspace.companyCards.addCards')});
        expect(cta).toBeEnabled();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);
        fireEvent.press(cta, PRESS_EVENT);
        expect(mockVerifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(mockVerifyAccountAndResume).toHaveBeenCalledWith(undefined);
    });

    it.each([
        ['CreditCardsNew', 'workspace.moreFeatures.companyCards.feed.features.support', [HandCard, MagnifyingGlassMoney]],
        ['HandCard', 'workspace.moreFeatures.companyCards.feed.features.assignCards', [CreditCardsNew, MagnifyingGlassMoney]],
        ['MagnifyingGlassMoney', 'workspace.moreFeatures.companyCards.feed.features.automaticImport', [CreditCardsNew, HandCard]],
    ] as const)('omits only the benefit with a null %s asset', async (asset, missingKey, remainingIcons) => {
        // Given three visible benefits, so an absent label cannot pass because the page never loaded
        renderCardPage(<WorkspaceCompanyCardPageEmptyState policyID={POLICY_ID} />);
        await expectCompanyBenefits();
        screen.unmount();
        mockIllustrations[asset] = null;

        // When this caller receives a specifically null illustration
        renderCardPage(<WorkspaceCompanyCardPageEmptyState policyID={POLICY_ID} />);
        await screen.findByRole(CONST.ROLE.BUTTON, {name: translateLocal('workspace.companyCards.addCards')});

        // Then only that item is omitted, and the remaining labels retain their artwork and order
        expect(screen.queryByLabelText(translateLocal(missingKey))).not.toBeOnTheScreen();
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual(remainingIcons);
        expect(screen.UNSAFE_getAllByType(MenuItem.Root)).toHaveLength(2);
    });

    it.each(['CreditCardsNew', 'HandCard', 'MagnifyingGlassMoney'] as const)('retains the benefit when the %s asset is undefined rather than null', async (asset) => {
        // Given an unresolved illustration, which the caller deliberately treats differently from null
        mockIllustrations[asset] = undefined;

        // When the real caller composes its children before that asset is available
        renderCardPage(<WorkspaceCompanyCardPageEmptyState policyID={POLICY_ID} />);

        // Then all three translated labels remain available instead of being lost to a truthiness filter
        await expectCompanyBenefits();
        expect(screen.UNSAFE_getAllByType(MenuItem.Root)).toHaveLength(3);
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([
            mockIllustrations.CreditCardsNew,
            mockIllustrations.HandCard,
            mockIllustrations.MagnifyingGlassMoney,
        ]);
    });

    it.each([CONST.CURRENCY.USD, CONST.CURRENCY.GBP, CONST.CURRENCY.EUR])('renders the applicable Expensify Card benefits for %s without changing enrollment', async (currency) => {
        // Given a workspace whose actual currency hook decides whether UK/EU benefits apply
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {outputCurrency: currency});
        });

        // When the real card page renders its composed benefits
        renderCardPage(<WorkspaceExpensifyCardPageEmptyState route={cardRoute} />);
        const unlimited = translateLocal('workspace.moreFeatures.expensifyCard.feed.features.unlimited');
        const spend = translateLocal('workspace.moreFeatures.expensifyCard.feed.features.spend');
        const cashback = translateLocal('workspace.moreFeatures.expensifyCard.feed.features.cashBack');
        const isUkEu = currency !== CONST.CURRENCY.USD;
        await screen.findByLabelText(unlimited);

        // Then the two common benefits stay paired and ordered, while only the US page includes cashback
        expect(within(screen.getByLabelText(unlimited)).UNSAFE_getByType(Icon).props.src).toBe(CreditCardsNew);
        expect(within(screen.getByLabelText(spend)).UNSAFE_getByType(Icon).props.src).toBe(MoneyWings);
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual(isUkEu ? [CreditCardsNew, MoneyWings] : [MoneyReceipts, CreditCardsNew, MoneyWings]);
        expect(screen.queryByLabelText(cashback) !== null).toBe(!isUkEu);
        expect(screen.UNSAFE_getAllByType(ImageSVG).at(0)?.props.src).toBe(ExpensifyCardIllustration);
        expect(screen.getByText(translateLocal('workspace.moreFeatures.expensifyCard.feed.title'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.expensifyCard.feed.subTitle'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal(isUkEu ? 'workspace.expensifyCard.euUkDisclaimer' : 'workspace.expensifyCard.disclaimer'))).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText(unlimited), PRESS_EVENT);
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When setup is deliberately started, the unchanged bank-account enrollment route is still reachable
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('workspace.moreFeatures.expensifyCard.feed.ctaTitle')});
        expect(cta).toBeEnabled();
        fireEvent.press(cta, PRESS_EVENT);

        // Then a benefit press cannot be confused with the one real enrollment action
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: POLICY_ID, backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID)}));
    });
});
