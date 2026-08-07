import {render} from '@testing-library/react-native';

import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal/index.web';

import {markActivePopoverLauncherDeactivated, pickActiveLauncher, pickLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';

import React from 'react';

// useThemeStyles throws without a ThemeStylesProvider; these tests only exercise focus-trap options.
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({dContents: {display: 'contents'}}),
}));

jest.mock('@libs/LauncherStack', () => ({
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    pickLauncher: jest.fn(() => null),
    pickActiveLauncher: jest.fn(() => null),
}));

type CapturedFocusTrapOptions = {onActivate?: () => void; onPostDeactivate?: () => void};

let capturedOptions: CapturedFocusTrapOptions | null = null;

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({focusTrapOptions, children}: {focusTrapOptions: CapturedFocusTrapOptions; children: React.ReactNode}) => {
        capturedOptions = focusTrapOptions;
        return children;
    },
}));

jest.mock('@libs/Accessibility/blurActiveElement', () => ({__esModule: true, default: jest.fn()}));

const mockRestoreFocusWithModality = jest.fn();
jest.mock('@libs/restoreFocusWithModality', () => ({
    __esModule: true,
    default: (...args: unknown[]): void => {
        mockRestoreFocusWithModality(...args);
    },
}));

// document.activeElement isn't settable under the RN-web test harness — stub via Document.prototype descriptor.
function withActiveElement<T>(element: HTMLElement, fn: () => T): T {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement');
    Object.defineProperty(document, 'activeElement', {configurable: true, get: () => element});
    try {
        return fn();
    } finally {
        if (descriptor) {
            Object.defineProperty(Document.prototype, 'activeElement', descriptor);
        }
    }
}

describe('FocusTrapForModal — launcher capture', () => {
    beforeEach(() => {
        capturedOptions = null;
        jest.mocked(setActivePopoverLauncher).mockClear();
        jest.mocked(markActivePopoverLauncherDeactivated).mockClear();
        jest.mocked(pickLauncher).mockReset();
        jest.mocked(pickLauncher).mockReturnValue(null);
        jest.mocked(pickActiveLauncher).mockReset();
        jest.mocked(pickActiveLauncher).mockReturnValue(null);
        mockRestoreFocusWithModality.mockReset();
        document.body.innerHTML = '';
    });

    it('caches the launcher and schedules the deferred clear on activate/deactivate', () => {
        const launcher = document.createElement('button');
        document.body.appendChild(launcher);

        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(launcher, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(launcher);
        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalled();
    });

    it('captures the launcher even when shouldReturnFocus is false (PopoverMenu / ThreeDotsMenu / ReanimatedModal with new focus management)', () => {
        // The clicked menu item unmounts on close — without the launcher on the stack, nav-back has nothing to restore.
        const launcher = document.createElement('button');
        document.body.appendChild(launcher);

        render(
            <FocusTrapForModal
                active
                shouldReturnFocus={false}
            >
                {null}
            </FocusTrapForModal>,
        );

        withActiveElement(launcher, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(launcher);
        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalled();
    });

    it('marks the LauncherStack entry deactivated even if restoreFocusWithModality throws', () => {
        const launcher = document.createElement('button');
        document.body.appendChild(launcher);
        mockRestoreFocusWithModality.mockImplementation(() => {
            throw new Error('focus failed');
        });

        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(launcher, () => {
            capturedOptions?.onActivate?.();
            try {
                capturedOptions?.onPostDeactivate?.();
            } catch {
                // swallow — mocked throw, the assertion below pins markActive ran first
            }
        });

        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalledWith(launcher);
    });

    it('skips launcher capture when activeElement is document.body and LauncherStack is empty', () => {
        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(document.body, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(markActivePopoverLauncherDeactivated).not.toHaveBeenCalled();
    });

    it('falls back to pickLauncher when activeElement is document.body (ThreeDots pre-blur)', () => {
        const launcher = document.createElement('button');
        document.body.appendChild(launcher);
        jest.mocked(pickLauncher).mockReturnValue(launcher);

        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(document.body, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(launcher);
        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalledWith(launcher);
    });
});
