import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import TravelMenuItem from '@pages/inbox/sidebar/FABPopoverContent/menuItems/TravelMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type CapturedMenuItemProps = {
    isVisible?: boolean;
    onPress?: () => void;
};

const mockFABFocusableMenuItem = jest.fn<null, [CapturedMenuItemProps]>(() => null);
jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem', () => ({
    __esModule: true,
    default: (props: CapturedMenuItemProps) => mockFABFocusableMenuItem(props),
}));

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
    shouldOpenTravelDotLinkWeb: jest.fn(() => true),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockShowConfirmModal = jest.fn<void, [{prompt?: string}]>();
jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: mockShowConfirmModal, closeModal: jest.fn()})));

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const WORKSPACE_WITHOUT_TRAVEL_ID = 'policy-no-travel-123';
const TRAVEL_WORKSPACE_ID = 'policy-travel-456';

const provisionedTravelSettings = {spotnanaCompanyID: 'spotnana-company-uuid', associatedTravelDomainAccountID: 'spotnana-entity-uuid', hasAcceptedTerms: true};

function buildPolicy(id: string, name: string, travelFields: Record<string, unknown> = {}) {
    return {
        id,
        name,
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        pendingAction: null,
        owner: CURRENT_USER_EMAIL,
        outputCurrency: CONST.CURRENCY.USD,
        ...travelFields,
    };
}

const seedWorkspaces = async (defaultPolicyID: string, travelWorkspaceFields: Record<string, unknown>) => {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: CURRENT_USER_EMAIL});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE_WITHOUT_TRAVEL_ID}`, buildPolicy(WORKSPACE_WITHOUT_TRAVEL_ID, 'Workspace Without Travel'));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TRAVEL_WORKSPACE_ID}`, buildPolicy(TRAVEL_WORKSPACE_ID, 'Travel Workspace', travelWorkspaceFields));
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, defaultPolicyID);
    });
    await waitForBatchedUpdatesWithAct();
};

function renderMenuItem() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <TravelMenuItem />
        </ComposeProviders>,
    );
}

const pressMenuItem = async () => {
    await act(async () => {
        mockFABFocusableMenuItem.mock.lastCall?.[0].onPress?.();
    });
    await waitForBatchedUpdatesWithAct();
};

describe('TravelMenuItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('is hidden when none of the workspaces have travel', async () => {
        await seedWorkspaces(WORKSPACE_WITHOUT_TRAVEL_ID, {});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        expect(mockFABFocusableMenuItem.mock.lastCall?.[0].isVisible).toBe(false);
    });

    it('is visible when another workspace has travel, even though the default workspace does not', async () => {
        await seedWorkspaces(WORKSPACE_WITHOUT_TRAVEL_ID, {isTravelEnabled: true, travelSettings: provisionedTravelSettings});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        expect(mockFABFocusableMenuItem.mock.lastCall?.[0].isVisible).toBe(true);
    });

    it('is visible when a policy summary says another workspace is provisioned', async () => {
        await seedWorkspaces(WORKSPACE_WITHOUT_TRAVEL_ID, {isTravelEnabled: true, isTravelProvisioned: true});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        expect(mockFABFocusableMenuItem.mock.lastCall?.[0].isVisible).toBe(true);
    });

    it('is hidden when a policy summary says another workspace is provisioned but Travel is disabled', async () => {
        await seedWorkspaces(WORKSPACE_WITHOUT_TRAVEL_ID, {isTravelProvisioned: true});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        expect(mockFABFocusableMenuItem.mock.lastCall?.[0].isVisible).toBe(false);
    });

    it('explains the wrong default workspace instead of opening travel for another workspace', async () => {
        await seedWorkspaces(WORKSPACE_WITHOUT_TRAVEL_ID, {isTravelEnabled: true, travelSettings: provisionedTravelSettings});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        await pressMenuItem();

        expect(mockShowConfirmModal.mock.lastCall?.[0].prompt).toBe(translateLocal('travel.defaultWorkspaceTravelDisabled.message'));
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens travel when the default workspace is set up for travel', async () => {
        await seedWorkspaces(TRAVEL_WORKSPACE_ID, {isTravelEnabled: true, travelSettings: provisionedTravelSettings});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        await pressMenuItem();

        expect(openTravelDotLink).toHaveBeenCalledWith(TRAVEL_WORKSPACE_ID);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('offers travel setup when the default workspace has travel switched on but unfinished', async () => {
        await seedWorkspaces(TRAVEL_WORKSPACE_ID, {isTravelEnabled: true});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        await pressMenuItem();

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TRAVEL_MY_TRIPS.getRoute(TRAVEL_WORKSPACE_ID));
    });

    it('does not block when the account has no default workspace', async () => {
        await seedWorkspaces('policy-that-does-not-exist', {isTravelEnabled: true, travelSettings: provisionedTravelSettings});
        renderMenuItem();
        await waitForBatchedUpdatesWithAct();

        await pressMenuItem();

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});
