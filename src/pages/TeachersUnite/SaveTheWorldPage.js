import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

function SaveTheWorldPage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isTeacherAlreadyInvited = !_.isUndefined(props.policy) && props.policy.role === CONST.POLICY.ROLE.USER;

    return (
        <IllustratedHeaderPageLayout
            shouldShowBackButton
            title={translate('sidebarScreen.saveTheWorld')}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SAVE_THE_WORLD.ROOT]}
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

            {!isTeacherAlreadyInvited && (
                <MenuItem
                    shouldShowRightIcon
                    title={translate('teachersUnitePage.iAmATeacher')}
                    onPress={() => Navigation.navigate(ROUTES.I_AM_A_TEACHER)}
                />
            )}
        </IllustratedHeaderPageLayout>
    );
}

SaveTheWorldPage.propTypes = propTypes;
SaveTheWorldPage.defaultProps = defaultProps;
SaveTheWorldPage.displayName = 'SaveTheWorldPage';

export default withOnyx({
    policy: {
        key: () => `${ONYXKEYS.COLLECTION.POLICY}${CONST.TEACHERS_UNITE.POLICY_ID}`,
    },
})(SaveTheWorldPage);
