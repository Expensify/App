import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const propTypes = {
    /** The list of this user's policies */
    policy: PropTypes.shape({
        /** The user's role in the policy */
        role: PropTypes.string,
    }),
};

const defaultProps = {
    policy: {},
};

function SaveTheWorldPage() {
    const {translate} = useLocalize();

    return (
        <IllustratedHeaderPageLayout
            shouldShowBackButton
            title={translate('sidebarScreen.saveTheWorld')}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SAVE_THE_WORLD.ROOT]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)}
            illustration={LottieAnimations.SaveTheWorld}
        >
            <View style={[styles.mb4, styles.justifyContentBetween, styles.mh5]}>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('teachersUnitePage.teachersUnite')}</Text>
                <Text>{translate('teachersUnitePage.joinExpensifyOrg')}</Text>
            </View>

            <MenuItem
                shouldShowRightIcon
                title={translate('teachersUnitePage.iKnowATeacher')}
                onPress={() => Navigation.navigate(ROUTES.I_KNOW_A_TEACHER)}
            />

            <MenuItem
                shouldShowRightIcon
                title={translate('teachersUnitePage.iAmATeacher')}
                onPress={() => Navigation.navigate(ROUTES.I_AM_A_TEACHER)}
            />
        </IllustratedHeaderPageLayout>
    );
}

SaveTheWorldPage.propTypes = propTypes;
SaveTheWorldPage.defaultProps = defaultProps;
SaveTheWorldPage.displayName = 'SaveTheWorldPage';

export default SaveTheWorldPage;
