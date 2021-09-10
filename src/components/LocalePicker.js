import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import {setLocale} from '../libs/actions/App';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import {translate} from '../libs/translate';
import ExpensiPicker from './ExpensiPicker';

const propTypes = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** Indicates size of a picker component and whether to render the label or not */
    size: PropTypes.oneOf(['normal', 'small']),

    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredLocale: CONST.DEFAULT_LOCALE,
    size: 'normal',
};

const localesToLanguages = {
    default: {
        value: 'en',
        label: translate('en', 'preferencesPage.languages.english'),
    },
    es: {
        value: 'es',
        label: translate('es', 'preferencesPage.languages.spanish'),
    },
};

const LocalePicker = ({
    // eslint-disable-next-line no-shadow
    preferredLocale, translate, size,
}) => (
    <ExpensiPicker
        label={size === 'normal' ? translate('preferencesPage.language') : null}
        onChange={(locale) => {
            if (locale !== preferredLocale) {
                setLocale(locale);
            }
        }}
        items={Object.values(localesToLanguages)}
        size={size}
        value={preferredLocale}
    />
);

LocalePicker.defaultProps = defaultProps;
LocalePicker.propTypes = propTypes;
LocalePicker.displayName = 'LocalePicker';

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LocalePicker);
