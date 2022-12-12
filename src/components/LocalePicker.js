import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import * as App from '../libs/actions/App';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import Permissions from '../libs/Permissions';
import * as Localize from '../libs/Localize/Localize';
import Picker from './Picker';

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
        label: Localize.translate('en', 'preferencesPage.languages.english'),
    },
    es: {
        value: 'es',
        label: Localize.translate('es', 'preferencesPage.languages.spanish'),
    },
};

const LocalePicker = (props) => {
    if (!Permissions.canUseInternationalization(props.betas)) {
        return null;
    }

    return (
        <Picker
            label={props.size === 'normal' ? props.translate('preferencesPage.language') : null}
            onInputChange={(locale) => {
                if (locale === props.preferredLocale) {
                    return;
                }

                App.setLocale(locale);
            }}
            items={_.values(localesToLanguages)}
            size={props.size}
            value={props.preferredLocale}
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
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(LocalePicker);
