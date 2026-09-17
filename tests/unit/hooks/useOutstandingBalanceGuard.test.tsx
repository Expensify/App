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
            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be false when amount owed is 0', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be true when amount owed > 0 and exactly 1 paid policy', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            expect(ref.current?.wouldBlockDeletion).toBe(true);
        });

        it('should be false when amount owed > 0 but more than 1 paid policy', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={2}
                />,
            );

            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });

        it('should be false when amount owed > 0 but 0 paid policies', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={0}
                />,
            );

            expect(ref.current?.wouldBlockDeletion).toBe(false);
        });
    });

    describe('shouldBlockDeletion', () => {
        it('should return true and show the modal when deletion would be blocked', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            expect(blocked).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('should return false and not show the modal when no amount owed', () => {
            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            expect(blocked).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should return false when multiple paid policies exist even with amount owed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={3}
                />,
            );

            let blocked: boolean | undefined;
            act(() => {
                blocked = ref.current?.shouldBlockDeletion();
            });

            expect(blocked).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('modal interactions', () => {
        it('should navigate to subscription settings and notify the caller on confirm', async () => {
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

            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.route);
            expect(onModalDismissed).toHaveBeenCalledTimes(1);
        });

        it('should notify the caller without navigating on cancel', async () => {
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

            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(onModalDismissed).toHaveBeenCalledTimes(1);
        });

        it('should pass correct translation keys to the modal', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            const ref = React.createRef<GuardHandle>();
            render(
                <TestGuardComponent
                    ref={ref}
                    ownedPaidPoliciesCount={1}
                />,
            );

            act(() => {
                ref.current?.shouldBlockDeletion();
            });

            expect(getShowConfirmModalOption('title')).toBe('workspace.common.delete');
            expect(getShowConfirmModalOption('prompt')).toBe('workspace.common.outstandingBalanceWarning');
            expect(getShowConfirmModalOption('confirmText')).toBe('workspace.common.settleBalance');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.cancel');
        });
    });
});
