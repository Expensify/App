import BaseLocaleListener from './BaseLocaleListener';
import {LocaleListenerConnect} from './types';

const localeListener: LocaleListenerConnect = BaseLocaleListener.connect;

export default {
    connect: localeListener,
};
