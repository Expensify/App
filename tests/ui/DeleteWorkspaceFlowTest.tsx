import {act, render, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getTravelBillingCardSettingsKey, getTravelBillingFeedID} from '@libs/TravelBillingUtils';

import DeleteWorkspaceFlow from '@pages/workspace/deleteWorkspace/DeleteWorkspaceFlow';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomCard from '../utils/collections/card';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ConfirmModalCall = {
    prompt?: React.ReactNode;
    shouldShowCancelButton?: boolean;
};

const mockDeleteWorkspace = jest.fn();
const mockShowConfirmModal = jest.fn<Promise<ModalStateChangePayload>, [ConfirmModalCall]>();
const mockUseNetwork = jest.fn<{isOffline: boolean}, []>();

jest.mock('@libs/actions/Policy/Policy', () => ({
    calculateBillNewDot: jest.fn(),
    deleteWorkspace: (...args: unknown[]) => {
        mockDeleteWorkspace(...args);
    },
    dismissWorkspaceError: jest.fn(),
}));

jest.mock('@hooks/useConfirmModal', () =>
    jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: jest.fn(),
    })),
);

jest.mock('@hooks/useNetwork', () => () => mockUseNetwork());

jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => (suffix: string) => suffix);

jest.mock('@libs/actions/Modal', () => ({
    close: jest.fn().mockImplementation((callback?: () => void) => callback?.()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

const POLICY_ID = 'ABCDEF1234567890';
const WORKSPACE_ACCOUNT_ID = 1001;
const DOMAIN_FUND_ID = 2002;
const USER_ACCOUNT_ID = 1;
const USER_EMAIL = 'admin@example.com';

const renderFlow = (onDeleteComplete = jest.fn()) =>
    render(
        <LocaleContextProvider>
            <DeleteWorkspaceFlow
                policyID={POLICY_ID}
                onDismiss={jest.fn()}
                onDeleteComplete={onDeleteComplete}
            />
        </LocaleContextProvider>,
    );

async function enableTravelBilling(fundID: number, linkedPolicyIDs?: string[]) {
    const travelCard = createRandomCard(fundID, {bank: CONST.EXPENSIFY_CARD.BANK, state: CONST.EXPENSIFY_CARD.STATE.OPEN});
    await Onyx.set(getTravelBillingCardSettingsKey(fundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: {isEnabled: true, linkedPolicyIDs}});
    await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${getTravelBillingFeedID(fundID)}`, {[travelCard.cardID]: travelCard});
}

async function issueExpensifyCard() {
    const expensifyCard = createRandomCard(1, {bank: CONST.EXPENSIFY_CARD.BANK, state: CONST.EXPENSIFY_CARD.STATE.OPEN});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areExpensifyCardsEnabled: true});
    await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${WORKSPACE_ACCOUNT_ID}_${CONST.EXPENSIFY_CARD.BANK}`, {[expensifyCard.cardID]: expensifyCard});
}

function getErrorModalHTML() {
    const prompt = mockShowConfirmModal.mock.calls.at(1)?.[0].prompt;
    if (!React.isValidElement<{children?: React.ReactNode}>(prompt)) {
        return undefined;
    }
    const renderHTML = prompt.props.children;
    return React.isValidElement<{html?: string}>(renderHTML) ? renderHTML.props.html : undefined;
}

describe('DeleteWorkspaceFlow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        mockDeleteWorkspace.mockReset();
        mockShowConfirmModal.mockReset();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        mockUseNetwork.mockReturnValue({isOffline: true});
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: 'Test', role: CONST.POLICY.ROLE.ADMIN, policyAccountID: WORKSPACE_ACCOUNT_ID});
        });
    });

    it('shows the Consolidated Travel Billing error instead of deleting the workspace while offline', async () => {
        // Given an offline admin whose workspace pays for travel through its own Consolidated Travel Billing, which the backend refuses to delete
        await act(async () => {
            await enableTravelBilling(WORKSPACE_ACCOUNT_ID);
        });

        // When the admin confirms the delete
        renderFlow();
        await waitForBatchedUpdatesWithAct();

        // Then the delete is not queued and the travel billing warning is shown, because the real rejection reason only arrives after reconnecting
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
        expect(mockDeleteWorkspace).toHaveBeenCalledWith(expect.objectContaining({deleteWorkspaceBlockedErrorKey: 'workspace.common.deleteTravelBillingError'}));
        expect(mockShowConfirmModal).toHaveBeenLastCalledWith(expect.objectContaining({shouldShowCancelButton: false}));
        expect(getErrorModalHTML()).toBe(translateLocal('workspace.common.deleteTravelBillingError'));
    });

    it('shows the Expensify Cards error while offline when the workspace has both blockers', async () => {
        // Given an offline admin whose workspace has active Expensify Cards as well as Consolidated Travel Billing
        await act(async () => {
            await enableTravelBilling(WORKSPACE_ACCOUNT_ID);
            await issueExpensifyCard();
        });

        // When the admin confirms the delete
        renderFlow();
        await waitForBatchedUpdatesWithAct();

        // Then the Expensify Cards warning wins, matching the warning shown when the same delete is rejected online
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
        expect(mockDeleteWorkspace).toHaveBeenCalledWith(expect.objectContaining({deleteWorkspaceBlockedErrorKey: 'workspace.common.deleteOpenExpensifyCardsError'}));
        expect(getErrorModalHTML()).toBe(translateLocal('workspace.common.deleteOpenExpensifyCardsError'));
    });

    it('still deletes the workspace offline when its Consolidated Travel Billing is funded by a domain', async () => {
        // Given an offline admin whose workspace is billed for travel by a domain, which the backend lets the workspace be deleted with
        const onDeleteComplete = jest.fn();
        await act(async () => {
            await enableTravelBilling(DOMAIN_FUND_ID, [POLICY_ID]);
        });

        // When the admin confirms the delete
        renderFlow(onDeleteComplete);
        await waitForBatchedUpdatesWithAct();

        // Then the delete goes ahead optimistically without a warning
        await waitFor(() => expect(onDeleteComplete).toHaveBeenCalled());
        expect(mockDeleteWorkspace).toHaveBeenCalledWith(expect.objectContaining({deleteWorkspaceBlockedErrorKey: undefined}));
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('sends the delete while online and shows the Consolidated Travel Billing warning when the backend rejects it', async () => {
        // Given an online admin whose workspace has Consolidated Travel Billing
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockDeleteWorkspace.mockImplementation(() => Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}));
        await act(async () => {
            await enableTravelBilling(WORKSPACE_ACCOUNT_ID);
        });

        // When the admin confirms the delete and the backend rejects it with its Expensify Cards wording
        renderFlow();
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(mockDeleteWorkspace).toHaveBeenCalled());
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                pendingAction: null,
                errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.common.deleteOpenExpensifyCardsError'),
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the delete is sent without a pre-flight warning, and the rejection shows the travel billing warning in place of the backend's wording
        expect(mockDeleteWorkspace).toHaveBeenCalledWith(expect.objectContaining({deleteWorkspaceBlockedErrorKey: undefined}));
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
        expect(getErrorModalHTML()).toBe(translateLocal('workspace.common.deleteTravelBillingError'));
    });
});
