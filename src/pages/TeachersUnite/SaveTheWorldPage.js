import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
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
        /** Current user primary login */
        email: PropTypes.string.isRequired,
    }),
    /** The list of this user's policies */
    policy: PropTypes.shape({
        /** The user's role in the policy */
        role: PropTypes.string,
    }),
};

const defaultProps = {
    session: {
        email: null,
    },
    policy: {},
};

function SaveTheWorldPage(props) {
    const {translate} = useLocalize();
    const isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain(props.session.email);
    const isTeacherAlreadyInvited = !_.isUndefined(props.policy) && props.policy.role === CONST.POLICY.ROLE.USER;

    const handleNavigation = () => {
        if (isLoggedInEmailPublicDomain) {
            Navigation.navigate(ROUTES.I_AM_A_TEACHER);
        } else {
            Navigation.navigate(ROUTES.INTRO_SCHOOL_PRINCIPAL);
        }
    };

    return (
        <IllustratedHeaderPageLayout
            shouldShowBackButton
            title={translate('sidebarScreen.saveTheWorld')}
            onBackButtonPress={Navigation.goBack}
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

            {!isTeacherAlreadyInvited && (
                <MenuItem
                    shouldShowRightIcon
                    title={translate('teachersUnitePage.iAmATeacher')}
                    onPress={handleNavigation}
                />
            )}
        </IllustratedHeaderPageLayout>
    );
}

SaveTheWorldPage.propTypes = propTypes;
SaveTheWorldPage.defaultProps = defaultProps;
SaveTheWorldPage.displayName = 'SaveTheWorldPage';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    policy: {
        key: () => `${ONYXKEYS.COLLECTION.POLICY}${CONST.TEACHERS_UNITE.POLICY_ID}`,
    },
})(SaveTheWorldPage);
