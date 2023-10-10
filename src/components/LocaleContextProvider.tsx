import React, {createContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from '../libs/Localize';
import DateUtils from '../libs/DateUtils';
import * as NumberFormatUtils from '../libs/NumberFormatUtils';
import * as LocaleDigitUtils from '../libs/LocaleDigitUtils';
import CONST from '../CONST';
import compose from '../libs/compose';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';
import * as LocalePhoneNumber from '../libs/LocalePhoneNumber';

type SelectedTimezone = {
    /** Value of the selected timezone */
    selected: string;
};

type CurrentUserPersonalDetails = {
    /** Timezone of the current user */
    timezone?: SelectedTimezone;
};

type LocaleContextProviderProps = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: string;

    /** The current user's personalDetails */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

type Translate = (phrase: string, variables: Record<string, string>) => string;

type NumberFormat = (number: number, options: Intl.NumberFormatOptions) => string;

type DatetimeToRelative = (datetime: string) => string;

type DatetimeToCalendarTime = (datetime: string, includeTimezone: boolean, isLowercase: boolean) => string;

type UpdateLocale = () => void;

type FormatPhoneNumber = (phoneNumber: string) => string;

type ToLocaleDigit = (digit: string) => string;

type FromLocaleDigit = (digit: string) => string;

type LocaleContextProps = {
    translate: Translate;
    numberFormat: NumberFormat;
    datetimeToRelative: DatetimeToRelative;
    datetimeToCalendarTime: DatetimeToCalendarTime;
    updateLocale: UpdateLocale;
    formatPhoneNumber: FormatPhoneNumber;
    toLocaleDigit: ToLocaleDigit;
    fromLocaleDigit: FromLocaleDigit;
    preferredLocale: string;
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
    preferredLocale: '',
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
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            selector: (preferredLocale) => preferredLocale,
        },
    }),
)(LocaleContextProvider);

export {Provider as LocaleContextProvider, LocaleContext};

export type { LocaleContextProps };
