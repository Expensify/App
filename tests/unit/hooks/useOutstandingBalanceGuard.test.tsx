import {act, render} from '@testing-library/react-native';

import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useImperativeHandle} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type GuardHandle = {
    shouldBlockDeletion: () => boolean;
    wouldBlockDeletion: boolean;
};

type MockConfirmModalProps = {
    isVisible?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    title?: string;
    prompt?: string;
    confirmText?: string;
    cancelText?: string;
};

let mockLastModalProps: MockConfirmModalProps | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@components/ConfirmModal', () => {
    return (props: MockConfirmModalProps) => {
        mockLastModalProps = props;
        return null;
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    navigate: jest.fn(),
}));

/**
 * Test wrapper component that uses the hook and renders the modal element.
 * Exposes guard methods via ref for test assertions.
 */
const TestGuardComponent = React.forwardRef<GuardHandle, {ownedPaidPoliciesCount: number}>(({ownedPaidPoliciesCount}, ref) => {
    const {shouldBlockDeletion, wouldBlockDeletion, outstandingBalanceModal} = useOutstandingBalanceGuard(ownedPaidPoliciesCount);

    useImperativeHandle(ref, () => ({
        shouldBlockDeletion,
        wouldBlockDeletion,
    }));

    return <View>{outstandingBalanceModal}</View>;
});

describe('useOutstandingBalanceGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockLastModalProps = undefined;
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
        it('should return true and open modal when deletion would be blocked', async () => {
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
            expect(mockLastModalProps?.isVisible).toBe(true);
        });

        it('should return false and not open modal when no amount owed', () => {
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
            expect(mockLastModalProps?.isVisible).toBeFalsy();
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
        });
    });

    describe('modal interactions', () => {
        it('should navigate to subscription settings on confirm', async () => {
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

            expect(mockLastModalProps?.isVisible).toBe(true);

            act(() => {
                mockLastModalProps?.onConfirm?.();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.route);
            expect(mockLastModalProps?.isVisible).toBe(false);
        });

        it('should close modal on cancel without navigating', async () => {
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

            expect(mockLastModalProps?.isVisible).toBe(true);

            act(() => {
                mockLastModalProps?.onCancel?.();
            });

            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(mockLastModalProps?.isVisible).toBe(false);
        });

        it('should pass correct translation keys to the modal', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await waitForBatchedUpdates();

            render(
                <TestGuardComponent
                    ref={React.createRef()}
                    ownedPaidPoliciesCount={1}
                />,
            );

            expect(mockLastModalProps?.title).toBe('workspace.common.delete');
            expect(mockLastModalProps?.prompt).toBe('workspace.common.outstandingBalanceWarning');
            expect(mockLastModalProps?.confirmText).toBe('workspace.common.settleBalance');
            expect(mockLastModalProps?.cancelText).toBe('common.cancel');
        });
    });
});
