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

export default (WrappedComponent) => {
    const propTypes = {
        /** The user's preferred locale e.g. 'en', 'es-ES' */
        preferredLocale: PropTypes.string,

        /** Passed ref from whatever component is wrapped in the HOC */
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };

    const defaultProps = {
        preferredLocale: CONST.DEFAULT_LOCALE,
        forwardedRef: undefined,
    };

    class WithLocalize extends React.Component {
        constructor(props) {
            super(props);

            this.translate = this.translate.bind(this);
            this.numberFormat = this.numberFormat.bind(this);
            this.timestampToRelative = this.timestampToRelative.bind(this);
            this.timestampToDateTime = this.timestampToDateTime.bind(this);
            this.fromLocalPhone = this.fromLocalPhone.bind(this);
            this.toLocalPhone = this.toLocalPhone.bind(this);
        }

        /**
         * @param {String} phrase
         * @param {Object} [variables]
         * @returns {String}
         */
        translate(phrase, variables) {
            return translate(this.props.preferredLocale, phrase, variables);
        }

        /**
         * @param {Number} number
         * @param {Intl.NumberFormatOptions} options
         * @returns {String}
         */
        numberFormat(number, options) {
            return numberFormat(this.props.preferredLocale, number, options);
        }

        /**
         * @param {Number} timestamp
         * @returns {String}
         */
        timestampToRelative(timestamp) {
            return DateUtils.timestampToRelative(this.props.preferredLocale, timestamp);
        }

        /**
         * @param {Number} timestamp
         * @param {Boolean} [includeTimezone]
         * @returns {String}
         */
        timestampToDateTime(timestamp, includeTimezone) {
            return DateUtils.timestampToDateTime(
                this.props.preferredLocale,
                timestamp,
                includeTimezone,
            );
        }

        /**
         * @param {Number} number
         * @returns {String}
         */
        toLocalPhone(number) {
            return toLocalPhone(this.props.preferredLocale, number);
        }

        /**
         * @param {Number} number
         * @returns {String}
         */
        fromLocalPhone(number) {
            return fromLocalPhone(this.props.preferredLocale, number);
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

    WithLocalize.propTypes = propTypes;
    WithLocalize.defaultProps = defaultProps;

    const withForwardedRef = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithLocalize {...props} forwardedRef={ref} />
    ));

    withForwardedRef.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;

    return withOnyx({
        preferredLocale: {
            key: ONYXKEYS.PREFERRED_LOCALE,
        },
    })(withForwardedRef);
};

export {
    withLocalizePropTypes,
};
