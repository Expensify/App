import {render} from '@testing-library/react-native';

import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal/index.web';

import {markActivePopoverLauncherDeactivated, setActivePopoverLauncher} from '@libs/LauncherStack';

import React from 'react';

jest.mock('@libs/LauncherStack', () => ({
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
}));

let capturedOptions: {onActivate?: () => void; onPostDeactivate?: () => void} | null = null;

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({focusTrapOptions, children}: {focusTrapOptions: unknown; children: React.ReactNode}) => {
        capturedOptions = focusTrapOptions as typeof capturedOptions;
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
        (setActivePopoverLauncher as jest.Mock).mockClear();
        (markActivePopoverLauncherDeactivated as jest.Mock).mockClear();
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

    it('skips launcher capture when activeElement is document.body (nothing to capture)', () => {
        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(document.body, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(markActivePopoverLauncherDeactivated).not.toHaveBeenCalled();
    });

    describe('launcherRef fallback', () => {
        // Triggers that blur themselves to avoid a focus ring (the FAB, the composer "+") leave activeElement
        // as body, so the anchor is the only thing left to identify the launcher with.
        it('falls back to the anchor when activeElement is body, and returns focus to it on dismiss', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            const anchorRef = {current: anchor};

            render(
                <FocusTrapForModal
                    active
                    launcherRef={anchorRef}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
                capturedOptions?.onPostDeactivate?.();
            });

            expect(setActivePopoverLauncher).toHaveBeenCalledWith(anchor);
            expect(markActivePopoverLauncherDeactivated).toHaveBeenCalledWith(anchor);
            expect(mockRestoreFocusWithModality).toHaveBeenCalledWith(anchor, expect.anything());
        });

        it('prefers the element that actually held focus over the anchor', () => {
            const anchor = document.createElement('button');
            const focused = document.createElement('input');
            document.body.appendChild(anchor);
            document.body.appendChild(focused);

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(focused, () => {
                capturedOptions?.onActivate?.();
            });

            expect(setActivePopoverLauncher).toHaveBeenCalledWith(focused);
        });

        it('ignores an anchor that is not an attached DOM node (native ref / unmounted trigger)', () => {
            const detached = document.createElement('button');

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: detached}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
                capturedOptions?.onPostDeactivate?.();
            });

            expect(setActivePopoverLauncher).not.toHaveBeenCalled();
            expect(markActivePopoverLauncherDeactivated).not.toHaveBeenCalled();
        });
    });
});
