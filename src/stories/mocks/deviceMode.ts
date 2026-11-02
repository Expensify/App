/**
 * Storybook-only device mode, read by the `canUseTouchScreen` and `useIsInLandscapeMode` mocks (aliased in `.storybook/mockPaths.ts`).
 * It lets a desktop browser render the phone layouts: the touch number pad, the touch-only buttons and the landscape columns.
 *
 * Touch support is read once, when each module loads, so the mode is kept in the session storage of the preview iframe and a
 * switch between the web and the mobile modes reloads the iframe. Switching the orientation of a mobile mode applies live.
 * With no stored mode the mocks behave like the real implementations.
 *
 * The aliases apply to the whole preview bundle, so a mode must not outlive the stories that pick it: the preview decorator
 * (`.storybook/preview.tsx`) clears it, and reloads when it had applied touch support, as soon as any other story renders.
 */
type DeviceMode = 'web' | 'mobilePortrait' | 'mobileLandscape';

type Listener = () => void;

const STORAGE_KEY = 'storybookDeviceMode';
const DEVICE_MODES: readonly DeviceMode[] = ['web', 'mobilePortrait', 'mobileLandscape'];

function isDeviceMode(value: string | null): value is DeviceMode {
    return DEVICE_MODES.some((mode) => mode === value);
}

function readStoredDeviceMode(): DeviceMode | undefined {
    try {
        const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
        return isDeviceMode(storedValue) ? storedValue : undefined;
    } catch {
        return undefined;
    }
}

let deviceMode = readStoredDeviceMode();
const listeners = new Set<Listener>();

/** Device mode the preview runs in, or `undefined` when no story picked one */
function getDeviceMode(): DeviceMode | undefined {
    return deviceMode;
}

/** Whether the device mode renders the touch layouts */
function isTouchDeviceMode(mode: DeviceMode): boolean {
    return mode !== 'web';
}

/**
 * Stores the device mode and notifies the subscribed hooks. Returns false when the session storage is unavailable, in which case
 * the mode only lasts until the next reload.
 */
function setDeviceMode(mode: DeviceMode): boolean {
    deviceMode = mode;
    for (const listener of listeners) {
        listener();
    }

    try {
        window.sessionStorage.setItem(STORAGE_KEY, mode);
        return true;
    } catch {
        return false;
    }
}

/**
 * Drops the stored device mode, so the mocks report the real device again. Returns true when the dropped mode had applied touch
 * support, which the loaded modules read once and so only a reload takes back.
 */
function clearDeviceMode(): boolean {
    const hadTouchMode = deviceMode !== undefined && isTouchDeviceMode(deviceMode);
    deviceMode = undefined;
    for (const listener of listeners) {
        listener();
    }

    try {
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // The mode only lived in memory, which is already cleared
    }
    return hadTouchMode;
}

function subscribeToDeviceMode(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export {clearDeviceMode, getDeviceMode, isTouchDeviceMode, setDeviceMode, subscribeToDeviceMode};
export type {DeviceMode};
