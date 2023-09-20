import React, {createContext} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';

import ONYXKEYS from '../ONYXKEYS';
import * as Localize from '../libs/Localize';
import DateUtils from '../libs/DateUtils';
import * as NumberFormatUtils from '../libs/NumberFormatUtils';
import * as LocaleDigitUtils from '../libs/LocaleDigitUtils';
import CONST from '../CONST';
import compose from '../libs/compose';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';
import * as LocalePhoneNumber from '../libs/LocalePhoneNumber';

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

const LocaleContextProvider = React.memo(
    ({children, currentUserPersonalDetails, preferredLocale}) => {
        const selectedTimezone = lodashGet(currentUserPersonalDetails, 'timezone.selected');

        /**
         * @param {String} phrase
         * @param {Object} [variables]
         * @returns {String}
         */
        const translate = (phrase, variables) => Localize.translate(preferredLocale, phrase, variables);

        /**
         * @param {Number} number
         * @param {Intl.NumberFormatOptions} options
         * @returns {String}
         */
        const numberFormat = (number, options) => NumberFormatUtils.format(preferredLocale, number, options);

        /**
         * @param {String} datetime
         * @returns {String}
         */
        const datetimeToRelative = (datetime) => DateUtils.datetimeToRelative(preferredLocale, datetime);

        /**
         * @param {String} datetime - ISO-formatted datetime string
         * @param {Boolean} [includeTimezone]
         * @param {Boolean} isLowercase
         * @returns {String}
         */
        const datetimeToCalendarTime = (datetime, includeTimezone, isLowercase = false) =>
            DateUtils.datetimeToCalendarTime(preferredLocale, datetime, includeTimezone, selectedTimezone, isLowercase);

        /**
         * @param {String} phoneNumber
         * @returns {String}
         */
        const formatPhoneNumber = (phoneNumber) => LocalePhoneNumber.formatPhoneNumber(phoneNumber);

        /**
         * @param {String} digit
         * @returns {String}
         */
        const toLocaleDigit = (digit) => LocaleDigitUtils.toLocaleDigit(preferredLocale, digit);

        /**
         * @param {String} localeDigit
         * @returns {String}
         */
        const fromLocaleDigit = (localeDigit) => LocaleDigitUtils.fromLocaleDigit(preferredLocale, localeDigit);

        /**
         * The context this component exposes to child components
         * @returns {object} translation util functions and locale
         */
        const getContextValue = () => ({
            translate,
            numberFormat,
            datetimeToRelative,
            datetimeToCalendarTime,
            formatPhoneNumber,
            toLocaleDigit,
            fromLocaleDigit,
            preferredLocale,
        });

        return <LocaleContext.Provider value={getContextValue()}>{children}</LocaleContext.Provider>;
    },
    (prevProps, nextProps) =>
        nextProps.preferredLocale === prevProps.preferredLocale &&
        lodashGet(nextProps, 'currentUserPersonalDetails.timezone.selected') === lodashGet(prevProps, 'currentUserPersonalDetails.timezone.selected'),
);

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
