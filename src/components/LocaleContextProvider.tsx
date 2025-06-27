import React, {createContext, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import DateUtils from '@libs/DateUtils';
import {fromLocaleDigit as fromLocaleDigitLocaleDigitUtils, toLocaleDigit as toLocaleDigitLocaleDigitUtils, toLocaleOrdinal as toLocaleOrdinalLocaleDigitUtils} from '@libs/LocaleDigitUtils';
import {formatPhoneNumber as formatPhoneNumberLocalePhoneNumber} from '@libs/LocalePhoneNumber';
import {translate as translateLocalize} from '@libs/Localize';
import {format} from '@libs/NumberFormatUtils';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

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

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: (phoneNumber: string) => string;

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: (digit: string) => string;

    /** Formats a number into its localized ordinal representation */
    toLocaleOrdinal: (number: number, returnWords?: boolean) => string;

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: (digit: string) => string;

    /** The user's preferred locale e.g. 'en', 'es' */
    preferredLocale: Locale | undefined;
};

const LocaleContext = createContext<LocaleContextProps>({
    translate: () => '',
    numberFormat: () => '',
    getLocalDateFromDatetime: () => new Date(),
    datetimeToRelative: () => '',
    datetimeToCalendarTime: () => '',
    formatPhoneNumber: () => '',
    toLocaleDigit: () => '',
    toLocaleOrdinal: () => '',
    fromLocaleDigit: () => '',
    preferredLocale: undefined,
});

function LocaleContextProvider({children}: LocaleContextProviderProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [areTranslationsLoading = true] = useOnyx(ONYXKEYS.ARE_TRANSLATIONS_LOADING, {initWithStoredValues: false, canBeMissing: true});
    const [currentLocale, setCurrentLocale] = useState<Locale | undefined>(() => IntlStore.getCurrentLocale());

    useEffect(() => {
        if (areTranslationsLoading) {
            return;
        }

        const locale = IntlStore.getCurrentLocale();
        if (!locale) {
            return;
        }

        setCurrentLocale(locale);
    }, [areTranslationsLoading]);

    const selectedTimezone = useMemo(() => currentUserPersonalDetails?.timezone?.selected, [currentUserPersonalDetails]);

    const translate = useMemo<LocaleContextProps['translate']>(
        () =>
            (path, ...parameters) =>
                translateLocalize(currentLocale, path, ...parameters),
        [currentLocale],
    );

    const numberFormat = useMemo<LocaleContextProps['numberFormat']>(() => (number, options) => format(currentLocale, number, options), [currentLocale]);

    const getLocalDateFromDatetime = useMemo<LocaleContextProps['getLocalDateFromDatetime']>(
        () => (datetime, currentSelectedTimezone) => DateUtils.getLocalDateFromDatetime(currentLocale, datetime, currentSelectedTimezone ?? selectedTimezone),
        [currentLocale, selectedTimezone],
    );

    const datetimeToRelative = useMemo<LocaleContextProps['datetimeToRelative']>(() => (datetime) => DateUtils.datetimeToRelative(currentLocale, datetime), [currentLocale]);

    const datetimeToCalendarTime = useMemo<LocaleContextProps['datetimeToCalendarTime']>(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(currentLocale, datetime, includeTimezone, selectedTimezone, isLowercase),
        [currentLocale, selectedTimezone],
    );

    const formatPhoneNumber = useMemo<LocaleContextProps['formatPhoneNumber']>(() => (phoneNumber) => formatPhoneNumberLocalePhoneNumber(phoneNumber), []);

    const toLocaleDigit = useMemo<LocaleContextProps['toLocaleDigit']>(() => (digit) => toLocaleDigitLocaleDigitUtils(currentLocale, digit), [currentLocale]);

    const toLocaleOrdinal = useMemo<LocaleContextProps['toLocaleOrdinal']>(
        () =>
            (number, writtenOrdinals = false) =>
                toLocaleOrdinalLocaleDigitUtils(currentLocale, number, writtenOrdinals),
        [currentLocale],
    );

    const fromLocaleDigit = useMemo<LocaleContextProps['fromLocaleDigit']>(() => (localeDigit) => fromLocaleDigitLocaleDigitUtils(currentLocale, localeDigit), [currentLocale]);

    const contextValue = useMemo<LocaleContextProps>(
        () => ({
            translate,
            numberFormat,
            getLocalDateFromDatetime,
            datetimeToRelative,
            datetimeToCalendarTime,
            formatPhoneNumber,
            toLocaleDigit,
            toLocaleOrdinal,
            fromLocaleDigit,
            preferredLocale: currentLocale,
        }),
        [translate, numberFormat, getLocalDateFromDatetime, datetimeToRelative, datetimeToCalendarTime, formatPhoneNumber, toLocaleDigit, toLocaleOrdinal, fromLocaleDigit, currentLocale],
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

LocaleContextProvider.displayName = 'LocaleContextProvider';

export {LocaleContext, LocaleContextProvider};

export type {Locale, LocaleContextProps};
