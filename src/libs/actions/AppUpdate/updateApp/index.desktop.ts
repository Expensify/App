import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';

export default function updateApp() {
    window.electron.send(ELECTRON_EVENTS.SILENT_UPDATE);
}
