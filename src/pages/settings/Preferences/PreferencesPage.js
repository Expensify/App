import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import LocalePicker from '../../../components/LocalePicker';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CONST from '../../../CONST';
import * as User from '../../../libs/actions/User';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Switch from '../../../components/Switch';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import withEnvironment, {environmentPropTypes} from '../../../components/withEnvironment';
import TestToolMenu from '../../../components/TestToolMenu';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isSubscribedToNewsletter: PropTypes.bool,
        shouldUseStagingServer: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
    ...environmentPropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
};

const PreferencesPage = (props) => {
    const priorityModes = {
        default: {
            value: CONST.PRIORITY_MODE.DEFAULT,
            label: props.translate('priorityModesPage.mostRecent'),
        },
        gsd: {
            value: CONST.PRIORITY_MODE.GSD,
            label: props.translate('priorityModesPage.focus'),
        },
    };
    const localesToLanguages = {
        en: {
            value: 'en',
            label: props.translate('preferencesPage.languages.english'),
        },
        es: {
            value: 'es',
            label: props.translate('preferencesPage.languages.spanish'),
        },
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('common.preferences')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={styles.flex1}>
                <View style={styles.mb6}>
                    <Text style={[styles.textLabelSupporting, styles.mb2, styles.ml8, styles.mr8]} numberOfLines={1}>
                        {props.translate('common.notifications')}
                    </Text>
                    <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.ml8, styles.mr8]}>
                        <View style={styles.flex4}>
                            <Text>
                                {props.translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                            </Text>
                        </View>
                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            <Switch
                                isOn={lodashGet(props.user, 'isSubscribedToNewsletter', true)}
                                onToggle={User.updateNewsletterSubscription}
                            />
                        </View>
                    </View>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={priorityModes[props.priorityMode].label}
                        description={props.translate('priorityModesPage.priorityMode')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIORITY_MODES)}
                    />
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={localesToLanguages[props.preferredLocale].label}
                        description={props.translate('preferencesPage.language')}
                    // onPress={() => Navigation.navigate(detail.pageRoute)}
                    />

                    {/* If we are in the staging environment then we enable additional test features */
                        _.contains([CONST.ENVIRONMENT.STAGING, CONST.ENVIRONMENT.DEV], props.environment)
                        && <View style={[styles.ml8, styles.mr8]}>
                            <TestToolMenu />
                        </View>
                    }
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

PreferencesPage.propTypes = propTypes;
PreferencesPage.defaultProps = defaultProps;
PreferencesPage.displayName = 'PreferencesPage';

export default compose(
    withEnvironment,
    withLocalize,
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(PreferencesPage);
