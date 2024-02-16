import BaseLocaleListener from './BaseLocaleListener';
import type {LocaleListener, LocaleListenerConnect} from './types';

const localeListenerConnect: LocaleListenerConnect = BaseLocaleListener.connect;

const localizeListener: LocaleListener = {
    connect: localeListenerConnect,
};

export default localizeListener;
