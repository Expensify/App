import React, {createContext, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import DateUtils from '@libs/DateUtils';
import {fromLocaleDigit as fromLocaleDigitLocaleDigitUtils, toLocaleDigit as toLocaleDigitLocaleDigitUtils, toLocaleOrdinal as toLocaleOrdinalLocaleDigitUtils} from '@libs/LocaleDigitUtils';
import {formatPhoneNumber as formatPhoneNumberLocalePhoneNumber} from '@libs/LocalePhoneNumber';
import {translate as translateLocalize} from '@libs/Localize';
import {format} from '@libs/NumberFormatUtils';
import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

type Locale = ValueOf<typeof CONST.LOCALES>;

type LocaleContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

type LocaleContextProps = {
    /** Returns translated string for given locale and phrase */
    translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => string;

    /** Formats number formatted according to locale and options */
    numberFormat: (number: number, options?: Intl.NumberFormatOptions) => string;

    /** Converts a datetime into a local date object */
    getLocalDateFromDatetime: (datetime?: string, currentSelectedTimezone?: SelectedTimezone) => Date;

    /** Converts a datetime into a localized string representation that's relative to current moment in time */
    datetimeToRelative: (datetime: string) => string;

    /** Formats a datetime to local date and time string */
    datetimeToCalendarTime: (datetime: string, includeTimezone: boolean, isLowercase?: boolean) => string;

    /** Updates date-fns internal locale */
    updateLocale: () => void;

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: (phoneNumber: string) => string;

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: (digit: string) => string;

    /** Formats a number into its localized ordinal representation */
    toLocaleOrdinal: (number: number, returnWords?: boolean) => string;

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: (digit: string) => string;

    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: Locale;
};

const LocaleContext = createContext<LocaleContextProps>({
    translate: () => '',
    numberFormat: () => '',
    getLocalDateFromDatetime: () => new Date(),
    datetimeToRelative: () => '',
    datetimeToCalendarTime: () => '',
    updateLocale: () => '',
    formatPhoneNumber: () => '',
    toLocaleDigit: () => '',
    toLocaleOrdinal: () => '',
    fromLocaleDigit: () => '',
    preferredLocale: CONST.LOCALES.DEFAULT,
});

function LocaleContextProvider({children}: LocaleContextProviderProps) {
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const locale = preferredLocale ?? CONST.LOCALES.DEFAULT;

    const selectedTimezone = useMemo(() => currentUserPersonalDetails?.timezone?.selected, [currentUserPersonalDetails]);

    const translate = useMemo<LocaleContextProps['translate']>(
        () =>
            (path, ...parameters) =>
                translateLocalize(locale, path, ...parameters),
        [locale],
    );

    const numberFormat = useMemo<LocaleContextProps['numberFormat']>(() => (number, options) => format(locale, number, options), [locale]);

    const getLocalDateFromDatetime = useMemo<LocaleContextProps['getLocalDateFromDatetime']>(
        () => (datetime, currentSelectedTimezone) => DateUtils.getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone ?? selectedTimezone),
        [locale, selectedTimezone],
    );

    const datetimeToRelative = useMemo<LocaleContextProps['datetimeToRelative']>(() => (datetime) => DateUtils.datetimeToRelative(locale, datetime), [locale]);

    const datetimeToCalendarTime = useMemo<LocaleContextProps['datetimeToCalendarTime']>(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(locale, datetime, includeTimezone, selectedTimezone, isLowercase),
        [locale, selectedTimezone],
    );

    const updateLocale = useMemo<LocaleContextProps['updateLocale']>(() => () => DateUtils.setLocale(locale), [locale]);

    const formatPhoneNumber = useMemo<LocaleContextProps['formatPhoneNumber']>(() => (phoneNumber) => formatPhoneNumberLocalePhoneNumber(phoneNumber), []);

    const toLocaleDigit = useMemo<LocaleContextProps['toLocaleDigit']>(() => (digit) => toLocaleDigitLocaleDigitUtils(locale, digit), [locale]);

    const toLocaleOrdinal = useMemo<LocaleContextProps['toLocaleOrdinal']>(
        () =>
            (number, writtenOrdinals = false) =>
                toLocaleOrdinalLocaleDigitUtils(locale, number, writtenOrdinals),
        [locale],
    );

    const fromLocaleDigit = useMemo<LocaleContextProps['fromLocaleDigit']>(() => (localeDigit) => fromLocaleDigitLocaleDigitUtils(locale, localeDigit), [locale]);

    const contextValue = useMemo<LocaleContextProps>(
        () => ({
            translate,
            numberFormat,
            getLocalDateFromDatetime,
            datetimeToRelative,
            datetimeToCalendarTime,
            updateLocale,
            formatPhoneNumber,
            toLocaleDigit,
            toLocaleOrdinal,
            fromLocaleDigit,
            preferredLocale: locale,
        }),
        [
            translate,
            numberFormat,
            getLocalDateFromDatetime,
            datetimeToRelative,
            datetimeToCalendarTime,
            updateLocale,
            formatPhoneNumber,
            toLocaleDigit,
            toLocaleOrdinal,
            fromLocaleDigit,
            locale,
        ],
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

LocaleContextProvider.displayName = 'LocaleContextProvider';

export {LocaleContext, LocaleContextProvider};

export type {Locale, LocaleContextProps};
