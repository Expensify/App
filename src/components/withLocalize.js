import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import {translate} from '../libs/translate';
import DateUtils from '../libs/DateUtils';
import {toLocalPhone, fromLocalPhone} from '../libs/LocalePhoneNumber';
import numberFormat from '../libs/numberFormat';
import CONST from '../CONST';

const withLocalizePropTypes = {
    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,

    /** Formats number formatted according to locale and options */
    numberFormat: PropTypes.func.isRequired,

    /** Converts a timestamp into a localized string representation that's relative to current moment in time */
    timestampToRelative: PropTypes.func.isRequired,

    /** Formats a timestamp to local date and time string */
    timestampToDateTime: PropTypes.func.isRequired,

    /** Returns a locally converted phone number without the country code */
    toLocalPhone: PropTypes.func.isRequired,

    /** Returns an internationally converted phone number with the country code */
    fromLocalPhone: PropTypes.func.isRequired,
};

function withLocalizeHOC(WrappedComponent) {
    const WithLocalize = (props) => {
        const translations = {
            translate: (phrase, variables) => translate(props.preferredLocale, phrase, variables),
            numberFormat: (number, options) => numberFormat(props.preferredLocale, number, options),
            timestampToRelative: timestamp => DateUtils.timestampToRelative(props.preferredLocale, timestamp),
            timestampToDateTime: (timestamp, includeTimezone) => DateUtils.timestampToDateTime(
                props.preferredLocale,
                timestamp,
                includeTimezone,
            ),
            toLocalPhone: number => toLocalPhone(props.preferredLocale, number),
            fromLocalPhone: number => fromLocalPhone(props.preferredLocale, number),
        };
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                translate={translations.translate}
                numberFormat={translations.numberFormat}
                timestampToRelative={translations.timestampToRelative}
                timestampToDateTime={translations.timestampToDateTime}
                toLocalPhone={translations.toLocalPhone}
                fromLocalPhone={translations.fromLocalPhone}
            />
        );
    };
    WithLocalize.displayName = `WithLocalize(${getComponentDisplayName(WrappedComponent)})`;
    WithLocalize.propTypes = {
        preferredLocale: PropTypes.string,
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithLocalize.defaultProps = {
        preferredLocale: CONST.DEFAULT_LOCALE,
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithLocalize {...props} forwardedRef={ref} />
    ));
}
export default compose(
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
    withLocalizeHOC,
);

export {
    withLocalizePropTypes,
};
