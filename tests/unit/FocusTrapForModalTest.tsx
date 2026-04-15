import {render} from '@testing-library/react-native';
import React from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal/index.web';
import {scheduleClearActivePopoverLauncher, setActivePopoverLauncher} from '@libs/NavigationFocusReturn';

jest.mock('@libs/NavigationFocusReturn', () => ({
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

// eslint-disable-next-line @typescript-eslint/naming-convention
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

describe('FocusTrapForModal — shouldReturnFocus gate on launcher capture', () => {
    beforeEach(() => {
        capturedOptions = null;
        (setActivePopoverLauncher as jest.Mock).mockClear();
        (scheduleClearActivePopoverLauncher as jest.Mock).mockClear();
        document.body.innerHTML = '';
    });

    it('caches the launcher and schedules the deferred clear when shouldReturnFocus is true (default)', () => {
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

    it('skips launcher capture and deferred clear when shouldReturnFocus is false (e.g. DatePickerModal)', () => {
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

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(scheduleClearActivePopoverLauncher).not.toHaveBeenCalled();
    });
});
