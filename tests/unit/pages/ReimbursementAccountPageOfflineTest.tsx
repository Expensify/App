import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';

import ReimbursementAccountPage from '@pages/ReimbursementAccount/ReimbursementAccountPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, ReimbursementAccount} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ReimbursementAccountTestUtils from '../../utils/ReimbursementAccountTestUtils';
import type {MockFetch} from '../../utils/TestHelper';

import createMock from '../../utils/createMock';
import {buildAchData, OTHER_POLICY_ID, POLICY_ID} from '../../utils/ReimbursementAccountTestUtils';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: jest.requireActual<typeof ReimbursementAccountTestUtils>('../../utils/ReimbursementAccountTestUtils').createNavigationMock(),
}));

// Stub the entry point so the assertions are about which branch the page picked, not about its internals.
const mockEntryPoint = jest.fn(() => null);

jest.mock('@pages/ReimbursementAccount/VerifiedBankAccountFlowEntryPoint', () => ({
    __esModule: true,
    default: () => mockEntryPoint(),
}));

jest.mock('@components/ReimbursementAccountLoadingIndicator', () => ({
    __esModule: true,
    default: () => null,
}));

const USD_POLICY: Policy = {
    id: POLICY_ID,
    name: 'Test workspace',
    outputCurrency: CONST.CURRENCY.USD,
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    owner: 'admin@example.com',
};

// DEFAULT_DATA's achData is only `{state: 'SETUP'}`, which is narrower than the ACH type, so it goes through createMock.
const DEFAULT_ACCOUNT = createMock<ReimbursementAccount>(CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);

const OFFLINE_TITLE = 'You appear to be offline.';

type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;

const route: PageProps['route'] = {
    key: 'reimbursement-account-root',
    name: SCREENS.REIMBURSEMENT_ACCOUNT_ROOT,
    params: {policyID: POLICY_ID},
};

// The page does not read the navigation prop. This inert double only satisfies the navigator-provided prop.
const navigation = createMock<PageProps['navigation']>({});

// Leaving the account undefined models the first visit, when the REIMBURSEMENT_ACCOUNT key has never been written.
const seedOnyx = async (account?: ReimbursementAccount) => {
    await act(async () => {
        if (account) {
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, account);
        }
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, USD_POLICY);
        await waitForBatchedUpdatesWithAct();
    });
};

const renderPage = async () => {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReimbursementAccountPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
};

const expectOfflineViewOnly = () => {
    expect(mockEntryPoint).not.toHaveBeenCalled();
    expect(screen.getByText(OFFLINE_TITLE)).toBeOnTheScreen();
};

describe('ReimbursementAccountPage offline', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        mockFetch = getGlobalFetchMock();
        global.fetch = mockFetch;
    });

    beforeEach(() => {
        // The mount fetch is a read, so it still goes out offline. It fails, which applies the command's failureData.
        mockFetch.fail();
        act(() => setHasRadio(false));
    });

    afterEach(async () => {
        act(() => setHasRadio(true));
        mockFetch.succeed();
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('keeps the offline view on a first visit with no cached account', async () => {
        // Given the account key has never been written, as when a workspace opens the page for the first time
        await seedOnyx();

        // When the page is opened offline and its mount writes plus the failed fetch settle
        await renderPage();

        // Then the `{achData: {}}` shell those writes leave behind does not swap the offline view for the entry point
        expectOfflineViewOnly();
    });

    it('shows the entry point for a cached account that belongs to this workspace', async () => {
        // Given a real account for this workspace is already cached
        await seedOnyx({achData: buildAchData({state: CONST.BANK_ACCOUNT.STATE.SETUP, currentStep: CONST.BANK_ACCOUNT.STEP.COUNTRY}), isLoading: false});

        // When the page is opened offline
        await renderPage();

        // Then the cached account is trusted and the user can keep working offline
        expect(mockEntryPoint).toHaveBeenCalled();
    });

    it('keeps the offline view when the cached account belongs to another workspace', async () => {
        // Given the cached account describes a different workspace, as after a reload on that workspace's page
        await seedOnyx({achData: buildAchData({policyID: OTHER_POLICY_ID, state: CONST.BANK_ACCOUNT.STATE.SETUP}), isLoading: false});

        // When this workspace's page is opened offline
        await renderPage();

        // Then the other workspace's data is not shown as this workspace's account
        expectOfflineViewOnly();
    });

    it('keeps the offline view when only a top-level field differs from the default data', async () => {
        // Given the default account with one unrelated top-level field changed, which several actions can leave behind
        await seedOnyx({...DEFAULT_ACCOUNT, shouldShowResetModal: true});

        // When the page is opened offline
        await renderPage();

        // Then the default achData is not treated as loaded data for this workspace
        expectOfflineViewOnly();
    });

    it('keeps the offline view for the default data', async () => {
        // Given the account was reset to the default data when the page last unmounted
        await seedOnyx(DEFAULT_ACCOUNT);

        // When the page is opened offline
        await renderPage();

        // Then the offline view shows, as it did before
        expectOfflineViewOnly();
    });
});
