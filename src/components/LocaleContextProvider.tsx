import React, {createContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import * as LocaleDigitUtils from '@libs/LocaleDigitUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import * as NumberFormatUtils from '@libs/NumberFormatUtils';
import CONST from '@src/CONST';
import {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails} from '@src/types/onyx';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';

type CurrentUserPersonalDetails = Pick<PersonalDetails, 'timezone'>;

type LocaleContextProviderOnyxProps = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: ValueOf<typeof CONST.LOCALES>;
};

type LocaleContextProviderProps = LocaleContextProviderOnyxProps & {
    /** The current user's personalDetails */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

type PhraseParameters<T> = T extends (...args: infer A) => string ? A : never[];

type Phrase<TKey extends TranslationPaths> = TranslationFlatObject[TKey] extends (...args: infer A) => unknown ? (...args: A) => string : string;

type Translate = <TKey extends TranslationPaths>(phrase: TKey, variables?: PhraseParameters<Phrase<TKey>>) => string;

type NumberFormat = (number: number, options: Intl.NumberFormatOptions) => string;

type DatetimeToRelative = (datetime: string) => string;

type DatetimeToCalendarTime = (datetime: string, includeTimezone: boolean, isLowercase: boolean) => string;

type UpdateLocale = () => void;

type FormatPhoneNumber = (phoneNumber: string) => string;

type ToLocaleDigit = (digit: string) => string;

type FromLocaleDigit = (digit: string) => string;

type LocaleContextProps = {
    /** Returns translated string for given locale and phrase */
    translate: Translate;

    /** Formats number formatted according to locale and options */
    numberFormat: NumberFormat;

    /** Converts a datetime into a localized string representation that's relative to current moment in time */
    datetimeToRelative: DatetimeToRelative;

    /** Formats a datetime to local date and time string */
    datetimeToCalendarTime: DatetimeToCalendarTime;

    /** Updates date-fns internal locale */
    updateLocale: UpdateLocale;

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: FormatPhoneNumber;

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: ToLocaleDigit;

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: FromLocaleDigit;

    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: ValueOf<typeof CONST.LOCALES>;
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

function LocaleContextProvider({preferredLocale = CONST.LOCALES.DEFAULT, currentUserPersonalDetails = {}, children}: LocaleContextProviderProps) {
    const selectedTimezone = useMemo(() => currentUserPersonalDetails?.timezone?.selected, [currentUserPersonalDetails]);

    const translate = useMemo<Translate>(() => (phrase, variables) => Localize.translate(preferredLocale, phrase, variables), [preferredLocale]);

    const numberFormat = useMemo<NumberFormat>(() => (number, options) => NumberFormatUtils.format(preferredLocale, number, options), [preferredLocale]);

    const datetimeToRelative = useMemo<DatetimeToRelative>(() => (datetime) => DateUtils.datetimeToRelative(preferredLocale, datetime), [preferredLocale]);

    const datetimeToCalendarTime = useMemo<DatetimeToCalendarTime>(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(preferredLocale, datetime, includeTimezone, selectedTimezone, isLowercase),
        [preferredLocale, selectedTimezone],
    );

    const updateLocale = useMemo<UpdateLocale>(() => () => DateUtils.setLocale(preferredLocale), [preferredLocale]);

    const formatPhoneNumber = useMemo<FormatPhoneNumber>(() => (phoneNumber) => LocalePhoneNumber.formatPhoneNumber(phoneNumber), []);

    const toLocaleDigit = useMemo<ToLocaleDigit>(() => (digit) => LocaleDigitUtils.toLocaleDigit(preferredLocale, digit), [preferredLocale]);

    const fromLocaleDigit = useMemo<FromLocaleDigit>(() => (localeDigit) => LocaleDigitUtils.fromLocaleDigit(preferredLocale, localeDigit), [preferredLocale]);

    const contextValue = useMemo(
        () => ({
            translate,
            numberFormat,
            datetimeToRelative,
            datetimeToCalendarTime,
            updateLocale,
            formatPhoneNumber,
            toLocaleDigit,
            fromLocaleDigit,
            preferredLocale,
        }),
        [translate, numberFormat, datetimeToRelative, datetimeToCalendarTime, updateLocale, formatPhoneNumber, toLocaleDigit, fromLocaleDigit, preferredLocale],
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}
const Provider = compose(
    withCurrentUserPersonalDetails,
    withOnyx<LocaleContextProviderProps, LocaleContextProviderOnyxProps>({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            selector: (preferredLocale) => preferredLocale ?? CONST.LOCALES.DEFAULT,
        },
    }),
)(LocaleContextProvider);

Provider.displayName = 'withOnyx(LocaleContextProvider)';

export {Provider as LocaleContextProvider, LocaleContext};

export type {LocaleContextProps};
