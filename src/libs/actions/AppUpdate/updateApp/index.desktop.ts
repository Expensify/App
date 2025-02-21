import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function updateApp(isProduction: boolean) {
    window.electron.send(ELECTRON_EVENTS.SILENT_UPDATE);
}
