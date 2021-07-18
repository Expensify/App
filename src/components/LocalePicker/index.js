import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Picker from '../Picker';
import compose from '../../libs/compose';
import {setLocale} from '../../libs/actions/App';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

const propTypes = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredLocale: CONST.DEFAULT_LOCALE,
};

const LocalePicker = ({preferredLocale, translate}) => {
    const localesToLanguages = {
        default: {
            value: 'en',
            label: translate('preferencesPage.languages.english'),
        },
        es: {
            value: 'es',
            label: translate('preferencesPage.languages.spanish'),
        },
    };

    return (
        <View style={[styles.mb2]}>
            <Picker
                onChange={(locale) => {
                    if (locale !== preferredLocale) {
                        setLocale(locale);
                    }
                }}
                items={Object.values(localesToLanguages)}
                value={preferredLocale}
            />
        </View>
    );
};


LocalePicker.defaultProps = defaultProps;
LocalePicker.propTypes = propTypes;
LocalePicker.displayName = 'LocalePicker';

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.PREFERRED_LOCALE,
        },
    }),
)(LocalePicker);
