import {render} from '@testing-library/react-native';

import ConfirmContent from '@components/ConfirmContent';

import CONST from '@src/CONST';

import React from 'react';

type ButtonProps = {
    variant?: string;
    onPress?: () => void;
    children?: React.ReactNode;
    [key: string]: unknown;
};

const mockButtonSpy = jest.fn<void, [ButtonProps]>();

jest.mock('@components/ButtonComposed', () => {
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
    });

    function getConfirmButtonProps(onConfirm: () => void): ButtonProps | undefined {
        const calls = mockButtonSpy.mock.calls;
        return calls.find((call) => call[0].onPress === onConfirm)?.[0];
    }

    const testCases = [
        {shouldShowCancelButton: false, danger: false, success: false, expectedSuccess: false},
        {shouldShowCancelButton: false, danger: false, success: true, expectedSuccess: false},
        {shouldShowCancelButton: false, danger: true, success: false, expectedSuccess: false},
        {shouldShowCancelButton: false, danger: true, success: true, expectedSuccess: false},
        {shouldShowCancelButton: true, danger: false, success: false, expectedSuccess: false},
        {shouldShowCancelButton: true, danger: false, success: true, expectedSuccess: true},
        {shouldShowCancelButton: true, danger: true, success: false, expectedSuccess: false},
        {shouldShowCancelButton: true, danger: true, success: true, expectedSuccess: false},
    ];

    function expectedVariant(danger: boolean, expectedSuccess: boolean): string | undefined {
        if (danger) {
            return CONST.BUTTON_VARIANT.DANGER;
        }
        if (expectedSuccess) {
            return CONST.BUTTON_VARIANT.SUCCESS;
        }
        return undefined;
    }

    describe('stacked buttons (shouldStackButtons=true)', () => {
        it.each(testCases)(
            'confirm button variant=$expectedSuccess when shouldShowCancelButton=$shouldShowCancelButton, danger=$danger, success=$success',
            ({shouldShowCancelButton, danger, success, expectedSuccess}) => {
                mockButtonSpy.mockClear();
                const onConfirm = jest.fn();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={onConfirm}
                        isVisible
                        shouldStackButtons
                        shouldShowCancelButton={shouldShowCancelButton}
                        danger={danger}
                        success={success}
                    />,
                );

                const confirmProps = getConfirmButtonProps(onConfirm);
                expect(confirmProps?.variant).toBe(expectedVariant(danger, expectedSuccess));
            },
        );
    });

    describe('side-by-side buttons (shouldStackButtons=false)', () => {
        it.each(testCases)(
            'confirm button variant=$expectedSuccess when shouldShowCancelButton=$shouldShowCancelButton, danger=$danger, success=$success',
            ({shouldShowCancelButton, danger, success, expectedSuccess}) => {
                mockButtonSpy.mockClear();
                const onConfirm = jest.fn();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={onConfirm}
                        isVisible
                        shouldStackButtons={false}
                        shouldShowCancelButton={shouldShowCancelButton}
                        danger={danger}
                        success={success}
                    />,
                );

                const confirmProps = getConfirmButtonProps(onConfirm);
                expect(confirmProps?.variant).toBe(expectedVariant(danger, expectedSuccess));
            },
        );
    });
});
