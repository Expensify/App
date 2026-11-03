import {act, render} from '@testing-library/react-native';

import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useImperativeHandle} from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type GuardHandle = {
    shouldBlockDeletion: () => boolean;
    wouldBlockDeletion: boolean;
};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    navigate: jest.fn(),
}));

/**
 * Test wrapper component that uses the hook and exposes the guard values via ref for test assertions.
 * The hook no longer returns an element, so there is nothing for it to render.
 */
const TestGuardComponent = React.forwardRef<GuardHandle, {ownedPaidPoliciesCount: number; onModalDismissed?: () => void}>(({ownedPaidPoliciesCount, onModalDismissed}, ref) => {
    const {shouldBlockDeletion, wouldBlockDeletion} = useOutstandingBalanceGuard(ownedPaidPoliciesCount, onModalDismissed);

    useImperativeHandle(ref, () => ({
        shouldBlockDeletion,
        wouldBlockDeletion,
    }));

    return null;
});

describe('useOutstandingBalanceGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('wouldBlockDeletion', () => {
        it('should be false when there is no amount owed', () => {
            // Given an account that owes nothing, which is the normal case
            const ref = React.createRef<GuardHandle>();

            // When the guard is asked about an account that owns one paid workspace
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // Then deletion is not flagged as blocked, so the caller shows its normal delete copy
            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be false when amount owed is 0', async () => {
            // Given an account whose balance NVP is present but settled, which reads differently from absent
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();

            // When the guard is asked about that account
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // Then deletion is not blocked, because a settled balance is nothing to collect
            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be true when amount owed > 0 and exactly 1 paid policy', async () => {
            // Given an account that owes money
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();

            // When the workspace being deleted is the last paid one the account owns
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // Then deletion is blocked, because losing the last paid workspace would leave the debt uncollectable
            expect(ref.current?.wouldBlockDeletion).toBe(true);
        });

        it('should be false when amount owed > 0 but more than 1 paid policy', async () => {
            // Given an account that owes money
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();

            // When another paid workspace would still be left behind after the deletion
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={2}
                />,
            );

            // Then deletion is allowed, because the account still has a subscription the balance can be settled on
            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be false when amount owed > 0 but 0 paid policies', async () => {
            // Given an account that owes money
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();

            // When the workspace being deleted is not a paid one at all
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={0}
                />,
            );

            // Then deletion is allowed, because this deletion is not what puts the balance out of reach
            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });
    });

    describe('shouldBlockDeletion', () => {
        it('should return true and show the modal when deletion would be blocked', async () => {
            // Given an account that owes money and is deleting its last paid workspace
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // When the delete flow asks the guard whether to go ahead
            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            // Then it is told to stop, and the user is shown why rather than the deletion just failing silently
            expect(blocked).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('should return false and not show the modal when no amount owed', () => {
            // Given an account that owes nothing
            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // When the delete flow asks the guard whether to go ahead
            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            // Then deletion proceeds with no interruption, because there is nothing to settle first
            expect(blocked).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should return false when multiple paid policies exist even with amount owed', async () => {
            // Given an account that owes money but owns several paid workspaces
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={3}
                />,
            );

            // When the delete flow asks the guard whether to go ahead
            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            // Then deletion proceeds uninterrupted, because the balance is still collectable afterwards
            expect(blocked).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('modal interactions', () => {
        it('should navigate to subscription settings and notify the caller on confirm', async () => {
            // Given a blocked deletion that has raised the outstanding-balance prompt
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const onModalDismissed = jest.fn();
            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                    onModalDismissed={onModalDismissed}
                />,
            );

            act(() => {
                ref.current?.shouldBlockDeletion();
            });

            // When the user takes the prompt up on settling the balance
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            // Then they land where they can pay, and the delete flow is told to close itself so it is not left open
            // behind the subscription page
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.route);
            expect(onModalDismissed).toHaveBeenCalledTimes(1);
        });

        it('should notify the caller without navigating on cancel', async () => {
            // Given a blocked deletion that has raised the outstanding-balance prompt
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const onModalDismissed = jest.fn();
            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                    onModalDismissed={onModalDismissed}
                />,
            );

            act(() => {
                ref.current?.shouldBlockDeletion();
            });

            // When the user backs out instead
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            // Then they stay where they are, but the delete flow still closes, because both answers end the flow
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(onModalDismissed).toHaveBeenCalledTimes(1);
        });

        it('should pass correct translation keys to the modal', async () => {
            // Given an account whose last paid workspace cannot be deleted until the balance is settled
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            // When the guard blocks the deletion
            act(() => {
                ref.current?.shouldBlockDeletion();
            });

            // Then the prompt explains the balance and offers the subscription page, rather than a bare failure
            expect(getShowConfirmModalOption('title')).toBe('workspace.common.delete');
            expect(getShowConfirmModalOption('prompt')).toBe('workspace.common.outstandingBalanceWarning');
            expect(getShowConfirmModalOption('confirmText')).toBe('workspace.common.settleBalance');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.cancel');
        });
    });
});
