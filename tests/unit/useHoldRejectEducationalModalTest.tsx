import {act, render, renderHook} from '@testing-library/react-native';

import HoldOrRejectEducationalModalWrapper from '@components/Modal/Global/HoldOrRejectEducationalModalWrapper';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';

import useHoldRejectEducationalModal from '@hooks/useHoldRejectEducationalModal';

import CONST from '@src/CONST';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockEducationalModalProps = {
    onClose: () => void;
    onConfirm: () => void;
    isDM?: boolean;
};

let mockHoldOrRejectModalProps: MockEducationalModalProps | undefined;
let mockHoldSubmitterModalProps: MockEducationalModalProps | undefined;

jest.mock('@components/HoldOrRejectEducationalModal', () => ({
    __esModule: true,
    default: (props: MockEducationalModalProps) => {
        mockHoldOrRejectModalProps = props;
        return null;
    },
}));

jest.mock('@components/HoldSubmitterEducationalModal', () => ({
    __esModule: true,
    default: (props: MockEducationalModalProps) => {
        mockHoldSubmitterModalProps = props;
        return null;
    },
}));

type HookParams = Parameters<typeof useHoldRejectEducationalModal>[0];

function renderEducationalModalHook(initialParams: HookParams) {
    return renderHook((params: HookParams) => useHoldRejectEducationalModal(params), {
        initialProps: initialParams,
        wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
    });
}

describe('useHoldRejectEducationalModal', () => {
    beforeEach(() => {
        mockHoldOrRejectModalProps = undefined;
        mockHoldSubmitterModalProps = undefined;
    });

    it('runs the dismiss handler with the action that opened the hold/reject modal once the user closes it', async () => {
        // Given a caller that opened the hold/reject modal from its hold option
        const onHoldOrRejectModalDismiss = jest.fn();
        const {result} = renderEducationalModalHook({onHoldOrRejectModalDismiss});
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
            await waitForBatchedUpdates();
        });
        expect(mockHoldOrRejectModalProps).toBeDefined();

        // When the user closes the modal
        await act(async () => {
            mockHoldOrRejectModalProps?.onClose();
            await waitForBatchedUpdates();
        });

        // Then the caller's follow-up runs for the hold action, the same way it did when the modal was mounted inline
        expect(onHoldOrRejectModalDismiss).toHaveBeenCalledTimes(1);
        expect(onHoldOrRejectModalDismiss).toHaveBeenCalledWith(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
    });

    it('passes isDM to the hold submitter modal and runs its dismiss handler once the user confirms', async () => {
        // Given a caller that opened the hold submitter modal for an expense from a DM
        const onHoldSubmitterModalDismiss = jest.fn();
        const {result} = renderEducationalModalHook({onHoldSubmitterModalDismiss});
        await act(async () => {
            result.current.showHoldSubmitterEducationalModal({isDM: true});
            await waitForBatchedUpdates();
        });

        // Then the modal gets the DM copy
        expect(mockHoldSubmitterModalProps?.isDM).toBe(true);

        // When the user confirms
        await act(async () => {
            mockHoldSubmitterModalProps?.onConfirm();
            await waitForBatchedUpdates();
        });

        // Then the caller's follow-up runs, because confirming and closing both lead to the same follow-up
        expect(onHoldSubmitterModalDismiss).toHaveBeenCalledTimes(1);
    });

    it('runs the dismiss handler only once when the modal is opened twice before the user answers', async () => {
        // Given a caller whose option was tapped twice in a row
        const onHoldOrRejectModalDismiss = jest.fn();
        const {result} = renderEducationalModalHook({onHoldOrRejectModalDismiss});
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
            result.current.showHoldOrRejectEducationalModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
            await waitForBatchedUpdates();
        });

        // When the user confirms the modal
        await act(async () => {
            mockHoldOrRejectModalProps?.onConfirm();
            await waitForBatchedUpdates();
        });

        // Then the follow-up runs once, so the reject flow doesn't open twice
        expect(onHoldOrRejectModalDismiss).toHaveBeenCalledTimes(1);
    });

    it('runs the latest dismiss handler rather than the one the caller had when the modal opened', async () => {
        // Given a modal opened while the caller held an older handler
        const staleHandler = jest.fn();
        const latestHandler = jest.fn();
        const {result, rerender} = renderEducationalModalHook({onHoldOrRejectModalDismiss: staleHandler});
        await act(async () => {
            result.current.showHoldOrRejectEducationalModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
            await waitForBatchedUpdates();
        });

        // When the caller re-renders with fresh data while the modal is open, and the user then closes it
        rerender({onHoldOrRejectModalDismiss: latestHandler});
        await act(async () => {
            mockHoldOrRejectModalProps?.onClose();
            await waitForBatchedUpdates();
        });

        // Then the follow-up acts on the caller's current data, as it did when the modal re-rendered inline
        expect(staleHandler).not.toHaveBeenCalled();
        expect(latestHandler).toHaveBeenCalledWith(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
    });

    it('closes the modal without running the dismiss handler when the caller unmounts', async () => {
        // Given a modal that is still open on the global stack
        const onHoldOrRejectModalDismiss = jest.fn();
        function Caller() {
            const {showHoldOrRejectEducationalModal} = useHoldRejectEducationalModal({onHoldOrRejectModalDismiss});
            React.useEffect(() => {
                showHoldOrRejectEducationalModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                // Open the modal once on mount to simulate a user action; re-running on a new show function identity would stack a second modal
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
        expect(mockHoldOrRejectModalProps).toBeDefined();

        // When the screen that opened it goes away before the user answers
        mockHoldOrRejectModalProps = undefined;
        rerender(<Screen isCallerMounted={false} />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then the modal leaves the stack with its screen, and the follow-up that belonged to that screen does not run
        expect(mockHoldOrRejectModalProps).toBeUndefined();
        expect(onHoldOrRejectModalDismiss).not.toHaveBeenCalled();
    });
});

describe('HoldOrRejectEducationalModalWrapper', () => {
    beforeEach(() => {
        mockHoldOrRejectModalProps = undefined;
    });

    it('takes its entry off the stack only once, even if the modal reports both a confirm and a close', () => {
        // Given the wrapper on the global stack
        const closeModal = jest.fn();
        render(
            <HoldOrRejectEducationalModalWrapper
                closeModal={closeModal}
                resolveModal={jest.fn()}
            />,
        );

        // When the modal reports a confirm followed by a close
        act(() => {
            mockHoldOrRejectModalProps?.onConfirm();
            mockHoldOrRejectModalProps?.onClose();
        });

        // Then the stack is popped once, with the confirm, so a modal underneath is not taken down by the second call
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });
});
