import {render, screen} from '@testing-library/react-native';

import DotIndicatorMessage from '@components/DotIndicatorMessage';
import type Text from '@components/Text';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

let mockShouldUseNarrowLayout = false;

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Button', () => {
    const {default: MockText} = jest.requireActual<{default: typeof Text}>('@components/Text');
    function MockButton({children}: {children?: React.ReactNode}) {
        return children;
    }
    MockButton.Icon = () => null;
    MockButton.Text = ({children}: {children?: React.ReactNode}) => <MockText>{children}</MockText>;
    return MockButton;
});
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({ArrowCircleClockwise: () => null, DotIndicator: () => null, Download: () => null})),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: mockShouldUseNarrowLayout,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
    })),
);
jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getDotIndicatorTextStyles: jest.fn(() => ({}))})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({danger: '', success: '', text: ''})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        userSelectText: {userSelect: 'text'},
        userSelectNone: {userSelect: 'none'},
        dotIndicatorMessage: {},
        offlineFeedbackErrorDot: {},
        offlineFeedbackTextContainer: {},
    })),
);
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: jest.fn(),
}));
jest.mock('@libs/getPlatform', () => jest.fn());

const mockedCanUseTouchScreen = jest.mocked(canUseTouchScreen);
const mockedGetPlatform = jest.mocked(getPlatform);
const MESSAGE = 'Company card required';

function renderMessage() {
    return render(
        <DotIndicatorMessage
            messages={{error: MESSAGE}}
            type="error"
            isSelectable={false}
        />,
    );
}

describe('DotIndicatorMessage selection override', () => {
    beforeEach(() => {
        mockShouldUseNarrowLayout = false;
        mockedCanUseTouchScreen.mockReturnValue(false);
    });

    it('disables text selection on web when explicitly requested', () => {
        // Given a web layout whose default behavior allows text selection.
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        // When the caller explicitly disables selection.
        renderMessage();

        // Then the web-specific override prevents text selection.
        expect(screen.getByText(MESSAGE)).toHaveStyle({userSelect: 'none'});
    });

    it('preserves the default text selection behavior on native', () => {
        // Given a native layout whose default behavior allows text selection.
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

        // When the caller passes the web-specific selection override.
        renderMessage();

        // Then native ignores the override and keeps its existing selection behavior.
        expect(screen.getByText(MESSAGE)).toHaveStyle({userSelect: 'text'});
    });
});

describe('DotIndicatorMessage receipt error server reason', () => {
    it('renders the server rejection message while keeping receipt retry and save actions', () => {
        // Given a receipt error alongside a server rejection reason and a retry callback.
        const serverReason = 'New expenses cannot be added to this report.';

        // When rendering DotIndicatorMessage with both errors.
        render(
            <DotIndicatorMessage
                messages={{
                    receiptError: {
                        error: CONST.IOU.RECEIPT_ERROR,
                        source: 'file:///receipt.jpg',
                        filename: 'receipt.jpg',
                        action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
                    },
                    serverError: serverReason,
                }}
                type="error"
                onRetryReceiptUpload={jest.fn()}
            />,
        );

        // Then the server rejection message is shown along with both Try again and Save buttons.
        expect(screen.getByText(serverReason)).toBeOnTheScreen();
        expect(screen.getByText('common.tryAgain')).toBeOnTheScreen();
        expect(screen.getByText('common.save')).toBeOnTheScreen();
    });

    it('falls back to the generic receipt upload error when no server message is attached', () => {
        // Given a standard receipt error without a server rejection reason.
        const receiptOnlyMessages = {
            receiptError: {
                error: CONST.IOU.RECEIPT_ERROR,
                source: 'file:///receipt.jpg',
                filename: 'receipt.jpg',
                action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
            },
        };

        // When rendering DotIndicatorMessage with only that receipt error.
        render(
            <DotIndicatorMessage
                messages={receiptOnlyMessages}
                type="error"
                onRetryReceiptUpload={jest.fn()}
            />,
        );

        // Then the localized receipt upload failure copy is shown.
        expect(screen.getByText('iou.error.receiptUploadFailedMessage')).toBeOnTheScreen();
    });
});
