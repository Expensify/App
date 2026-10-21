import {fireEvent, render, screen, within} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ReceiptEmptyState from '@components/ReceiptEmptyState';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';
import {View as MockView} from 'react-native';

import {translateLocal} from '../../utils/TestHelper';

const mockOpenPicker = jest.fn();

jest.mock('@components/AttachmentPicker', () => {
    function MockAttachmentPicker({children}: {children: (props: {openPicker: (opts: {onPicked: (files: unknown[]) => void}) => void}) => React.ReactNode}) {
        return <>{children({openPicker: mockOpenPicker})}</>;
    }
    return MockAttachmentPicker;
});

jest.mock('@hooks/useFilesValidation', () => (onFilesValidated: (files: FileObject[]) => void) => ({
    validateFiles: onFilesValidated,
    PDFValidationComponent: null,
}));

// ReceiptAlternativeMethods uses RenderHTML which requires TRenderEngineProvider (buildTTree). Mock to avoid the error.
jest.mock('@components/ReceiptAlternativeMethods', () => () => <MockView testID="receipt-alternative-methods" />);

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('ReceiptEmptyState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('wide RHP attachment picker flow', () => {
        it('keeps alternative receipt methods outside the upload button', () => {
            // Given an editable wide receipt panel with alternative actions.
            render(
                <Wrapper>
                    <ReceiptEmptyState isDisplayedInWideRHP />
                </Wrapper>,
            );

            // When the upload button and alternative methods are inspected.
            const uploadButton = screen.getByRole('button', {name: translateLocal('receipt.upload')});

            // Then alternative links cannot become nested interactive button content.
            expect(screen.getByTestId('receipt-alternative-methods')).toBeOnTheScreen();
            expect(within(uploadButton).queryByTestId('receipt-alternative-methods')).toBeNull();
        });

        it('calls openPicker when pressed and isDisplayedInWideRHP is true', () => {
            // Given a wide receipt panel with its own picker action.
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP
                        setReceiptFile={jest.fn()}
                    />
                </Wrapper>,
            );

            const uploadButton = screen.getByRole('button', {name: translateLocal('receipt.upload')});
            // When its upload control is activated.
            fireEvent.press(uploadButton);

            // Then the picker, not a missing caller callback, handles the action.
            expect(mockOpenPicker).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest matcher for callback
            expect(mockOpenPicker).toHaveBeenCalledWith({onPicked: expect.any(Function)});
        });

        it('does not call openPicker when isDisplayedInWideRHP is false and calls onPress instead', () => {
            // Given an upload control with a caller-owned navigation action.
            const onPress = jest.fn();
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP={false}
                        onPress={onPress}
                    />
                </Wrapper>,
            );

            const uploadButton = screen.getByRole('button', {name: translateLocal('receipt.upload')});
            // When that control is activated.
            fireEvent.press(uploadButton);

            // Then its callback runs instead of the wide-panel picker.
            expect(mockOpenPicker).not.toHaveBeenCalled();
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('shows "Add a receipt" text when isDisplayedInWideRHP is true and not thumbnail', () => {
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP
                        isThumbnail={false}
                        setReceiptFile={jest.fn()}
                    />
                </Wrapper>,
            );

            expect(screen.getByText(translateLocal('receipt.addAReceipt.phrase1'))).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('receipt.addAReceipt.phrase2'))).toBeOnTheScreen();
        });

        it('does not show "Add a receipt" text when isDisplayedInWideRHP is false', () => {
            // Given a receipt placeholder without an upload action.
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP={false}
                        isThumbnail={false}
                    />
                </Wrapper>,
            );

            // When its accessible output is inspected.
            // Then it remains a static placeholder, not a misleading upload button.
            expect(screen.queryByText(translateLocal('receipt.addAReceipt.phrase1'))).not.toBeOnTheScreen();
            expect(screen.queryByText(translateLocal('receipt.addAReceipt.phrase2'))).not.toBeOnTheScreen();
            expect(screen.getByLabelText(translateLocal('receipt.upload'))).not.toHaveProp('accessibilityRole', 'button');
        });
    });
});
