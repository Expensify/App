/** Exercises file selection and submission on the attachment modal, with media rendering replaced below it. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import AttachmentView from '@components/Attachments/AttachmentView';
import type * as AttachmentViewModule from '@components/Attachments/AttachmentView';
import type {ButtonProps} from '@components/Button';
// eslint-disable-next-line no-restricted-imports -- The subject uses this child, so the test must observe that exact dependency.
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';

import getPlatform from '@libs/getPlatform';

import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import type {AttachmentContentProps, AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

// eslint-disable-next-line no-restricted-imports -- This type-only import describes the native host module used by the button mock.
import type * as ReactNative from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Attachments/AttachmentCarousel', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentView', () => ({
    __esModule: true,
    default: jest.fn(() => null),
    checkIsFileImage: jest.requireActual<{default: typeof AttachmentView; checkIsFileImage: typeof AttachmentViewModule.checkIsFileImage}>('@components/Attachments/AttachmentView')
        .checkIsFileImage,
}));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Button', () => {
    const Native = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: Object.assign(
            ({children, onPress, isDisabled}: ButtonProps) => (
                <Native.Pressable
                    testID="send"
                    onPress={(event) => {
                        onPress?.(event);
                    }}
                    disabled={isDisabled}
                >
                    {children}
                </Native.Pressable>
            ),
            {Text: Native.Text, KeyboardShortcut: () => null},
        ),
    };
});
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useBottomSafeSafeAreaPaddingStyle', () => jest.fn(() => ({})));
jest.mock('@libs/getPlatform', () => jest.fn());

const FileSelection = jest.fn(({fileToDisplay}: AttachmentContentProps) => <Text>{fileToDisplay?.name ?? 'no file'}</Text>);

function createOnConfirmMock(implementation?: NonNullable<AttachmentModalBaseContentProps['onConfirm']>) {
    return jest.fn<ReturnType<NonNullable<AttachmentModalBaseContentProps['onConfirm']>>, Parameters<NonNullable<AttachmentModalBaseContentProps['onConfirm']>>>(implementation);
}

function renderAttachmentModal(props: AttachmentModalBaseContentProps = {}) {
    return render(<AttachmentModalBaseContent {...props} />);
}

describe('AttachmentModalBaseContent files', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
    });

    it.each([0, 1, -1, 4])('retains the original array and uses at(%s) for selection', (index) => {
        // Given the mutable file array produced by the attachment upload flow
        const files: FileObject[] = [{name: 'first.png'}, {name: 'second.png'}];
        renderAttachmentModal({file: files, fileToDisplayIndex: index, AttachmentContent: FileSelection});

        // When the real modal passes its selection to attachment content
        const selection = FileSelection.mock.calls.at(-1)?.[0];

        // Then the container and selected element retain their original identities, including negative and missing indices
        expect(selection).toBeDefined();
        expect(selection?.files).toBe(files);
        expect(selection?.fileToDisplay).toBe(files.at(index));
        expect(screen.getByText(files.at(index)?.name ?? 'no file')).toBeOnTheScreen();
    });

    it('preserves absence, filename fallback, scalar identity, empty arrays and prop replacement', () => {
        // Given no supplied file, the content sees absence rather than an invented file
        const view = renderAttachmentModal({AttachmentContent: FileSelection});
        expect(FileSelection.mock.calls.at(-1)?.[0]).toEqual({files: undefined, fileToDisplay: undefined});

        // When a filename, scalar, empty array and replacement array arrive through props
        view.rerender(
            <AttachmentModalBaseContent
                originalFileName="receipt.png"
                AttachmentContent={FileSelection}
            />,
        );
        const fallback = FileSelection.mock.calls.at(-1)?.[0];
        expect(fallback?.files).toEqual({name: 'receipt.png'});
        expect(fallback?.fileToDisplay).toBe(fallback?.files);
        const scalar: FileObject = {name: 'scalar.png'};
        view.rerender(
            <AttachmentModalBaseContent
                file={scalar}
                AttachmentContent={FileSelection}
            />,
        );
        expect(FileSelection.mock.calls.at(-1)?.[0].fileToDisplay).toBe(scalar);
        const empty: FileObject[] = [];
        view.rerender(
            <AttachmentModalBaseContent
                file={empty}
                AttachmentContent={FileSelection}
            />,
        );
        expect(FileSelection.mock.calls.at(-1)?.[0]).toEqual({files: empty, fileToDisplay: undefined});
        const replacement: FileObject[] = [{name: 'replacement.png'}];
        view.rerender(
            <AttachmentModalBaseContent
                file={replacement}
                AttachmentContent={FileSelection}
            />,
        );

        // Then selection tracks the replacement without copying it
        expect(FileSelection.mock.calls.at(-1)?.[0].files).toBe(replacement);
        expect(FileSelection.mock.calls.at(-1)?.[0].fileToDisplay).toBe(replacement.at(0));
    });

    it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID, CONST.PLATFORM.WEB])('mutates and submits the original array with platform close ordering on %s', (platform) => {
        // Given a confirmation that navigates off the modal and an array whose elements must stay untouched
        jest.mocked(getPlatform).mockReturnValue(platform);
        const files: FileObject[] = [{name: 'first.png'}, {name: 'second.png'}];
        const events: string[] = [];
        const onConfirm = createOnConfirmMock(() => events.push('confirm'));
        const onClose = jest.fn(() => events.push('close'));
        renderAttachmentModal({file: files, source: 'https://example.com/receipt.png', onConfirm, onClose, confirmLeavesScreen: true, AttachmentContent: FileSelection});

        // When the rendered send control is pressed
        fireEvent.press(screen.getByTestId('send'));

        // Then source is added to the original container, never to its elements, in the existing platform order
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm.mock.calls.at(0)?.at(0)).toBe(files);
        expect(files).toHaveProperty('source', 'https://example.com/receipt.png');
        expect(files.at(0)).not.toHaveProperty('source');
        expect(files.at(1)).not.toHaveProperty('source');
        expect(events).toEqual(platform === CONST.PLATFORM.WEB ? ['confirm', 'close'] : ['close', 'confirm']);
        expect(onClose.mock.calls.at(0)).toEqual(platform === CONST.PLATFORM.WEB ? [] : [{shouldCallDirectly: true}]);
    });

    it('closes before deferred scalar confirmation and follows a real carousel navigation', () => {
        // Given the real carousel callback owned by the modal and a controlled animation frame
        const frame = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
        const onConfirm = createOnConfirmMock();
        const onClose = jest.fn();
        const scalar: FileObject = {name: 'navigated.png'};
        renderAttachmentModal({report: createMock<Report>({reportID: '1'}), source: 'initial.png', file: {name: 'initial.png'}, onConfirm, onClose});
        const carousel = jest.mocked(AttachmentCarousel).mock.calls.at(-1)?.[0];
        expect(carousel?.onNavigate).toBeDefined();
        if (!carousel?.onNavigate) {
            throw new Error('Expected the modal to install carousel navigation');
        }

        // When carousel selection replaces the file and the user sends it
        act(() => carousel.onNavigate?.({source: 'navigated.png', file: scalar}));
        fireEvent.press(screen.getByTestId('send'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
        const confirm = frame.mock.calls.at(-1)?.[0];
        expect(confirm).toBeDefined();
        if (!confirm) {
            throw new Error('Expected confirmation to be deferred to the next frame');
        }
        act(() => confirm(0));

        // Then confirmation mutates and receives the exact replacement scalar
        expect(onConfirm.mock.calls.at(0)?.at(0)).toBe(scalar);
        expect(scalar).toHaveProperty('source', 'navigated.png');
        frame.mockRestore();
    });

    it('hides send while the attachment keyboard is active and disables explicitly blocked sending', () => {
        // Given the attachment view callback controlling send visibility
        const onConfirm = createOnConfirmMock();
        const view = renderAttachmentModal({source: 'receipt.png', onConfirm});
        const attachment = jest.mocked(AttachmentView).mock.calls.at(-1)?.[0];
        expect(attachment?.onToggleKeyboard).toBeDefined();
        if (!attachment?.onToggleKeyboard) {
            throw new Error('Expected the attachment keyboard callback');
        }

        // When the keyboard is shown, send disappears, and an explicit disabled prop also blocks presses
        act(() => attachment.onToggleKeyboard?.(true));
        expect(screen.queryByTestId('send')).not.toBeOnTheScreen();
        act(() => attachment.onToggleKeyboard?.(false));
        view.rerender(
            <AttachmentModalBaseContent
                source="receipt.png"
                onConfirm={onConfirm}
                shouldDisableSendButton
            />,
        );
        expect(screen.getByTestId('send')).toBeDisabled();
        fireEvent.press(screen.getByTestId('send'));

        // Then neither route confirms a blocked send
        expect(onConfirm).not.toHaveBeenCalled();
        expect(jest.mocked(HeaderWithBackButton)).toHaveBeenCalled();
    });
});
