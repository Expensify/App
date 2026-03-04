import {render} from '@testing-library/react-native';
import React from 'react';
import ConfirmContent from '@components/ConfirmContent';

type ButtonProps = {
    success?: boolean;
    danger?: boolean;
    text?: string;
    onPress?: () => void;
    [key: string]: unknown;
};

const mockButtonSpy = jest.fn<void, [ButtonProps]>();

jest.mock('@components/Button', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: ButtonProps) => {
            mockButtonSpy(props);
            return ReactLib.createElement('mock-button', props);
        },
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

    function getConfirmButtonProps(shouldStackButtons: boolean): ButtonProps | undefined {
        const calls = mockButtonSpy.mock.calls;
        if (shouldStackButtons) {
            return calls.find((call) => call[0].pressOnEnter)?.[0];
        }
        return calls.find((call) => call[0].pressOnEnter)?.[0];
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

    describe('stacked buttons (shouldStackButtons=true)', () => {
        it.each(testCases)(
            'confirm button success=$expectedSuccess when shouldShowCancelButton=$shouldShowCancelButton, danger=$danger, success=$success',
            ({shouldShowCancelButton, danger, success, expectedSuccess}) => {
                mockButtonSpy.mockClear();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={jest.fn()}
                        isVisible
                        shouldStackButtons
                        shouldShowCancelButton={shouldShowCancelButton}
                        danger={danger}
                        success={success}
                    />,
                );

                const confirmProps = getConfirmButtonProps(true);
                expect(confirmProps?.success).toBe(expectedSuccess);
                expect(confirmProps?.danger).toBe(danger);
            },
        );
    });

    describe('side-by-side buttons (shouldStackButtons=false)', () => {
        it.each(testCases)(
            'confirm button success=$expectedSuccess when shouldShowCancelButton=$shouldShowCancelButton, danger=$danger, success=$success',
            ({shouldShowCancelButton, danger, success, expectedSuccess}) => {
                mockButtonSpy.mockClear();
                render(
                    <ConfirmContent
                        title="Test"
                        onConfirm={jest.fn()}
                        isVisible
                        shouldStackButtons={false}
                        shouldShowCancelButton={shouldShowCancelButton}
                        danger={danger}
                        success={success}
                    />,
                );

                const confirmProps = getConfirmButtonProps(false);
                expect(confirmProps?.success).toBe(expectedSuccess);
                expect(confirmProps?.danger).toBe(danger);
            },
        );
    });
});
