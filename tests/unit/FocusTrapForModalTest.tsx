import {render} from '@testing-library/react-native';
import React from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal/index.web';
import {scheduleClearActivePopoverLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';

jest.mock('@libs/LauncherStack', () => ({
    setActivePopoverLauncher: jest.fn(),
    scheduleClearActivePopoverLauncher: jest.fn(),
}));

let capturedOptions: {onActivate?: () => void; onPostDeactivate?: () => void} | null = null;

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({focusTrapOptions, children}: {focusTrapOptions: unknown; children: React.ReactNode}) => {
        capturedOptions = focusTrapOptions as typeof capturedOptions;
        return children;
    },
}));

jest.mock('@libs/Accessibility/blurActiveElement', () => ({__esModule: true, default: jest.fn()}));

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
        (scheduleClearActivePopoverLauncher as jest.Mock).mockClear();
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
        expect(scheduleClearActivePopoverLauncher).toHaveBeenCalled();
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
        expect(scheduleClearActivePopoverLauncher).toHaveBeenCalled();
    });

    it('skips launcher capture when activeElement is document.body (nothing to capture)', () => {
        render(<FocusTrapForModal active>{null}</FocusTrapForModal>);

        withActiveElement(document.body, () => {
            capturedOptions?.onActivate?.();
            capturedOptions?.onPostDeactivate?.();
        });

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(scheduleClearActivePopoverLauncher).not.toHaveBeenCalled();
    });
});
