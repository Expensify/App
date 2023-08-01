import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import Text from '../../../components/Text';
import CONST from '../../../CONST';
import * as User from '../../../libs/actions/User';
import Switch from '../../../components/Switch';
import TestToolMenu from '../../../components/TestToolMenu';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';
import SCREENS from '../../../SCREENS';
import useEnvironment from '../../../hooks/useEnvironment';
import useLocalize from '../../../hooks/useLocalize';

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
    const {isProduction} = useEnvironment();
    const {translate, preferredLocale} = useLocalize();

    const priorityModes = translate('priorityModePage.priorityModes');
    const languages = translate('languagePage.languages');

    return (
        <IllustratedHeaderPageLayout
            title={translate('common.preferences')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
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
                    title={priorityModes[props.priorityMode].label}
                    description={translate('priorityModePage.priorityMode')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIORITY_MODE)}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={languages[preferredLocale].label}
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
