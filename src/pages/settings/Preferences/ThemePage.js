import _ from 'underscore';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import OptionsList from '../../../components/OptionsList';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
// import * as App from '../../../libs/actions/App';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,

    /** The theme of the app */
    preferredTheme: PropTypes.string,
};

const defaultProps = {
    preferredTheme: CONST.DEFAULT_THEME,
};

function ThemePage(props) {
    const localesToThemes = _.map(props.translate('themePage.themes'), (theme, key) => ({
        value: key,
        text: theme.label,
        keyForList: key,

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: props.preferredTheme === key ? greenCheckmark : undefined,

        // This property will make the currently selected value have bold text
        boldStyle: props.preferredTheme === key,
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('themePage.theme')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.flex1, styles.mt3]}>
                <OptionsList
                    sections={[{data: localesToThemes}]}
                    // onSelectRow={(theme) => App.setThemeAndNavigate(theme.value)}
                    hideSectionHeaders
                    optionHoveredStyle={{
                        ...styles.hoveredComponentBG,
                        ...styles.mhn5,
                        ...styles.ph5,
                    }}
                    shouldHaveOptionSeparator
                    shouldDisableRowInnerPadding
                    contentContainerStyles={[styles.ph5]}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

ThemePage.displayName = 'ColorThemePage';
ThemePage.propTypes = propTypes;
ThemePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        preferredTheme: {
            key: ONYXKEYS.PREFERRED_THEME,
        },
    }),
)(ThemePage);
