import {act, render} from '@testing-library/react-native';
import React, {useImperativeHandle} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

let lastModalProps: MockConfirmModalProps | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@components/ConfirmModal', () => {
    return (props: MockConfirmModalProps) => {
        lastModalProps = props;
        return null;
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
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
        lastModalProps = undefined;
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
            expect(lastModalProps?.isVisible).toBe(true);
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
            expect(lastModalProps?.isVisible).toBeFalsy();
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

            expect(lastModalProps?.isVisible).toBe(true);

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.route);
            expect(lastModalProps?.isVisible).toBe(false);
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

            expect(lastModalProps?.isVisible).toBe(true);

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(lastModalProps?.isVisible).toBe(false);
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

            expect(lastModalProps?.title).toBe('workspace.common.delete');
            expect(lastModalProps?.prompt).toBe('workspace.common.outstandingBalanceWarning');
            expect(lastModalProps?.confirmText).toBe('workspace.common.settleBalance');
            expect(lastModalProps?.cancelText).toBe('common.cancel');
        });
    });
});
