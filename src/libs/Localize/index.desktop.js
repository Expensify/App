import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

BaseLocaleListener.listenForLocaleChanges(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
