import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import AccountingIntegrationWaitlistCard from '@pages/workspace/connections/AccountingIntegrationWaitlistCard';
import ConnectionsGrid from '@pages/workspace/connections/ConnectionsGrid';

import {clearAccountingIntegrationWaitlistError, joinAccountingIntegrationWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockShowReadOnlyModal = jest.fn();
let mockCanWriteAccounting = true;
const SAGE_ACCOUNTING = CONST.POLICY.CONNECTIONS.NAME.SAGE_ACCOUNTING;

jest.mock('@userActions/User', () => ({joinAccountingIntegrationWaitlist: jest.fn(), clearAccountingIntegrationWaitlistError: jest.fn()}));
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({canWrite: mockCanWriteAccounting, showReadOnlyModal: mockShowReadOnlyModal}),
}));

function TestWrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

function renderCard(policyID = 'policy') {
    return render(
        <AccountingIntegrationWaitlistCard
            connectionName={SAGE_ACCOUNTING}
            title="Sage Accounting"
            policyID={policyID}
            shouldUseFullWidth
        />,
        {wrapper: TestWrapper},
    );
}

describe('AccountingIntegrationWaitlistCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockCanWriteAccounting = true;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('joins the waitlist for the workspace and confirms it once the server saves the signup', async () => {
        // Given a workspace that hasn't joined the Sage Accounting waitlist
        renderCard();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Coming soon')).toBeTruthy();

        // When the admin presses Join waitlist
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));

        // Then the workspace joins the waitlist, but the confirmation waits since the server may still reject the signup
        expect(joinAccountingIntegrationWaitlist).toHaveBeenCalledWith('policy', SAGE_ACCOUNTING);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        // When the server saves the signup
        await act(() => Onyx.set(ONYXKEYS.NVP_ACCOUNTING_INTEGRATION_WAITLIST, [{connectionName: SAGE_ACCOUNTING, policyID: 'policy', created: '2026-11-04 11:00:00'}]));
        await waitForBatchedUpdatesWithAct();

        // Then the confirmation explains that Concierge will follow up
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe('You’re on the list!');
        expect(getShowConfirmModalOption('prompt')).toBe('Concierge will send you a message to let you know when this integration is ready and how to connect.');
        expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);
    });

    it('does not confirm a signup the server rejected', async () => {
        // Given the admin pressed Join waitlist
        renderCard();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));

        // When the server rejects the signup
        const errorTimestamp = 1;
        await act(() => Onyx.set(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {policy: {[SAGE_ACCOUNTING]: {errors: {[errorTimestamp]: 'Signup failed'}}}}));
        await waitForBatchedUpdatesWithAct();

        // Then the error shows instead of the confirmation
        expect(screen.getByText('Signup failed')).toBeTruthy();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('offers Join waitlist again when the request succeeds without the server saving this workspace', async () => {
        // Given the admin pressed Join waitlist and the request is pending
        renderCard();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));
        await act(() => Onyx.set(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {policy: {[SAGE_ACCOUNTING]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}}));
        await waitForBatchedUpdatesWithAct();

        // When the request succeeds but the waitlist doesn't come back with this workspace
        await act(() => Onyx.set(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {policy: {[SAGE_ACCOUNTING]: null}}));
        await waitForBatchedUpdatesWithAct();

        // Then there is no confirmation, and pressing Join waitlist tries again instead of doing nothing
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));
        expect(joinAccountingIntegrationWaitlist).toHaveBeenCalledTimes(2);
    });

    it('disables Join waitlist while offline instead of loading a request that cannot finish', async () => {
        // Given the user is offline with a signup still queued for this workspace
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await Onyx.set(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {policy: {[SAGE_ACCOUNTING]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}});
        renderCard();
        await waitForBatchedUpdatesWithAct();

        // When the user presses Join waitlist
        const button = screen.getByRole('button', {name: 'Join waitlist'});
        fireEvent.press(button);

        // Then the button is disabled rather than loading, and no other signup starts
        expect(button).toBeDisabled();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(joinAccountingIntegrationWaitlist).not.toHaveBeenCalled();

        // When the connection returns
        await act(() => Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false}));
        await waitForBatchedUpdatesWithAct();

        // Then the queued request shows as loading while it's in flight
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('shows the waitlist status only on the workspace that joined', async () => {
        // Given the user joined the Sage Accounting waitlist for another workspace
        await Onyx.set(ONYXKEYS.NVP_ACCOUNTING_INTEGRATION_WAITLIST, [{connectionName: SAGE_ACCOUNTING, policyID: 'otherPolicy', created: '2026-11-04 10:00:00'}]);

        // When they open this workspace's card
        renderCard();
        await waitForBatchedUpdatesWithAct();

        // Then this workspace can still join
        expect(screen.getByRole('button', {name: 'Join waitlist'})).toBeOnTheScreen();

        // When the signup for this workspace is saved
        await act(() =>
            Onyx.set(ONYXKEYS.NVP_ACCOUNTING_INTEGRATION_WAITLIST, [
                {connectionName: SAGE_ACCOUNTING, policyID: 'otherPolicy', created: '2026-11-04 10:00:00'},
                {connectionName: SAGE_ACCOUNTING, policyID: 'policy', created: '2026-11-04 11:00:00'},
            ]),
        );
        await waitForBatchedUpdatesWithAct();

        // Then the card shows the waitlist status in place of the button
        expect(screen.getByText('You’re on the waitlist')).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Join waitlist'})).toBeNull();
    });

    it('offers Join waitlist again after a failed signup and clears the error when dismissed', async () => {
        // Given a signup for this workspace that the server rejected
        const errorTimestamp = 1;
        await Onyx.set(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {policy: {[SAGE_ACCOUNTING]: {errors: {[errorTimestamp]: 'Signup failed'}}}});
        renderCard();
        await waitForBatchedUpdatesWithAct();

        // Then the error shows and the user can try again
        expect(screen.getByText('Signup failed')).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Join waitlist'})).toBeOnTheScreen();

        // When the user dismisses the error
        fireEvent.press(screen.getByLabelText('Dismiss'));

        // Then the failed signup is cleared for this workspace
        expect(clearAccountingIntegrationWaitlistError).toHaveBeenCalledWith('policy', SAGE_ACCOUNTING);
    });

    it('shows the read-only explanation without joining when accounting write access is denied', async () => {
        // Given a user who can't edit this workspace's accounting
        mockCanWriteAccounting = false;
        renderCard();
        await waitForBatchedUpdatesWithAct();

        // When they press Join waitlist
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));

        // Then the standard read-only explanation appears and the workspace stays off the waitlist
        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(joinAccountingIntegrationWaitlist).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('shows the waitlist card in the Connections grid only when there is a workspace to join for', async () => {
        // Given a Sage Accounting listing that offers its waitlist instead of connecting
        const listing = {key: SAGE_ACCOUNTING, category: CONST.TAB.CONNECTIONS.ACCOUNTING, title: 'Sage Accounting'};

        // When the grid renders it for a workspace
        const {rerender} = render(
            <ConnectionsGrid
                listings={[listing]}
                policyID="policy"
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // Then the waitlist card shows and joins for that workspace
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));
        expect(joinAccountingIntegrationWaitlist).toHaveBeenCalledWith('policy', SAGE_ACCOUNTING);

        // When the grid has no workspace, since a waitlist signup belongs to one
        rerender(<ConnectionsGrid listings={[listing]} />);
        await waitForBatchedUpdatesWithAct();

        // Then the card is left out
        expect(screen.queryByText('Sage Accounting')).toBeNull();
    });
});
