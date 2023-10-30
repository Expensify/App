import PropTypes from 'prop-types';
import React, {forwardRef} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import {LocaleContext} from './LocaleContextProvider';

const withLocalizePropTypes = {
    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,

    /** Formats number formatted according to locale and options */
    numberFormat: PropTypes.func.isRequired,

    /** Converts a datetime into a localized string representation that's relative to current moment in time */
    datetimeToRelative: PropTypes.func.isRequired,

    /** Formats a datetime to local date and time string */
    datetimeToCalendarTime: PropTypes.func.isRequired,

    /** Updates date-fns internal locale */
    updateLocale: PropTypes.func.isRequired,

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: PropTypes.func.isRequired,

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: PropTypes.func.isRequired,

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: PropTypes.func.isRequired,
};

export default function withLocalize(WrappedComponent) {
    const WithLocalize = forwardRef((props, ref) => (
        <LocaleContext.Consumer>
            {(translateUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...translateUtils}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </LocaleContext.Consumer>
    ));

    WithLocalize.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;

    return WithLocalize;
}

export {withLocalizePropTypes};
