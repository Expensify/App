import {render} from '@testing-library/react-native';

import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal/index.web';

import {hasLauncher, markActivePopoverLauncherDeactivated, pickLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';
import sharedTrapStack from '@libs/sharedTrapStack';

import type {FocusTrapProps} from 'focus-trap-react';

import React from 'react';

jest.mock('@libs/LauncherStack', () => ({
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    // Still on the stack by default, i.e. the trap closed without a forward navigation consuming its launcher.
    hasLauncher: jest.fn(() => true),
    pickLauncher: jest.fn(() => null),
}));

let capturedOptions: FocusTrapProps['focusTrapOptions'] | null = null;

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({focusTrapOptions, children}: Pick<FocusTrapProps, 'focusTrapOptions' | 'children'>) => {
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
        jest.mocked(hasLauncher).mockClear();
        jest.mocked(hasLauncher).mockReturnValue(true);
        jest.mocked(pickLauncher).mockClear();
        jest.mocked(pickLauncher).mockReturnValue(null);
        sharedTrapStack.length = 0;
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

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
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
            expect(mockRestoreFocusWithModality).not.toHaveBeenCalled();
        });
    });

    describe('navigation hand-off', () => {
        // captureTriggerForRoute consumes the launcher on a forward navigation and owns the Back restore from there.
        // Returning focus here too would pull it off the destination screen's autofocused input (FAB > Start chat).
        it('skips the dismiss-time focus return when navigation already consumed the launcher', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            jest.mocked(hasLauncher).mockReturnValue(false);

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
                capturedOptions?.onPostDeactivate?.();
            });

            expect(setActivePopoverLauncher).toHaveBeenCalledWith(anchor);
            expect(mockRestoreFocusWithModality).not.toHaveBeenCalled();
        });
    });

    describe('anchorless modals', () => {
        // The global confirm modal (FAB > Create report > "You already have an empty report") is centered, so it has
        // no anchorRef and nothing is focused when it opens. The popover that opened it registered the real trigger.
        it('falls back to the LauncherStack when there is neither a focused element nor an anchor', () => {
            const fab = document.createElement('button');
            document.body.appendChild(fab);
            jest.mocked(pickLauncher).mockReturnValue(fab);

            render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
                capturedOptions?.onPostDeactivate?.();
            });

            expect(setActivePopoverLauncher).toHaveBeenCalledWith(fab);
            expect(mockRestoreFocusWithModality).toHaveBeenCalledWith(fab, expect.anything());
        });

        it('prefers an explicit anchor over the LauncherStack', () => {
            const anchor = document.createElement('button');
            const stacked = document.createElement('button');
            document.body.appendChild(anchor);
            document.body.appendChild(stacked);
            jest.mocked(pickLauncher).mockReturnValue(stacked);

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
            });

            expect(setActivePopoverLauncher).toHaveBeenCalledWith(anchor);
        });
    });

    describe('covered by a newer trap', () => {
        // Selecting "Create report" in the FAB menu opens a confirm modal while the menu is still closing. The menu's
        // trap must not pull the focus ring back out to the FAB behind that modal.
        it('skips the focus return when a trap opened on top while we were open', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                // Nothing else was open when we activated...
                capturedOptions?.onActivate?.();
                // ...but a modal opened on top before we finished closing (focus-trap removes us before onPostDeactivate).
                sharedTrapStack.length = 1;
                capturedOptions?.onPostDeactivate?.();
            });

            expect(mockRestoreFocusWithModality).not.toHaveBeenCalled();
        });

        it('still returns focus when only the ancestor trap we opened inside remains', () => {
            const anchor = document.createElement('button');
            document.body.appendChild(anchor);
            // An outer modal was already active when this popover opened, and is still active as it closes.
            sharedTrapStack.length = 1;

            render(
                <FocusTrapForModal
                    active
                    launcherRef={{current: anchor}}
                >
                    {null}
                </FocusTrapForModal>,
            );

            withActiveElement(document.body, () => {
                capturedOptions?.onActivate?.();
                capturedOptions?.onPostDeactivate?.();
            });

            expect(mockRestoreFocusWithModality).toHaveBeenCalledWith(anchor, expect.anything());
        });
    });
});
