import _, {compose} from 'underscore';
import React from 'react';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes, localeProviderPropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import OptionsList from '../../../components/OptionsList';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as App from '../../../libs/actions/App';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...localeProviderPropTypes,
};

const LanguagePage = (props) => {
    const localesToLanguages = _.map(
        [
            {
                value: 'en',
                text: props.translate('languagePage.languages.english'),
            },
            {
                value: 'es',
                text: props.translate('languagePage.languages.spanish'),
            },
        ], language => (
            {
                ...language,
                keyForList: language.value,

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: props.preferredLocale === language.value ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: props.preferredLocale === language.value,
            }
        ),
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('languagePage.language')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <OptionsList
                sections={[{data: localesToLanguages}]}
                onSelectRow={
                    (language) => {
                        if (language.value !== props.preferredLocale) {
                            App.setLocale(language.value);
                        }
                        Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
                    }
                }
                hideSectionHeaders
                optionHoveredStyle={
                    {
                        ...styles.hoveredComponentBG,
                        ...styles.mln5,
                        ...styles.mrn5,
                        ...styles.pl5,
                        ...styles.pr5,
                    }
                }
                shouldHaveOptionSeparator
                disableRowInnerPadding
                contentContainerStyles={[styles.ph5]}
            />
        </ScreenWrapper>
    );
};

LanguagePage.displayName = 'LanguagePage';
LanguagePage.propTypes = propTypes;

export default compose(
    withLocalize,
)(LanguagePage);
