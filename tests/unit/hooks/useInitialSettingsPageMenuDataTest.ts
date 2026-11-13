import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import type * as TryNewDotUtils from '@libs/TryNewDotUtils';
import {isTryNewDotLoading} from '@libs/TryNewDotUtils';

import useInitialSettingsPageMenuData from '@pages/settings/useInitialSettingsPageMenuData';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useCardFeedErrors', () => () => ({personalCard: {shouldShowRBR: false}}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: jest.fn()})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNonPersonalCardList', () => () => []);
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePrivateSubscription', () => () => undefined);
jest.mock('@hooks/useSignOut', () => () => ({signOut: jest.fn(), signOutImmediately: jest.fn()}));
jest.mock('@libs/actions/ExitSurvey', () => ({resetExitSurveyForm: jest.fn()}));
jest.mock('@libs/actions/HybridApp', () => ({closeReactNativeApp: jest.fn()}));
jest.mock('@libs/AgentUtils', () => ({hasAgentErrorsSelector: jest.fn()}));
jest.mock('@libs/BankAccountUtils', () => ({hasPartiallySetupBankAccount: jest.fn(), hasPersonalBankAccountMissingInfo: jest.fn()}));
jest.mock('@libs/CardUtils', () => ({
    hasCardPendingDigitalWalletApproval: jest.fn(),
    hasPendingExpensifyCardAction: jest.fn(),
    hasVirtualExpensifyCardMissingPersonalDetails: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/SubscriptionUtils', () => ({getFreeTrialText: jest.fn(), hasSubscriptionRedDotError: jest.fn(), shouldShowSubscriptionExpiringSoonUI: jest.fn()}));
jest.mock('@libs/TryNewDotUtils', () => {
    const actual = jest.requireActual<typeof TryNewDotUtils>('@libs/TryNewDotUtils');
    return {...actual, isTryNewDotLoading: jest.fn(actual.isTryNewDotLoading)};
});
jest.mock('@libs/UserUtils', () => ({expensifyLoginsSelector: jest.fn(), getProfilePageBrickRoadIndicator: jest.fn(), hasDeviceManagementError: jest.fn()}));
jest.mock('@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveHomeAddress', () => () => ({shouldShowAddHomeAddress: false}));
jest.mock('@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveWiseMoreInfoNeeded', () => () => ({wiseMoreInfoNeededBankAccounts: []}));
jest.mock('@pages/settings/useSettingsNavigationMenuData', () => () => ({accountMenuItemsData: {items: []}, generalMenuItemsData: {items: []}}));
jest.mock('@userActions/Link', () => ({openExternalLink: jest.fn(), openOldDotLink: jest.fn()}));
jest.mock('@userActions/PaymentMethods', () => ({hasPaymentMethodError: jest.fn()}));
jest.mock('@userActions/Session', () => ({hasStashedSession: jest.fn(), isSupportAuthToken: jest.fn()}));

describe('Account settings Classic eligibility', () => {
    let tryNewDot: TryNewDot | undefined;
    let isLoadingApp: boolean;
    let storageStatus: 'loading' | 'loaded';

    beforeEach(() => {
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', true);
        tryNewDot = undefined;
        isLoadingApp = true;
        storageStatus = 'loaded';
        jest.mocked(useOnyx).mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.NVP_TRY_NEW_DOT:
                    return [tryNewDot, {status: storageStatus}];
                case ONYXKEYS.IS_LOADING_APP:
                    return [isLoadingApp, {status: 'loaded'}];
                default:
                    return [undefined, {status: 'loaded'}];
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    function renderMenu() {
        return renderHook(() => useInitialSettingsPageMenuData(createMock<CurrentUserPersonalDetails>({accountID: 1})));
    }

    function findClassicItem(menu: ReturnType<typeof useInitialSettingsPageMenuData>) {
        return menu.generalMenuItemsData.items.find((item) => item.translationKey === 'exitSurvey.goToExpensifyClassic');
    }

    it('passes unresolved OpenApp loading to the shared check even after storage loads', () => {
        // Given a missing NVP with storage already loaded while OpenApp is still pending
        // When Account settings builds its Classic item
        const {result} = renderMenu();

        // Then this caller uses the same loading rule as the exit action
        expect(isTryNewDotLoading).toHaveBeenCalledWith(undefined, false, true);
        expect(findClassicItem(result.current)).toBeUndefined();
    });

    it('keeps the item hidden through reset and blocked-account hydration without tapping', () => {
        // Given an eligible nudged account whose Classic item is initially available
        tryNewDot = createMock<TryNewDot>({nudgeMigration: {timestamp: new Date()}});
        isLoadingApp = false;
        const {result, rerender} = renderMenu();
        expect(findClassicItem(result.current)).toBeDefined();

        // When reset clears eligibility and OpenApp later returns a locked nudged account
        tryNewDot = undefined;
        isLoadingApp = true;
        rerender({});
        expect(findClassicItem(result.current)).toBeUndefined();
        tryNewDot = createMock<TryNewDot>({nudgeMigration: {timestamp: new Date()}, isLockedToNewApp: true});
        isLoadingApp = false;
        rerender({});

        // Then Classic stays hidden without requiring a tap
        expect(findClassicItem(result.current)).toBeUndefined();
        expect(closeReactNativeApp).not.toHaveBeenCalled();
    });

    it('shows the eligible nudged item after storage loads and preserves its exit action', () => {
        // Given an eligible nudged account whose storage subscription is still loading
        tryNewDot = createMock<TryNewDot>({nudgeMigration: {timestamp: new Date()}});
        storageStatus = 'loading';
        isLoadingApp = false;
        const {result, rerender} = renderMenu();
        expect(findClassicItem(result.current)).toBeUndefined();

        // When storage finishes loading and the user selects Classic
        storageStatus = 'loaded';
        rerender({});
        const classicItem = findClassicItem(result.current);
        expect(classicItem).toBeDefined();
        classicItem?.action();

        // Then the existing native handoff requests the NVP update
        expect(closeReactNativeApp).toHaveBeenCalledWith({shouldSetNVP: true, isTrackingGPS: false});
    });

    it('retains the migration-nudge gate when OpenApp finishes without an NVP', () => {
        // Given a missing NVP while OpenApp is pending
        const {result, rerender} = renderMenu();

        // When OpenApp finishes without returning the optional migration nudge
        isLoadingApp = false;
        rerender({});

        // Then shared loading resolves but the existing nudge requirement still hides this menu item
        expect(isTryNewDotLoading).toHaveBeenLastCalledWith(undefined, false, false);
        expect(findClassicItem(result.current)).toBeUndefined();
    });

    it('preserves web availability and the existing exit survey action', () => {
        // Given a nudged web account with a mobile-only lock and loading storage
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        tryNewDot = createMock<TryNewDot>({nudgeMigration: {timestamp: new Date()}, isLockedToNewApp: true});
        storageStatus = 'loading';

        // When the user selects the web Classic item
        const {result} = renderMenu();
        const classicItem = findClassicItem(result.current);
        expect(classicItem).toBeDefined();
        classicItem?.action();

        // Then web still enters its exit survey rather than using the native handoff
        expect(resetExitSurveyForm).toHaveBeenCalled();
        expect(closeReactNativeApp).not.toHaveBeenCalled();
    });
});
