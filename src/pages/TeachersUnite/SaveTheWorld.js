import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Text from '../../components/Text';
import MenuItem from '../../components/MenuItem';
import IllustratedHeaderPageLayout from '../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../components/LottieAnimations';
import SCREENS from '../../SCREENS';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isSubscribedToNewsletter: PropTypes.bool,
    }),
};

const defaultProps = {
    user: {},
};

function SaveTheWorldPage(props) {
    const {translate} = useLocalize();

    return (
        <IllustratedHeaderPageLayout
            title={translate('sidebarScreen.saveTheWorld')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.goBack()}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
            illustration={LottieAnimations.PreferencesDJ}
        >
            <View style={styles.mb6}>
                <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.ml5, styles.mr8]}>
                    <View style={styles.flex4}>
                        <Text>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text>
                    </View>
                </View>
                <MenuItem
                    shouldShowRightIcon
                    title={translate('teachersUnitePage.iKnowATeacher')}
                    // onPress={() => Navigation.navigate(ROUTES)}
                />

                <MenuItem
                    shouldShowRightIcon
                    title={translate('teachersUnitePage.iAmATeacher')}
                    // onPress={() => Navigation.navigate(ROUTES)}
                />
            </View>
        </IllustratedHeaderPageLayout>
    );
}

SaveTheWorldPage.propTypes = propTypes;
SaveTheWorldPage.defaultProps = defaultProps;
SaveTheWorldPage.displayName = 'SaveTheWorldPage';

export default withOnyx({
    user: {
        key: ONYXKEYS.USER,
    },
})(SaveTheWorldPage);
