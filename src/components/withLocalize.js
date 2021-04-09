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

const withLocalizePropTypes = {
    // Translations functions using current User's preferred locale
    translations: PropTypes.shape({
        translate: PropTypes.func.isRequired,
        numberFormat: PropTypes.func.isRequired,
        timestampToRelative: PropTypes.func.isRequired,
        timestampToDateTime: PropTypes.func.isRequired,
        toLocalPhone: PropTypes.func.isRequired,
        fromLocalPhone: PropTypes.func.isRequired,
    }),
};

function withLocalizeHOC(WrappedComponent) {
    const withLocalize = (props) => {
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
                translations={translations}
            />
        );
    };
    withLocalize.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;
    withLocalize.defaultProps = {
        preferredLocale: 'en',
    };
    return withLocalize;
}
export default compose(
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.PREFERRED_LOCALE,
        },
    }),
    withLocalizeHOC,
);

export {
    withLocalizePropTypes,
};
