import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {createContext, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import * as LocaleDigitUtils from '@libs/LocaleDigitUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import * as NumberFormatUtils from '@libs/NumberFormatUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';

const LocaleContext = createContext(null);

const localeProviderPropTypes = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: PropTypes.string,

    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,

    /** The current user's personalDetails */
    currentUserPersonalDetails: PropTypes.shape({
        /** Timezone of the current user */
        timezone: PropTypes.shape({
            /** Value of the selected timezone */
            selected: PropTypes.string,
        }),
    }),
};

const localeProviderDefaultProps = {
    preferredLocale: CONST.LOCALES.DEFAULT,
    currentUserPersonalDetails: {},
};

function LocaleContextProvider({children, currentUserPersonalDetails, preferredLocale}) {
    const selectedTimezone = useMemo(() => lodashGet(currentUserPersonalDetails, 'timezone.selected'), [currentUserPersonalDetails]);

    /**
     * @param {String} phrase
     * @param {Object} [variables]
     * @returns {String}
     */
    const translate = useMemo(() => (phrase, variables) => Localize.translate(preferredLocale, phrase, variables), [preferredLocale]);

    /**
     * @param {Number} number
     * @param {Intl.NumberFormatOptions} options
     * @returns {String}
     */
    const numberFormat = useMemo(() => (number, options) => NumberFormatUtils.format(preferredLocale, number, options), [preferredLocale]);

    /**
     * @param {String} datetime
     * @returns {String}
     */
    const datetimeToRelative = useMemo(() => (datetime) => DateUtils.datetimeToRelative(preferredLocale, datetime), [preferredLocale]);

    /**
     * @param {String} datetime - ISO-formatted datetime string
     * @param {Boolean} [includeTimezone]
     * @param {Boolean} isLowercase
     * @returns {String}
     */
    const datetimeToCalendarTime = useMemo(
        () =>
            (datetime, includeTimezone, isLowercase = false) =>
                DateUtils.datetimeToCalendarTime(preferredLocale, datetime, includeTimezone, selectedTimezone, isLowercase),
        [preferredLocale, selectedTimezone],
    );

    /**
     * Updates date-fns internal locale to the user preferredLocale
     */
    const updateLocale = useMemo(() => () => DateUtils.setLocale(preferredLocale), [preferredLocale]);

    /**
     * @param {String} phoneNumber
     * @returns {String}
     */
    const formatPhoneNumber = LocalePhoneNumber.formatPhoneNumber;

    /**
     * @param {String} digit
     * @returns {String}
     */
    const toLocaleDigit = useMemo(() => (digit) => LocaleDigitUtils.toLocaleDigit(preferredLocale, digit), [preferredLocale]);

    /**
     * @param {String} localeDigit
     * @returns {String}
     */
    const fromLocaleDigit = useMemo(() => (localeDigit) => LocaleDigitUtils.fromLocaleDigit(preferredLocale, localeDigit), [preferredLocale]);

    /**
     * The context this component exposes to child components
     * @returns {object} translation util functions and locale
     */
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

LocaleContextProvider.propTypes = localeProviderPropTypes;
LocaleContextProvider.defaultProps = localeProviderDefaultProps;

const Provider = compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LocaleContextProvider);

Provider.displayName = 'withOnyx(LocaleContextProvider)';

export {Provider as LocaleContextProvider, LocaleContext};
