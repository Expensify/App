import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import type {FileObject} from '@src/types/utils/Attachment';
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
    ErrorModal: null,
}));

// ReceiptAlternativeMethods uses RenderHTML which requires TRenderEngineProvider (buildTTree). Mock to avoid the error.
jest.mock(
    '@components/ReceiptAlternativeMethods',
    () =>
        function MockReceiptAlternativeMethods() {
            return null;
        },
);

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('ReceiptEmptyState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('wide RHP attachment picker flow', () => {
        it('calls openPicker when pressed and isDisplayedInWideRHP is true', () => {
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP
                        setReceiptFile={jest.fn()}
                    />
                </Wrapper>,
            );

            const uploadButton = screen.getByLabelText(translateLocal('receipt.upload'));
            fireEvent.press(uploadButton);

            expect(mockOpenPicker).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest matcher for callback
            expect(mockOpenPicker).toHaveBeenCalledWith({onPicked: expect.any(Function)});
        });

        it('does not call openPicker when isDisplayedInWideRHP is false and calls onPress instead', () => {
            const onPress = jest.fn();
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP={false}
                        onPress={onPress}
                    />
                </Wrapper>,
            );

            const uploadButton = screen.getByLabelText(translateLocal('receipt.upload'));
            fireEvent.press(uploadButton);

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
            render(
                <Wrapper>
                    <ReceiptEmptyState
                        isDisplayedInWideRHP={false}
                        isThumbnail={false}
                    />
                </Wrapper>,
            );

            expect(screen.queryByText(translateLocal('receipt.addAReceipt.phrase1'))).not.toBeOnTheScreen();
            expect(screen.queryByText(translateLocal('receipt.addAReceipt.phrase2'))).not.toBeOnTheScreen();
        });
    });
});
