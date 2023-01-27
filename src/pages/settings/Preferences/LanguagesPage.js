import _ from 'underscore';
import {compose} from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';

import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import OptionsList from '../../../components/OptionsList';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as App from '../../../libs/actions/App';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
};

const LanguagesPage = (props) => {
    const localesToLanguages = _.map(
        [
            {
                value: 'en',
                text: props.translate('languagesPage.languages.english'),
            },
            {
                value: 'es',
                text: props.translate('languagesPage.languages.spanish'),
            },
        ], (language) => {
            return {
                ...language,
                keyForList: language.value,

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: props.preferredLocale === language.value ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: props.preferredLocale === language.value,
            };
        });

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('languagesPage.language')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <OptionsList
                sections={[{ data: localesToLanguages }]}
                onSelectRow={
                    (language) => {
                        if (language.value !== props.preferredLocale) {
                            App.setLocale(language.value);
                        }
                        Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
                    }
                }
                hideSectionHeaders
                optionHoveredStyle={{ ...styles.hoveredComponentBG, ...styles.mln5, ...styles.mrn5, ...styles.pl5, ...styles.pr5 }}
                shouldHaveOptionSeparator
                disableRowInnerPadding
                contentContainerStyles={[styles.ph5]}
            />
        </ScreenWrapper>
    );
};

LanguagesPage.displayName = 'LanguagesPage';
LanguagesPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LanguagesPage);
