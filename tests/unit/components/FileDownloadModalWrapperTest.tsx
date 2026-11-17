import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import Modal from '@components/Modal';
import type {FileDownloadModalWrapperProps} from '@components/Modal/Global/FileDownloadModalWrapper';
import FileDownloadModalWrapper from '@components/Modal/Global/FileDownloadModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

describe('FileDownloadModalWrapper', () => {
    const mockedModal = jest.mocked(Modal);
    const mockedActivityIndicator = jest.mocked(ActivityIndicator);
    const getLatestModalProps = () => mockedModal.mock.calls.at(-1)?.[0];

    const getWrapperElement = (props: Partial<FileDownloadModalWrapperProps> = {}) => (
        <FileDownloadModalWrapper
            closeModal={jest.fn()}
            resolveModal={jest.fn()}
            title="title"
            status={CONST.FILE_DOWNLOAD_STATUS.GENERATING}
            message="message"
            onDownload={jest.fn()}
            {...props}
        />
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('removes itself from the modal stack once, and only after the modal has finished hiding', () => {
        // Given the wrapper rendered by the global modal stack
        const closeModal = jest.fn();
        render(getWrapperElement({closeModal}));
        expect(getLatestModalProps()?.isVisible).toBe(true);

        // When a hide event fires while the modal is still visible
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });

        // Then the wrapper stays on the stack
        expect(closeModal).not.toHaveBeenCalled();

        // When the user closes the modal
        act(() => {
            getLatestModalProps()?.onClose?.();
        });

        // Then the modal starts hiding but is not removed until the hide animation ends, so callers awaiting the show
        // promise run their cleanup after the modal is gone
        expect(getLatestModalProps()?.isVisible).toBe(false);
        expect(closeModal).not.toHaveBeenCalled();

        // When the hide event fires, even more than once
        act(() => {
            getLatestModalProps()?.onModalHide?.();
            getLatestModalProps()?.onModalHide?.();
        });

        // Then the wrapper removes itself exactly once, reporting a dismissal while generating as a cancel
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
    });

    it('settles the show promise on dismiss when asked to, and still leaves the stack only after hiding', () => {
        // Given a caller that wants to run its cleanup while the modal fades out, so UI changes behind it stay hidden
        const closeModal = jest.fn();
        const resolveModal = jest.fn();
        render(getWrapperElement({closeModal, resolveModal, shouldResolveOnDismiss: true}));

        // When the user closes the modal while the file is still generating
        act(() => {
            getLatestModalProps()?.onClose?.();
        });

        // Then the show promise resolves right away as a cancel, but the modal stays on the stack while it hides
        expect(resolveModal).toHaveBeenCalledTimes(1);
        expect(resolveModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
        expect(closeModal).not.toHaveBeenCalled();

        // When the hide animation ends
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });

        // Then the modal removes itself from the stack
        expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('does not settle the show promise on dismiss by default', () => {
        // Given a caller that relies on cleanup running after the modal is gone
        const resolveModal = jest.fn();
        render(getWrapperElement({resolveModal}));

        // When the user closes the modal
        act(() => {
            getLatestModalProps()?.onClose?.();
        });

        // Then the show promise is left for closeModal to settle once the modal has hidden
        expect(resolveModal).not.toHaveBeenCalled();
    });

    it.each([CONST.FILE_DOWNLOAD_STATUS.READY, CONST.FILE_DOWNLOAD_STATUS.FAILED])('confirms when dismissed once the file is %s', (status) => {
        // Given a file that is no longer generating, so there is nothing left to cancel
        const closeModal = jest.fn();
        render(getWrapperElement({closeModal, status}));

        // When the user closes the modal and it finishes hiding
        act(() => {
            getLatestModalProps()?.onClose?.();
        });
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });

        // Then the show promise resolves as confirmed, so callers like Submit via PDF keep what they did
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('keeps a dismissed modal unchanged while it hides', () => {
        // Given the user dismissed the modal while the file was generating
        const closeModal = jest.fn();
        const {rerender} = render(getWrapperElement({closeModal}));
        act(() => {
            getLatestModalProps()?.onClose?.();
        });

        // When the caller updates the modal in place with the ready state during the hide animation
        rerender(getWrapperElement({closeModal, status: CONST.FILE_DOWNLOAD_STATUS.READY, message: 'reportDetailsPage.successPDF'}));

        // Then the hiding modal keeps the state it had when dismissed, and still reports the dismissal as a cancel
        expect(screen.getByText('message')).toBeOnTheScreen();
        expect(screen.queryByText('common.download')).not.toBeOnTheScreen();
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
    });

    it('shows the header text the caller passes', () => {
        // Given a caller with its own header text
        render(getWrapperElement({title: 'reportDetailsPage.generatingPDF'}));

        // Then the modal shows it
        expect(screen.getByText('reportDetailsPage.generatingPDF')).toBeOnTheScreen();
    });

    it('shows the spinner and a cancel button while the file is still generating', () => {
        // Given a file that is still generating
        render(getWrapperElement({status: CONST.FILE_DOWNLOAD_STATUS.GENERATING, message: 'reportDetailsPage.waitForPDF'}));

        // Then the spinner and the generating copy are shown
        expect(screen.getByText('reportDetailsPage.waitForPDF')).toBeOnTheScreen();
        expect(mockedActivityIndicator).toHaveBeenCalled();
        expect(screen.getByText('common.cancel')).toBeOnTheScreen();
    });

    it('stops the spinner and offers a close button when the file generation fails', () => {
        // Given a file whose generation failed
        render(getWrapperElement({status: CONST.FILE_DOWNLOAD_STATUS.FAILED, message: 'reportDetailsPage.errorPDF'}));

        // Then there is nothing left to wait for, so the spinner stops and the button closes the modal
        expect(screen.getByText('reportDetailsPage.errorPDF')).toBeOnTheScreen();
        expect(mockedActivityIndicator).not.toHaveBeenCalled();
        expect(screen.getByText('common.close')).toBeOnTheScreen();
    });

    it('auto-downloads once when the file becomes ready while the modal is open', () => {
        // Given an open modal waiting on the file
        const onDownload = jest.fn();
        const {rerender} = render(getWrapperElement({onDownload}));
        expect(onDownload).not.toHaveBeenCalled();

        // When the caller updates the modal in place with the ready state
        rerender(getWrapperElement({onDownload, status: CONST.FILE_DOWNLOAD_STATUS.READY, message: 'reportDetailsPage.successPDF'}));
        rerender(getWrapperElement({onDownload, status: CONST.FILE_DOWNLOAD_STATUS.READY, message: 'reportDetailsPage.successPDF'}));

        // Then the file downloads once and the button offers a manual download
        expect(onDownload).toHaveBeenCalledTimes(1);
        expect(mockedActivityIndicator).toHaveBeenCalledTimes(1);
        expect(screen.getByText('common.download')).toBeOnTheScreen();
    });

    it('closes the modal after a manual download only when asked to', () => {
        // Given a ready file whose caller wants the modal closed on download
        const onDownload = jest.fn();
        render(getWrapperElement({onDownload, status: CONST.FILE_DOWNLOAD_STATUS.READY, shouldCloseOnDownload: true}));
        onDownload.mockClear();

        // When the user presses the download button
        fireEvent.press(screen.getByText('common.download'));

        // Then the file downloads and the modal starts hiding
        expect(onDownload).toHaveBeenCalledTimes(1);
        expect(getLatestModalProps()?.isVisible).toBe(false);
    });
});
