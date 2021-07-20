import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
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

const withLocalizeHOC = (WrappedComponent) => {
    class WithLocalize extends React.Component {
        constructor(props) {
            super(props);

            this.translate = this.translate.bind(this);
            this.numberFormat = this.numberFormat.bind(this);
            this.timestampToRelative = this.timestampToRelative.bind(this);
            this.timestampToDateTime = this.timestampToDateTime.bind(this);
            this.fromLocalPhone = this.fromLocalPhone.bind(this);
            this.toLocalPhone = this.toLocalPhone.bind(this);
            this.preferredLocale = 'en';
        }

        translate(phrase, variables) {
            return translate(this.preferredLocale, phrase, variables);
        }

        numberFormat(number, options) {
            return numberFormat(this.preferredLocale, number, options);
        }

        timestampToRelative(timestamp) {
            return DateUtils.timestampToRelative(this.preferredLocale, timestamp);
        }

        timestampToDateTime(timestamp, includeTimezone) {
            return DateUtils.timestampToDateTime(
                this.preferredLocale,
                timestamp,
                includeTimezone,
            );
        }

        toLocalPhone(number) {
            return toLocalPhone(this.preferredLocale, number);
        }

        fromLocalPhone(number) {
            return fromLocalPhone(this.preferredLocale, number);
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    ref={this.props.forwardedRef}
                    translate={this.translate}
                    numberFormat={this.numberFormat}
                    timestampToRelative={this.timestampToRelative}
                    timestampToDateTime={this.timestampToDateTime}
                    toLocalPhone={this.toLocalPhone}
                    fromLocalPhone={this.fromLocalPhone}
                />
            );
        }
    }

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

    const withForwardedRef = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithLocalize {...props} forwardedRef={ref} />
    ));

    withForwardedRef.displayName = `WithLocalize(${getComponentDisplayName(WrappedComponent)})`;
    return withForwardedRef;
};

export default withLocalizeHOC;

export {
    withLocalizePropTypes,
};
