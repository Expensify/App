import {render, screen} from '@testing-library/react-native';

import DotIndicatorMessage from '@components/DotIndicatorMessage';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

let mockShouldUseNarrowLayout = false;

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({DotIndicator: () => null})),
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

describe('DotIndicatorMessage receipt error with a server reason', () => {
    beforeEach(() => {
        mockShouldUseNarrowLayout = false;
        mockedCanUseTouchScreen.mockReturnValue(false);
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
    });

    it('decodes the server reason the same way as a plain server error', () => {
        // Given a receipt error carrying the server's HTML-encoded reason for rejecting the expense
        const receiptError = {error: CONST.IOU.RECEIPT_ERROR, source: 'source.com', filename: 'file_name.png', message: 'New expenses can&#039;t be added to this report.'};

        // When the receipt error row renders
        render(
            <DotIndicatorMessage
                messages={{error: receiptError}}
                type="error"
            />,
        );

        // Then the reason shows decoded, instead of the generic receipt upload copy
        expect(screen.getByText("New expenses can't be added to this report.")).toBeTruthy();
        expect(screen.queryByText('iou.error.receiptUploadFailedSaveOnlyMessage')).toBeNull();
    });
});
