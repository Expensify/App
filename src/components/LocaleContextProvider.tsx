import {format as formatDate} from 'date-fns';
import React, {createContext, useEffect, useMemo, useState} from 'react';
import {importEmojiLocale} from '@assets/emojis';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import DateUtils from '@libs/DateUtils';
import {buildEmojisTrie} from '@libs/EmojiTrie';
import {fromLocaleDigit as fromLocaleDigitLocaleDigitUtils, toLocaleDigit as toLocaleDigitLocaleDigitUtils, toLocaleOrdinal as toLocaleOrdinalLocaleDigitUtils} from '@libs/LocaleDigitUtils';
import {formatPhoneNumberWithCountryCode} from '@libs/LocalePhoneNumber';
import {getDevicePreferredLocale, translate as translateLocalize} from '@libs/Localize';
import {format} from '@libs/NumberFormatUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {setLocale} from '@userActions/App';
import CONST from '@src/CONST';
import {isFullySupportedLocale, isSupportedLocale} from '@src/CONST/LOCALES';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

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

    /** This is a wrapper around the localeCompare function that uses the preferred locale from the user's settings. */
    localeCompare: (a: string, b: string) => number;

    /** Formats travel dates using transport date formatting (no timezone conversion, matches Trip Summary) */
    formatTravelDate: (datetime: string) => string;

    /** The user's preferred locale e.g. 'en', 'es' */
    preferredLocale: Locale | undefined;
};

type LocalizedTranslate = LocaleContextProps['translate'];

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
    localeCompare: () => 0,
    formatTravelDate: () => '',
    preferredLocale: undefined,
});

const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'};

function LocaleContextProvider({children}: LocaleContextProviderProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [areTranslationsLoading = true] = useOnyx(ONYXKEYS.ARE_TRANSLATIONS_LOADING, {initWithStoredValues: false, canBeMissing: true});
    const [countryCodeByIP = 1] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: true});
    const [nvpPreferredLocale, nvpPreferredLocaleMetadata] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const [currentLocale, setCurrentLocale] = useState<Locale | undefined>(() => IntlStore.getCurrentLocale());

    const localeToApply = useMemo(() => {
        if (isLoadingOnyxValue(nvpPreferredLocaleMetadata)) {
            return undefined;
        }
        if (nvpPreferredLocale && isSupportedLocale(nvpPreferredLocale)) {
            return nvpPreferredLocale;
        }

        const deviceLocale = getDevicePreferredLocale();
        return isSupportedLocale(deviceLocale) ? deviceLocale : CONST.LOCALES.DEFAULT;
    }, [nvpPreferredLocale, nvpPreferredLocaleMetadata]);

    if (localeToApply) {
        IntlStore.load(localeToApply);
    }

    useEffect(() => {
        if (!localeToApply) {
            return;
        }

        setLocale(localeToApply, nvpPreferredLocale);

        // For locales without emoji support, fallback on English
        const normalizedLocale = isFullySupportedLocale(localeToApply) ? localeToApply : CONST.LOCALES.DEFAULT;
        importEmojiLocale(normalizedLocale).then(() => {
            buildEmojisTrie(normalizedLocale);
        });
    }, [localeToApply, nvpPreferredLocale]);

    useEffect(() => {
        if (areTranslationsLoading) {
            return;
        }

        const locale = IntlStore.getCurrentLocale();
        if (!locale) {
            return;
        }

        setCurrentLocale(locale);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE);
    }, [areTranslationsLoading]);

    const selectedTimezone = useMemo(() => currentUserPersonalDetails?.timezone?.selected, [currentUserPersonalDetails?.timezone?.selected]);

    const collator = useMemo(() => new Intl.Collator(currentLocale, COLLATOR_OPTIONS), [currentLocale]);

    const translate = useMemo<LocaleContextProps['translate']>(
        () =>
            (path, ...parameters) =>
                translateLocalize(currentLocale, path, ...parameters),
        [currentLocale],
    );

    const numberFormat = useMemo<LocaleContextProps['numberFormat']>(() => (number, options) => format(currentLocale, number, options), [currentLocale]);

    const getLocalDateFromDatetime = useMemo<LocaleContextProps['getLocalDateFromDatetime']>(
        () => (datetime, currentSelectedTimezone) =>
            DateUtils.getLocalDateFromDatetime(currentLocale, currentSelectedTimezone ?? selectedTimezone ?? CONST.DEFAULT_TIME_ZONE.selected, datetime),
        [currentLocale, selectedTimezone],
    );

    const datetimeToRelative = useMemo<LocaleContextProps['datetimeToRelative']>(
        () => (datetime) => DateUtils.datetimeToRelative(currentLocale, datetime, selectedTimezone ?? CONST.DEFAULT_TIME_ZONE.selected),
        [currentLocale, selectedTimezone],
    );

    const datetimeToCalendarTime = useMemo<LocaleContextProps['datetimeToCalendarTime']>(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(currentLocale, datetime, selectedTimezone ?? CONST.DEFAULT_TIME_ZONE.selected, includeTimezone, isLowercase),
        [currentLocale, selectedTimezone],
    );

    const formatPhoneNumber = useMemo<LocaleContextProps['formatPhoneNumber']>(() => (phoneNumber) => formatPhoneNumberWithCountryCode(phoneNumber, countryCodeByIP), [countryCodeByIP]);

    const toLocaleDigit = useMemo<LocaleContextProps['toLocaleDigit']>(() => (digit) => toLocaleDigitLocaleDigitUtils(currentLocale, digit), [currentLocale]);

    const toLocaleOrdinal = useMemo<LocaleContextProps['toLocaleOrdinal']>(
        () =>
            (number, writtenOrdinals = false) =>
                toLocaleOrdinalLocaleDigitUtils(currentLocale, number, writtenOrdinals),
        [currentLocale],
    );

    const fromLocaleDigit = useMemo<LocaleContextProps['fromLocaleDigit']>(() => (localeDigit) => fromLocaleDigitLocaleDigitUtils(currentLocale, localeDigit), [currentLocale]);

    const localeCompare = useMemo<LocaleContextProps['localeCompare']>(() => (a, b) => collator.compare(a, b), [collator]);

    const formatTravelDate = useMemo<LocaleContextProps['formatTravelDate']>(
        () => (datetime) => {
            const date = new Date(datetime);
            const formattedDate = formatDate(date, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
            const formattedHour = formatDate(date, CONST.DATE.LOCAL_TIME_FORMAT);
            const at = translateLocalize(currentLocale, 'common.conjunctionAt');
            return `${formattedDate} ${at} ${formattedHour}`;
        },
        [currentLocale],
    );

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
            localeCompare,
            formatTravelDate,
            preferredLocale: currentLocale,
        }),
        [
            translate,
            numberFormat,
            getLocalDateFromDatetime,
            datetimeToRelative,
            datetimeToCalendarTime,
            formatPhoneNumber,
            toLocaleDigit,
            toLocaleOrdinal,
            fromLocaleDigit,
            localeCompare,
            formatTravelDate,
            currentLocale,
        ],
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

export {LocaleContext, LocaleContextProvider};

export type {Locale, LocaleContextProps, LocalizedTranslate};
