import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Picker from './Picker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** Indicates size of a picker component and whether to render the label or not */
    size: PropTypes.oneOf(['normal', 'small']),

    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredLocale: CONST.LOCALES.DEFAULT,
    size: 'normal',
};

function LocalePicker(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const localesToLanguages = _.map(CONST.LANGUAGES, (language) => ({
        value: language,
        label: props.translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: props.preferredLocale === language,
    }));
    return (
        <Picker
            label={props.size === 'normal' ? props.translate('languagePage.language') : null}
            onInputChange={(locale) => {
                if (locale === props.preferredLocale) {
                    return;
                }

                App.setLocale(locale);
            }}
            items={localesToLanguages}
            size={props.size}
            value={props.preferredLocale}
            containerStyles={props.size === 'small' ? [styles.pickerContainerSmall] : []}
            backgroundColor={theme.signInPage}
        />
    );
}

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
