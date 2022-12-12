import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import * as Localize from './BaseLocaleListener';

Localize.listenForLocaleChanges(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
