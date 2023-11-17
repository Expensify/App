import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Switch from '@components/Switch';
import TestToolMenu from '@components/TestToolMenu';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isSubscribedToNewsletter: PropTypes.bool,
    }),
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
};

function PreferencesPage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
    const {translate, preferredLocale} = useLocalize();

    return (
        <IllustratedHeaderPageLayout
            title={translate('common.preferences')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
            illustration={LottieAnimations.PreferencesDJ}
        >
            <View style={styles.mb6}>
                <Text
                    style={[styles.textLabelSupporting, styles.mb2, styles.ml5, styles.mr8]}
                    numberOfLines={1}
                >
                    {translate('common.notifications')}
                </Text>
                <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.ml5, styles.mr8]}>
                    <View style={styles.flex4}>
                        <Text>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text>
                    </View>
                    <View style={[styles.flex1, styles.alignItemsEnd]}>
                        <Switch
                            accessibilityLabel={translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                            isOn={lodashGet(props.user, 'isSubscribedToNewsletter', true)}
                            onToggle={User.updateNewsletterSubscription}
                        />
                    </View>
                </View>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={translate(`priorityModePage.priorityModes.${props.priorityMode}.label`)}
                    description={translate('priorityModePage.priorityMode')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIORITY_MODE)}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={translate(`languagePage.languages.${preferredLocale}.label`)}
                    description={translate('languagePage.language')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_LANGUAGE)}
                />
                {/* Enable additional test features in non-production environments */}
                {!isProduction && (
                    <View style={[styles.ml5, styles.mr8, styles.mt6]}>
                        <TestToolMenu />
                    </View>
                )}
            </View>
        </IllustratedHeaderPageLayout>
    );
}

PreferencesPage.propTypes = propTypes;
PreferencesPage.defaultProps = defaultProps;
PreferencesPage.displayName = 'PreferencesPage';

export default withOnyx({
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(PreferencesPage);
