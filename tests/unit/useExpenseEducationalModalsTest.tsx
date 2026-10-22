import {act, render, renderHook} from '@testing-library/react-native';

import {ModalProvider} from '@components/Modal/Global/ModalContext';

import useHoldRejectEducationalModal from '@hooks/useHoldRejectEducationalModal';
import useHoldSubmitterEducationalModal from '@hooks/useHoldSubmitterEducationalModal';

import variables from '@styles/variables';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockFeatureTrainingModalProps = {
    onClose?: () => void;
    onConfirm?: (willShowAgain: boolean) => void;
    shouldCloseOnConfirm?: boolean;
    shouldUseScrollView?: boolean;
    width?: number;
    children?: React.ReactNode;
};

let mockFeatureTrainingModalProps: MockFeatureTrainingModalProps | undefined;
let mockRenderedContent: string | undefined;
let mockHoldSubmitterIsDM: boolean | undefined;

jest.mock('@components/FeatureTrainingModal', () => ({
    __esModule: true,
    default: (props: MockFeatureTrainingModalProps) => {
        mockFeatureTrainingModalProps = props;
        return props.children ?? null;
    },
}));

jest.mock('@components/HoldOrRejectEducationalModalContent', () => ({
    __esModule: true,
    default: () => {
        mockRenderedContent = 'HoldOrRejectEducationalModalContent';
        return null;
    },
}));

jest.mock('@components/HoldSubmitterEducationalModalContent', () => ({
    __esModule: true,
    default: ({isDM}: {isDM?: boolean}) => {
        mockRenderedContent = 'HoldSubmitterEducationalModalContent';
        mockHoldSubmitterIsDM = isDM;
        return null;
    },
}));

function renderEducationalModalHooks() {
    return renderHook(
        () => ({
            ...useHoldRejectEducationalModal(),
            ...useHoldSubmitterEducationalModal(),
        }),
        {
            wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
        },
    );
}

describe('expense educational modal hooks', () => {
    beforeEach(() => {
        mockFeatureTrainingModalProps = undefined;
        mockRenderedContent = undefined;
        mockHoldSubmitterIsDM = undefined;
    });

    it.each(['close', 'confirm'] as const)('lets the caller chain its follow-up when the user chooses to %s the hold/reject modal', async (action) => {
        // Given a caller that chains its own follow-up onto the modal promise
        const onDismiss = jest.fn();
        const {result} = renderEducationalModalHooks();
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal().finally(onDismiss);
            await waitForBatchedUpdates();
        });

        // Then the modal keeps the existing content and layout, and the follow-up waits for dismissal
        expect(mockRenderedContent).toBe('HoldOrRejectEducationalModalContent');
        expect(mockFeatureTrainingModalProps?.width).toBe(variables.holdEducationModalWidth);
        expect(mockFeatureTrainingModalProps?.shouldUseScrollView).toBe(true);
        expect(mockFeatureTrainingModalProps?.shouldCloseOnConfirm).toBe(false);
        expect(onDismiss).not.toHaveBeenCalled();

        // When the user closes or confirms the modal
        await act(async () => {
            if (action === 'close') {
                mockFeatureTrainingModalProps?.onClose?.();
            } else {
                mockFeatureTrainingModalProps?.onConfirm?.(false);
            }
            await waitForBatchedUpdates();
        });

        // Then the caller-owned follow-up runs exactly once for either dismissal path
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it.each([true, false, undefined])('passes isDM=%s to the submitter content and returns its dismissal promise', async (isDM) => {
        // Given a submitter modal opened with the caller's DM context
        const onDismiss = jest.fn();
        const {result} = renderEducationalModalHooks();
        await act(async () => {
            result.current.showHoldSubmitterEducationalModal(isDM === undefined ? undefined : {isDM}).finally(onDismiss);
            await waitForBatchedUpdates();
        });
        expect(mockRenderedContent).toBe('HoldSubmitterEducationalModalContent');
        expect(mockHoldSubmitterIsDM).toBe(isDM);
        expect(onDismiss).not.toHaveBeenCalled();

        // When the user confirms the modal
        await act(async () => {
            mockFeatureTrainingModalProps?.onConfirm?.(false);
            await waitForBatchedUpdates();
        });

        // Then the promise settles and the caller's follow-up runs
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('keeps composed modal promises independent', async () => {
        // Given a hold/reject modal with its caller-owned follow-up
        const onRejectDismiss = jest.fn();
        const onSubmitterDismiss = jest.fn();
        const {result} = renderEducationalModalHooks();
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal().finally(onRejectDismiss);
            await waitForBatchedUpdates();
        });

        // When a submitter modal opens above it and the user confirms it
        await act(async () => {
            result.current.showHoldSubmitterEducationalModal().finally(onSubmitterDismiss);
            await waitForBatchedUpdates();
        });
        expect(mockRenderedContent).toBe('HoldSubmitterEducationalModalContent');
        await act(async () => {
            mockFeatureTrainingModalProps?.onConfirm?.(false);
            await waitForBatchedUpdates();
        });

        // Then only that promise settles and the hold/reject modal remains on the stack
        expect(onSubmitterDismiss).toHaveBeenCalledTimes(1);
        expect(onRejectDismiss).not.toHaveBeenCalled();
        expect(mockRenderedContent).toBe('HoldOrRejectEducationalModalContent');

        // When the remaining modal closes
        await act(async () => {
            mockFeatureTrainingModalProps?.onClose?.();
            await waitForBatchedUpdates();
        });

        // Then its promise settles independently
        expect(onRejectDismiss).toHaveBeenCalledTimes(1);
        expect(onSubmitterDismiss).toHaveBeenCalledTimes(1);
    });

    it('returns a separate promise for each opening', async () => {
        // Given two invocations from the same caller
        const firstDismiss = jest.fn();
        const secondDismiss = jest.fn();
        const {result} = renderEducationalModalHooks();
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal().finally(firstDismiss);
            result.current.showHoldOrRejectEducationalModal().finally(secondDismiss);
            await waitForBatchedUpdates();
        });

        // When the top modal closes
        await act(async () => {
            mockFeatureTrainingModalProps?.onClose?.();
            await waitForBatchedUpdates();
        });

        // Then only the second invocation settles, following the global stack's normal behavior
        expect(secondDismiss).toHaveBeenCalledTimes(1);
        expect(firstDismiss).not.toHaveBeenCalled();

        // When the first modal closes
        await act(async () => {
            mockFeatureTrainingModalProps?.onClose?.();
            await waitForBatchedUpdates();
        });

        // Then its follow-up runs once too
        expect(firstDismiss).toHaveBeenCalledTimes(1);
        expect(secondDismiss).toHaveBeenCalledTimes(1);
    });

    it('leaves the opening event in control of its follow-up across re-renders', async () => {
        // Given a caller that captures its follow-up when the opening event occurs
        const originalFollowUp = jest.fn();
        const replacementFollowUp = jest.fn();
        const {result, rerender} = renderHook(
            ({onDismiss}: {onDismiss: () => void}) => {
                const {showHoldOrRejectEducationalModal} = useHoldRejectEducationalModal();
                return () => showHoldOrRejectEducationalModal().finally(onDismiss);
            },
            {
                initialProps: {onDismiss: originalFollowUp},
                wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
            },
        );
        await act(async () => {
            result.current();
            await waitForBatchedUpdates();
        });

        // When the caller re-renders before the user dismisses the modal
        rerender({onDismiss: replacementFollowUp});
        await act(async () => {
            mockFeatureTrainingModalProps?.onClose?.();
            await waitForBatchedUpdates();
        });

        // Then ordinary promise closure semantics apply, with no hidden callback replacement by the hook
        expect(originalFollowUp).toHaveBeenCalledTimes(1);
        expect(replacementFollowUp).not.toHaveBeenCalled();
    });

    it('leaves the global modal and its promise independent of the opening component lifecycle', async () => {
        // Given a caller that opens a modal on the global stack
        const onDismiss = jest.fn();
        function Caller() {
            const {showHoldOrRejectEducationalModal} = useHoldRejectEducationalModal();
            React.useEffect(() => {
                showHoldOrRejectEducationalModal().finally(onDismiss);
                // Simulate a single opening event rather than another modal on every stack update.
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);
            return null;
        }
        function Screen({isCallerMounted}: {isCallerMounted: boolean}) {
            return <ModalProvider>{isCallerMounted && <Caller />}</ModalProvider>;
        }
        const {rerender} = render(<Screen isCallerMounted />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // When the opening component unmounts while the global modal provider remains mounted
        rerender(<Screen isCallerMounted={false} />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then it does not dismiss the modal or settle its promise automatically
        expect(onDismiss).not.toHaveBeenCalled();

        // When the user confirms the still-open modal
        await act(async () => {
            mockFeatureTrainingModalProps?.onConfirm?.(false);
            await waitForBatchedUpdates();
        });

        // Then the caller-owned promise settles normally
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
