import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ExactOnlineWaitlistButton from '@pages/workspace/accounting/ExactOnlineWaitlistButton';

import {joinExactOnlineWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createRandomPolicy from '../utils/collections/policies';
import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockShowReadOnlyModal = jest.fn();
let mockCanWriteAccounting = true;
const policy = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'First workspace');
const otherPolicy = createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE, 'Second workspace');

jest.mock('@userActions/User', () => ({joinExactOnlineWaitlist: jest.fn()}));
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

describe('Exact Online waitlist signup', () => {
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

    it('queues signup offline, confirms success once, and shares signup status across workspaces', async () => {
        // Given an account that has not joined the waitlist and is currently offline
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        const {rerender} = render(<ExactOnlineWaitlistButton policy={policy} />, {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        // When the user presses Join waitlist twice before the optimistic value renders
        const button = screen.getByRole('button', {name: 'Join waitlist'});
        fireEvent.press(button);
        fireEvent.press(button);

        // Then signup is queued once without claiming success while offline
        expect(joinExactOnlineWaitlist).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        await act(() => Onyx.merge(ONYXKEYS.ACCOUNT, {pendingFields: {exactOnlineWaitlist: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}));
        rerender(<ExactOnlineWaitlistButton policy={otherPolicy} />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole('button', {name: 'Join waitlist', disabled: true})).toBeOnTheScreen();

        // When the request fails and its optimistic account value is rolled back
        await act(() =>
            Onyx.update([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, value: ''},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {pendingFields: {exactOnlineWaitlist: null}, errorFields: {exactOnlineWaitlist: {[Date.now()]: 'Signup failed'}}},
                },
            ]),
        );
        await waitForBatchedUpdatesWithAct();

        // Then signup is offered again
        expect(screen.getByRole('button', {name: 'Join waitlist', disabled: false})).toBeOnTheScreen();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        // When the retried signup succeeds and the user switches workspaces
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));
        await act(() => Onyx.merge(ONYXKEYS.ACCOUNT, {pendingFields: {exactOnlineWaitlist: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}, errorFields: {exactOnlineWaitlist: null}}));
        await act(() => Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, '2026-10-14 12:00:00'));
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        await act(() => Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false}));
        await act(() => Onyx.merge(ONYXKEYS.ACCOUNT, {pendingFields: {exactOnlineWaitlist: null}}));
        rerender(<ExactOnlineWaitlistButton policy={policy} />);
        await waitForBatchedUpdatesWithAct();

        // Then the same account signup is shown without another action in the new workspace
        expect(screen.getByText('You’re on the waitlist')).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Join waitlist'})).toBeNull();
        expect(joinExactOnlineWaitlist).toHaveBeenCalledTimes(2);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe('You’re on the waitlist');
        expect(getShowConfirmModalOption('prompt')).toBe('Concierge will send you a message to let you know when this integration is ready and how to connect.');
        expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);
    });

    it('loads an existing account signup without offering another signup', async () => {
        // Given an account that joined the waitlist in an earlier session
        await Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, '2026-10-13 12:00:00');
        await Onyx.merge(ONYXKEYS.ACCOUNT, {pendingFields: {exactOnlineWaitlist: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}});

        // When the user opens accounting in another workspace
        render(<ExactOnlineWaitlistButton policy={otherPolicy} />, {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole('button', {name: 'Join waitlist', disabled: true})).toBeOnTheScreen();
        await act(() => Onyx.merge(ONYXKEYS.ACCOUNT, {pendingFields: {exactOnlineWaitlist: null}}));
        await waitForBatchedUpdatesWithAct();

        // Then their stored signup replaces the action without opening an acknowledgement
        expect(screen.getByText('You’re on the waitlist')).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Join waitlist'})).toBeNull();
        expect(joinExactOnlineWaitlist).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('shows the read-only explanation without signing up when accounting write access is denied', async () => {
        // Given a workspace where the user has read-only accounting access
        mockCanWriteAccounting = false;
        render(<ExactOnlineWaitlistButton policy={policy} />, {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        // When the user presses Join waitlist
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));

        // Then the standard read-only explanation appears and the account stays off the waitlist
        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(joinExactOnlineWaitlist).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});
