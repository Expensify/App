import {fireEvent, render, screen} from '@testing-library/react-native';

import PDFView from '@components/PDFView/index.native';

import {openTravelDotLink} from '@libs/openTravelDotLink';

import type {PdfProps} from 'react-native-pdf';

import React from 'react';
import {Linking} from 'react-native';

jest.mock('react-native-pdf', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return function MockPDF({onPressLink, enableDoubleTapZoom}: PdfProps) {
        return ReactModule.createElement('PDF', {testID: 'pdf', onPressLink, enableDoubleTapZoom});
    };
});

jest.mock('@components/KeyboardAvoidingView', () => () => null);
jest.mock('@components/LoadingIndicator', () => () => null);
jest.mock('@components/Pressable/PressableWithoutFeedback', () => () => null);
jest.mock('@components/PDFView/PDFPasswordForm', () => () => null);
jest.mock('@hooks/useKeyboardState', () => ({__esModule: true, default: () => ({isKeyboardShown: false})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => ['123']}));
jest.mock('@hooks/useResponsiveLayout', () => ({__esModule: true, default: () => ({shouldUseNarrowLayout: true})}));
jest.mock('@hooks/useSafeAreaPaddings', () => ({__esModule: true, default: () => ({insets: {top: 0, bottom: 0, left: 0, right: 0}})}));
jest.mock('@hooks/useStyleUtils', () => ({__esModule: true, default: () => ({getPDFViewStyle: () => ({})})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useWindowDimensions', () => ({__esModule: true, default: () => ({windowWidth: 400, windowHeight: 800})}));
jest.mock('@libs/openTravelDotLink', () => ({openTravelDotLink: jest.fn()}));

describe('native PDF annotation links', () => {
    let openURLSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        'new-expensify://transition',
        'new-expensify://transition?email=stranger@example.com',
        'https://new.expensify.com/transition',
        // eslint-disable-next-line no-script-url -- Verify that untrusted script annotations are rejected.
        'javascript:alert(1)',
    ])('does not open annotation URL %s', (url) => {
        // Given a PDF rendered in the native attachment viewer
        render(
            <PDFView
                sourceURL="https://example.com/receipt.pdf"
                onLoadComplete={jest.fn()}
            />,
        );

        // When the reader presses an unsafe annotation
        fireEvent(screen.getByTestId('pdf'), 'pressLink', url);

        // Then neither operating-system nor travel navigation is triggered
        expect(openURLSpy).not.toHaveBeenCalled();
        expect(openTravelDotLink).not.toHaveBeenCalled();
    });

    it('opens an external web annotation', () => {
        // Given a PDF rendered in the native attachment viewer
        render(
            <PDFView
                sourceURL="https://example.com/receipt.pdf"
                onLoadComplete={jest.fn()}
            />,
        );

        // When the reader presses an external web link
        fireEvent(screen.getByTestId('pdf'), 'pressLink', 'https://example.com/receipt');

        // Then the existing URL-opening behavior is preserved
        expect(openURLSpy).toHaveBeenCalledWith('https://example.com/receipt');
    });

    it('preserves authenticated travel links', () => {
        // Given a PDF rendered with an active workspace
        render(
            <PDFView
                sourceURL="https://example.com/receipt.pdf"
                onLoadComplete={jest.fn()}
            />,
        );

        // When the reader presses an external travel link
        fireEvent(screen.getByTestId('pdf'), 'pressLink', 'https://travel.expensify.com/trips/123');

        // Then the existing travel authentication flow is used
        expect(openTravelDotLink).toHaveBeenCalledWith('123', '/trips/123');
        expect(openURLSpy).not.toHaveBeenCalled();
    });
});

describe('native PDF zoom', () => {
    it('enables double-tap zoom', () => {
        // Given a PDF rendered in the native attachment viewer
        render(
            <PDFView
                sourceURL="https://example.com/receipt.pdf"
                onLoadComplete={jest.fn()}
            />,
        );

        // When the native PDF component receives its props
        const pdf = screen.getByTestId('pdf');

        // Then double-tap zoom is explicitly enabled, because on the New Architecture an omitted prop is read as false
        expect(pdf.props.enableDoubleTapZoom).toBe(true);
    });
});
