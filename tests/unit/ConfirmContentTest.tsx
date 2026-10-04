import {render, screen, within} from '@testing-library/react-native';

import ConfirmContent from '@components/ConfirmContent';
import type ImageSVGProps from '@components/ImageSVG/types';
import ModalContext from '@components/Modal/ModalContext';

import CONST from '@src/CONST';

import React from 'react';

type ButtonProps = {
    variant?: string;
    onPress?: () => void;
    children?: React.ReactNode;
    [key: string]: unknown;
};

const mockButtonSpy = jest.fn<void, [ButtonProps]>();
const mockImageSVGSpy = jest.fn<void, [ImageSVGProps]>();

jest.mock('@components/Button', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    const MockButton = (props: ButtonProps) => {
        mockButtonSpy(props);
        return ReactLib.createElement('mock-button', props);
    };
    return {
        __esModule: true,
        default: Object.assign(MockButton, {
            Text: () => null,
            Icon: () => null,
            KeyboardShortcut: () => null,
        }),
    };
});

jest.mock('@components/ImageSVG', () => (props: ImageSVGProps) => {
    mockImageSVGSpy(props);
    return null;
});

jest.mock('@components/ScrollView', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: ({children}: {children?: React.ReactNode}) => ReactLib.createElement('mock-scroll-view', {testID: 'prompt-scroll-view'}, children),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

jest.mock('@hooks/useTheme', () =>
    jest.fn(() => ({
        icon: '#000',
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        m5: {},
        mt3: {},
        mt4: {},
        mb3: {},
        mb4: {},
        mb6: {},
        flex1: {},
        flexRow: {},
        gap4: {},
        noSelect: {},
        alignItemsCenter: {},
        alignItemsEnd: {},
        alignSelfCenter: {},
        justifyContentCenter: {},
        textAlignCenter: {},
        pv0: {},
    })),
);

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

describe('ConfirmContent', () => {
    beforeEach(() => {
        mockButtonSpy.mockClear();
        mockImageSVGSpy.mockClear();
    });

    function getConfirmButtonProps(onConfirm: () => void): ButtonProps | undefined {
        const calls = mockButtonSpy.mock.calls;
        return calls.find((call) => call[0].onPress === onConfirm)?.[0];
    }

    const testCases = [
        {shouldShowCancelButton: false, buttonVariant: CONST.BUTTON_VARIANT.SUCCESS, expectedVariant: undefined},
        {shouldShowCancelButton: false, buttonVariant: CONST.BUTTON_VARIANT.DANGER, expectedVariant: CONST.BUTTON_VARIANT.DANGER},
        {shouldShowCancelButton: true, buttonVariant: CONST.BUTTON_VARIANT.SUCCESS, expectedVariant: CONST.BUTTON_VARIANT.SUCCESS},
        {shouldShowCancelButton: true, buttonVariant: CONST.BUTTON_VARIANT.DANGER, expectedVariant: CONST.BUTTON_VARIANT.DANGER},
    ];

    describe('stacked buttons (shouldStackButtons=true)', () => {
        it.each(testCases)(
            'confirm button variant=$expectedVariant when shouldShowCancelButton=$shouldShowCancelButton, buttonVariant=$buttonVariant',
            ({shouldShowCancelButton, buttonVariant, expectedVariant}) => {
                mockButtonSpy.mockClear();
                const onConfirm = jest.fn();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={onConfirm}
                        isVisible
                        shouldStackButtons
                        shouldShowCancelButton={shouldShowCancelButton}
                        buttonVariant={buttonVariant}
                    />,
                );

                const confirmProps = getConfirmButtonProps(onConfirm);
                expect(confirmProps?.variant).toBe(expectedVariant);
            },
        );
    });

    describe('side-by-side buttons (shouldStackButtons=false)', () => {
        it.each(testCases)(
            'confirm button variant=$expectedVariant when shouldShowCancelButton=$shouldShowCancelButton, buttonVariant=$buttonVariant',
            ({shouldShowCancelButton, buttonVariant, expectedVariant}) => {
                mockButtonSpy.mockClear();
                const onConfirm = jest.fn();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={onConfirm}
                        isVisible
                        shouldStackButtons={false}
                        shouldShowCancelButton={shouldShowCancelButton}
                        buttonVariant={buttonVariant}
                    />,
                );

                const confirmProps = getConfirmButtonProps(onConfirm);
                expect(confirmProps?.variant).toBe(expectedVariant);
            },
        );
    });

    describe('scrollable prompt (shouldEnablePromptScroll=true)', () => {
        const prompt = '• Report 1\n• Report 2';

        it('puts the prompt in its own ScrollView when the modal does not already scroll its children', () => {
            // Given a modal that renders its children without a ScrollView, as a bottom-docked modal does in portrait
            // When a long prompt asks to be scrollable
            render(
                <ModalContext.Provider value={{isContentWrappedInScrollView: false, default: false}}>
                    <ConfirmContent
                        title="Test"
                        onConfirm={jest.fn()}
                        isVisible
                        prompt={prompt}
                        shouldEnablePromptScroll
                    />
                </ModalContext.Provider>,
            );

            // Then the prompt scrolls on its own, so the title and buttons stay pinned around the long list
            expect(within(screen.getByTestId('prompt-scroll-view')).getByText(prompt)).toBeOnTheScreen();
        });

        it('renders the prompt without its own ScrollView when the modal already scrolls its children', () => {
            // Given a modal that already wraps its children in a ScrollView, as a bottom-docked modal does in landscape
            // When a long prompt asks to be scrollable
            render(
                <ModalContext.Provider value={{isContentWrappedInScrollView: true, default: false}}>
                    <ConfirmContent
                        title="Test"
                        onConfirm={jest.fn()}
                        isVisible
                        prompt={prompt}
                        shouldEnablePromptScroll
                    />
                </ModalContext.Provider>,
            );

            // Then the prompt is not nested in a second vertical scroller: iOS would keep the drag in the inner one and Android would
            // give it to the outer one, leaving either the buttons or the end of the list unreachable
            expect(screen.queryByTestId('prompt-scroll-view')).toBeNull();
            expect(screen.getByText(prompt)).toBeOnTheScreen();
        });
    });

    it('uses custom image dimensions', () => {
        render(
            <ConfirmContent
                title="Test"
                onConfirm={jest.fn()}
                isVisible
                image={() => null}
                imageWidth={160}
                imageHeight={140}
            />,
        );

        expect(mockImageSVGSpy).toHaveBeenCalledWith(expect.objectContaining({width: 160, height: 140}));
    });

    it('falls back to default SVG dimensions when width/height are omitted', () => {
        render(
            <ConfirmContent
                title="Test"
                onConfirm={jest.fn()}
                isVisible
                image={() => null}
            />,
        );

        expect(mockImageSVGSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                height: CONST.CONFIRM_CONTENT_SVG_SIZE.HEIGHT,
                width: CONST.CONFIRM_CONTENT_SVG_SIZE.WIDTH,
            }),
        );
    });
});
