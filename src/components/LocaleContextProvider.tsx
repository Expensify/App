import React, {createContext, useMemo} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import * as LocaleDigitUtils from '@libs/LocaleDigitUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import * as NumberFormatUtils from '@libs/NumberFormatUtils';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import withCurrentUserPersonalDetails, {WithCurrentUserPersonalDetailsProps} from './withCurrentUserPersonalDetails';

type Locale = ValueOf<typeof CONST.LOCALES>;

type LocaleContextProviderOnyxProps = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: OnyxEntry<Locale>;
};

type LocaleContextProviderProps = LocaleContextProviderOnyxProps &
    WithCurrentUserPersonalDetailsProps & {
        /** Actual content wrapped by this component */
        children: React.ReactNode;
    };

type LocaleContextProps = {
    /** Returns translated string for given locale and phrase */
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: Localize.PhraseParameters<Localize.Phrase<TKey>>) => string;

    /** Formats number formatted according to locale and options */
    numberFormat: (number: number, options: Intl.NumberFormatOptions) => string;

    /** Converts a datetime into a localized string representation that's relative to current moment in time */
    datetimeToRelative: (datetime: string) => string;

    /** Formats a datetime to local date and time string */
    datetimeToCalendarTime: (datetime: string, includeTimezone: boolean, isLowercase: boolean) => string;

    /** Updates date-fns internal locale */
    updateLocale: () => void;

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: (phoneNumber: string) => string;

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: (digit: string) => string;

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: (digit: string) => string;

    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: Locale;
};

const LocaleContext = createContext<LocaleContextProps>({
    translate: () => '',
    numberFormat: () => '',
    datetimeToRelative: () => '',
    datetimeToCalendarTime: () => '',
    updateLocale: () => '',
    formatPhoneNumber: () => '',
    toLocaleDigit: () => '',
    fromLocaleDigit: () => '',
    preferredLocale: CONST.LOCALES.DEFAULT,
});

function LocaleContextProvider({preferredLocale, currentUserPersonalDetails = {}, children}: LocaleContextProviderProps) {
    const locale = preferredLocale ?? CONST.LOCALES.DEFAULT;

    const selectedTimezone = useMemo(() => currentUserPersonalDetails?.timezone?.selected, [currentUserPersonalDetails]);

    const translate = useMemo<LocaleContextProps['translate']>(
        () =>
            (phraseKey, ...phraseParameters) =>
                Localize.translate(locale, phraseKey, ...phraseParameters),
        [locale],
    );

    const numberFormat = useMemo<LocaleContextProps['numberFormat']>(() => (number, options) => NumberFormatUtils.format(locale, number, options), [locale]);

    const datetimeToRelative = useMemo<LocaleContextProps['datetimeToRelative']>(() => (datetime) => DateUtils.datetimeToRelative(locale, datetime), [locale]);

    const datetimeToCalendarTime = useMemo<LocaleContextProps['datetimeToCalendarTime']>(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(locale, datetime, includeTimezone, selectedTimezone, isLowercase),
        [locale, selectedTimezone],
    );

    const updateLocale = useMemo<LocaleContextProps['updateLocale']>(() => () => DateUtils.setLocale(locale), [locale]);

    const formatPhoneNumber = useMemo<LocaleContextProps['formatPhoneNumber']>(() => (phoneNumber) => LocalePhoneNumber.formatPhoneNumber(phoneNumber), []);

    const toLocaleDigit = useMemo<LocaleContextProps['toLocaleDigit']>(() => (digit) => LocaleDigitUtils.toLocaleDigit(locale, digit), [locale]);

    const fromLocaleDigit = useMemo<LocaleContextProps['fromLocaleDigit']>(() => (localeDigit) => LocaleDigitUtils.fromLocaleDigit(locale, localeDigit), [locale]);

    const contextValue = useMemo<LocaleContextProps>(
        () => ({
            translate,
            numberFormat,
            datetimeToRelative,
            datetimeToCalendarTime,
            updateLocale,
            formatPhoneNumber,
            toLocaleDigit,
            fromLocaleDigit,
            preferredLocale: locale,
        }),
        [translate, numberFormat, datetimeToRelative, datetimeToCalendarTime, updateLocale, formatPhoneNumber, toLocaleDigit, fromLocaleDigit, locale],
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

const Provider = compose(
    withOnyx<LocaleContextProviderProps, LocaleContextProviderOnyxProps>({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            selector: (preferredLocale) => preferredLocale,
        },
    }),
    withCurrentUserPersonalDetails,
)(LocaleContextProvider);

Provider.displayName = 'withOnyx(LocaleContextProvider)';

export {Provider as LocaleContextProvider, LocaleContext};

export type {LocaleContextProps};
