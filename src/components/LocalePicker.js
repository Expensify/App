import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Picker from './Picker';
import Text from './Text';
import compose from '../libs/compose';
import {setLocale} from '../libs/actions/App';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import Permissions from '../libs/Permissions';
import {translate} from '../libs/translate';

const propTypes = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** Indicates size of a picker component and whether to render the label or not */
    size: PropTypes.oneOf(['normal', 'small']),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredLocale: CONST.DEFAULT_LOCALE,
    size: 'normal',
    betas: [],
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
    preferredLocale, translate, betas, size,
}) => {
    if (!Permissions.canUseInternationalization(betas)) {
        return null;
    }

    return (
        <>
            {size === 'normal' && (
            <Text style={[styles.formLabel]} numberOfLines={1}>
                {translate('preferencesPage.language')}
            </Text>
            )}
            <Picker
                onChange={(locale) => {
                    if (locale !== preferredLocale) {
                        setLocale(locale);
                    }
                }}
                items={Object.values(localesToLanguages)}
                size={size}
                value={preferredLocale}
            />
        </>
    );
};

LocalePicker.defaultProps = defaultProps;
LocalePicker.propTypes = propTypes;
LocalePicker.displayName = 'LocalePicker';

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(LocalePicker);
