import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import * as App from '../libs/actions/App';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import Picker from './Picker';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

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

const LocalePicker = (props) => {
    const localesToLanguages = _.map(
        props.translate('languagePage.languages'),
        (language, key) => ({
            value: key,
            label: language.label,
        }),
    );
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
            backgroundColor={themeColors.transparent}
        />
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
    }),
)(LocalePicker);
