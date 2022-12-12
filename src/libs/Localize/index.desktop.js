import ELECTRON_EVENTS from "../../../desktop/ELECTRON_EVENTS";

window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val);
