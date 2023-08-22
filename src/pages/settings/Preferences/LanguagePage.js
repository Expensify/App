import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import SelectionList from '../../../components/SelectionList';

const propTypes = {
    ...withLocalizePropTypes,

    /** The preferred language of the App */
    preferredLocale: PropTypes.string.isRequired,
};

function LanguagePage(props) {
    const localesToLanguages = _.map(props.translate('languagePage.languages'), (language, key) => ({
        value: key,
        text: language.label,
        keyForList: key,
        isSelected: props.preferredLocale === key,
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('languagePage.language')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PREFERENCES)}
            />
            <SelectionList
                sections={[{data: localesToLanguages}]}
                onSelectRow={(language) => App.setLocaleAndNavigate(language.value)}
                initiallyFocusedOptionKey={_.find(localesToLanguages, (locale) => locale.isSelected).keyForList}
            />
        </ScreenWrapper>
    );
}

LanguagePage.displayName = 'LanguagePage';
LanguagePage.propTypes = propTypes;

export default withLocalize(LanguagePage);
