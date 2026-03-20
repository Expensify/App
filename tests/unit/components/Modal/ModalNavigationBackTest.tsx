import {act, render} from '@testing-library/react-native';
import React from 'react';

type CapturedBaseModalProps = {
    children?: React.ReactNode;
    onModalHide?: () => void;
    onModalShow?: () => void;
};

type ModalHarnessProps = {
    children?: React.ReactNode;
    isVisible: boolean;
    onClose?: () => void;
    onModalHide?: () => void;
    shouldHandleNavigationBack?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports, import/extensions
const modalModule = require('../../../../src/components/Modal/index.tsx') as {
    default: (props: ModalHarnessProps) => React.ReactElement<CapturedBaseModalProps>;
};

const Modal = modalModule.default;

let latestBaseModalProps: CapturedBaseModalProps | undefined;

const mockSetBackgroundColor = jest.fn<void, [string]>();
const mockGetBackgroundColor = jest.fn<string | undefined, []>(() => '#ffffff');

jest.mock('@hooks/useStyleUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        getThemeBackgroundColor: () => '#000000',
    }),
}));

jest.mock('@hooks/useTheme', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        appBG: '#ffffff',
    }),
}));

jest.mock('@libs/StatusBar', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        getBackgroundColor: () => mockGetBackgroundColor(),
        setBackgroundColor: (color: string) => mockSetBackgroundColor(color),
    },
}));

function ModalHarness({children, isVisible, onClose, onModalHide, shouldHandleNavigationBack}: ModalHarnessProps) {
    const baseModalElement = Modal({children, isVisible, onClose, onModalHide, shouldHandleNavigationBack});
    latestBaseModalProps = baseModalElement.props;
    return null;
}

describe('Modal shouldHandleNavigationBack', () => {
    beforeEach(() => {
        latestBaseModalProps = undefined;
        jest.clearAllMocks();
        jest.useFakeTimers();
        window.history.replaceState({existing: 'state'}, '', window.location.href);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        window.history.replaceState({}, '', window.location.href);
    });

    it('pushes a guard history entry and closes on popstate when enabled', () => {
        const onClose = jest.fn();

        render(
            <ModalHarness
                isVisible
                onClose={onClose}
                shouldHandleNavigationBack
            >
                {null}
            </ModalHarness>,
        );

        // Given a modal configured to handle browser back navigation
        expect(typeof latestBaseModalProps?.onModalShow).toBe('function');

        // When the modal show callback runs and the browser navigates back
        act(() => {
            latestBaseModalProps?.onModalShow?.();
        });

        expect(window.history.state).toMatchObject({existing: 'state', shouldGoBack: true});

        act(() => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        // Then the modal should close through its onClose callback
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('runs onModalHide immediately and schedules history.back when enabled', () => {
        const onModalHide = jest.fn();
        const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

        render(
            <ModalHarness
                isVisible
                onClose={jest.fn()}
                onModalHide={onModalHide}
                shouldHandleNavigationBack
            >
                {null}
            </ModalHarness>,
        );

        act(() => {
            latestBaseModalProps?.onModalShow?.();
        });

        // Given a shown modal with the guard history entry
        expect(window.history.state).toMatchObject({shouldGoBack: true});

        // When the modal hide callback runs
        act(() => {
            latestBaseModalProps?.onModalHide?.();
        });

        // Then it should notify the caller immediately and schedule a browser back
        expect(onModalHide).toHaveBeenCalledTimes(1);
        expect(historyBackSpy).not.toHaveBeenCalled();

        act(() => {
            jest.runAllTimers();
        });

        expect(historyBackSpy).toHaveBeenCalledTimes(1);

        historyBackSpy.mockRestore();
    });

    it('does not register browser back handling when disabled', () => {
        const onClose = jest.fn();
        const onModalHide = jest.fn();
        const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

        render(
            <ModalHarness
                isVisible
                onClose={onClose}
                onModalHide={onModalHide}
            >
                {null}
            </ModalHarness>,
        );

        // When modal show and hide callbacks run without the navigation-back flag
        act(() => {
            latestBaseModalProps?.onModalShow?.();
        });

        act(() => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        act(() => {
            latestBaseModalProps?.onModalHide?.();
            jest.runAllTimers();
        });

        // Then it should not wire browser navigation behavior
        expect(window.history.state).toMatchObject({existing: 'state'});
        expect(onClose).not.toHaveBeenCalled();
        expect(onModalHide).toHaveBeenCalledTimes(1);
        expect(historyBackSpy).not.toHaveBeenCalled();

        historyBackSpy.mockRestore();
    });
});
