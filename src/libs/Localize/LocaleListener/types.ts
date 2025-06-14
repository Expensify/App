import type {Locale} from '@src/CONST/LOCALES';

type LocaleListenerConnect = (callbackAfterChange?: (locale?: Locale) => void) => void;

type LocaleListener = {
    connect: LocaleListenerConnect;
};

export type {LocaleListenerConnect, LocaleListener};
