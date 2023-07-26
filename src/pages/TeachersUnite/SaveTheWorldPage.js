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

function SaveTheWorldPage() {
    const {translate} = useLocalize();

    return (
        <IllustratedHeaderPageLayout
            title={translate('sidebarScreen.saveTheWorld')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.goBack()}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[ROUTES.I_Know_A_TEACHER]}
            illustration={LottieAnimations.SaveTheWorld}
        >
            <View style={[styles.mb4, styles.justifyContentBetween, styles.mh5]}>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('teachersUnitePage.teachersUnite')}</Text>
                <Text>{translate('teachersUnitePage.joinExpensifyOrg')}</Text>
            </View>
            <MenuItem
                shouldShowRightIcon
                title={translate('teachersUnitePage.iKnowATeacher')}
                onPress={() => Navigation.navigate(ROUTES.I_Know_A_TEACHER)}
            />

            <MenuItem
                shouldShowRightIcon
                title={translate('teachersUnitePage.iAmATeacher')}
                onPress={() => Navigation.navigate(ROUTES.Intro_School_Principal)}
            />

            {/* Remove Below option */}

            <MenuItem
                shouldShowRightIcon
                title={'Email (Depricate on final release)'}
                onPress={() => Navigation.navigate(ROUTES.I_Am_A_Teacher)}
            />
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
