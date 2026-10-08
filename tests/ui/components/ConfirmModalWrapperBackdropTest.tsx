import {act, render} from '@testing-library/react-native';

import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';

import React from 'react';

let mockConfirmModalProps: ConfirmModalProps | undefined;

jest.mock('@components/ConfirmModal', () => ({
    __esModule: true,
    default: (props: ConfirmModalProps) => {
        mockConfirmModalProps = props;
        return null;
    },
}));

jest.mock('@hooks/useActiveElementRole', () => ({__esModule: true, default: () => null}));
jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));

function renderConfirmModalWrapper(onBackdropPress?: () => void) {
    const closeModal = jest.fn();

    render(
        <ConfirmModalWrapper
            closeModal={closeModal}
            resolveModal={jest.fn()}
            title="Allow location access"
            prompt="Location access helps us keep your timezone and currency accurate"
            onBackdropPress={onBackdropPress}
        />,
    );

    return {closeModal};
}

describe('ConfirmModalWrapper backdrop press', () => {
    beforeEach(() => {
        mockConfirmModalProps = undefined;
    });

    it('runs the caller backdrop handler and hides the modal without removing it from the stack mid-tap', () => {
        // Given a caller that passes a backdrop handler because it treats a tap outside differently from the cancel button
        const onBackdropPress = jest.fn();
        const {closeModal} = renderConfirmModalWrapper(onBackdropPress);

        // When the user taps outside the modal
        act(() => {
            mockConfirmModalProps?.onBackdropPress?.();
        });

        // Then the caller is told about the tap, and the modal starts its hide animation like the cancel button instead of leaving the stack straight away
        expect(onBackdropPress).toHaveBeenCalledTimes(1);
        expect(mockConfirmModalProps?.isVisible).toBe(false);
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('removes the modal from the stack as a plain close once the backdrop hide animation finishes', () => {
        // Given a modal that the user dismissed by tapping outside it
        const {closeModal} = renderConfirmModalWrapper(jest.fn());
        act(() => {
            mockConfirmModalProps?.onBackdropPress?.();
        });

        // When the hide animation finishes
        act(() => {
            mockConfirmModalProps?.onModalHide?.();
        });

        // Then the modal leaves the stack with a close action, so the caller's promise resolves the same way as after the cancel button
        expect(closeModal).toHaveBeenCalledWith({action: 'CLOSE'});
    });

    it('keeps the default backdrop behavior when the caller passes no backdrop handler', () => {
        // Given a caller that is fine with a tap outside acting like the cancel button
        // When the modal renders
        renderConfirmModalWrapper();

        // Then no backdrop handler is passed down, so the modal still falls back to its cancel handler
        expect(mockConfirmModalProps?.onBackdropPress).toBeUndefined();
    });
});
