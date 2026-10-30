import {act, render} from '@testing-library/react-native';

import DecisionModal from '@components/DecisionModal';
import DecisionModalWrapper from '@components/Modal/Global/DecisionModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import React from 'react';

jest.mock('@components/DecisionModal', () => jest.fn(() => null));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false})));

describe('DecisionModalWrapper', () => {
    const mockedModal = jest.mocked(DecisionModal);
    const getLatestModalProps = () => mockedModal.mock.calls.at(-1)?.[0];

    function renderWrapper(shouldReportDismiss?: boolean) {
        const closeModal = jest.fn();
        render(
            <DecisionModalWrapper
                closeModal={closeModal}
                resolveModal={jest.fn()}
                title="Title"
                firstOptionText="First"
                secondOptionText="Second"
                shouldReportDismiss={shouldReportDismiss}
            />,
        );
        return closeModal;
    }

    function hideAfter(action: () => void) {
        act(action);
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('resolves a dismiss the same way as the second option by default', () => {
        // Given a decision modal from an existing caller that did not opt in to dismiss reporting
        const closeModal = renderWrapper();

        // When the user dismisses it with the backdrop, Escape, or Back
        hideAfter(() => getLatestModalProps()?.onClose());

        // Then it resolves as the second option, so existing callers keep their current behavior
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
    });

    it('resolves a dismiss with its own action when the caller opts in', () => {
        // Given a decision modal whose caller needs to tell a dismiss apart from the second option
        const closeModal = renderWrapper(true);

        // When the user dismisses it with the backdrop, Escape, or Back
        hideAfter(() => getLatestModalProps()?.onClose());

        // Then it resolves as a dismiss
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.DISMISS});
    });

    it('still resolves the buttons as confirm and close when the caller opts in', () => {
        // Given a decision modal whose caller opted in to dismiss reporting
        const closeModal = renderWrapper(true);

        // When the user presses the second option
        hideAfter(() => getLatestModalProps()?.onSecondOptionSubmit());

        // Then the second option still resolves as close
        expect(closeModal).toHaveBeenLastCalledWith({action: ModalActions.CLOSE});

        // Given a fresh modal, when the user presses the first option
        const closeModalAfterFirstOption = renderWrapper(true);
        hideAfter(() => getLatestModalProps()?.onFirstOptionSubmit?.());

        // Then the first option still resolves as confirm
        expect(closeModalAfterFirstOption).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });
});
