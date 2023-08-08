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
import * as LoginUtils from '../../libs/LoginUtils';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),
};

const defaultProps = {
    session: {
        email: null,
    },
};

function SaveTheWorldPage(props) {
    const {translate} = useLocalize();
    const isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain(props.session.email);

    return (
        <IllustratedHeaderPageLayout
            shouldShowBackButton
            title={translate('sidebarScreen.saveTheWorld')}
            onBackButtonPress={() => Navigation.goBack()}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[ROUTES.I_KNOW_A_TEACHER]}
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
                onPress={() => (isLoggedInEmailPublicDomain ? Navigation.navigate(ROUTES.I_AM_A_TEACHER) : Navigation.navigate(ROUTES.INTRO_SCHOOL_PRINCIPAL))}
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
    session: {
        key: ONYXKEYS.SESSION,
    },
})(SaveTheWorldPage);
