import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import userPropTypes from '../userPropTypes';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import useLocalize from '../../../hooks/useLocalize';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';
import compose from '../../../libs/compose';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import LinearGradient from '../../../components/LinearGradient';
import styles from '../../../styles/styles';
import Avatar from '../../../components/Avatar';
import Text from '../../../components/Text';
import * as UserUtils from '../../../libs/UserUtils';
import CONST from '../../../CONST';
import themeColors from '../../../styles/themes/default';
import * as LocalePhoneNumber from '../../../libs/LocalePhoneNumber';

const propTypes = {
    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),

    /** Current user details, which will hold whether or not they have Lounge Access */
    user: userPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    session: {},
    user: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function LoungeAccessPage(props) {
    const {translate} = useLocalize();

    if (!props.user.hasLoungeAccess) {
        return <NotFoundPage />;
    }

    const overlayContent = () => (
        <LinearGradient
            colors={[`${themeColors.loungeAccessOverlay}00`, themeColors.loungeAccessOverlay]}
            style={[styles.pAbsolute, styles.w100, styles.h100]}
         />
    );

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.ExpensifyLounge}
            overlayContent={overlayContent}
        >
            <Text style={[styles.textHeadline, styles.preWrap, styles.mb2]} numberOfLines={1}>{translate('loungeAccessPage.headline')}</Text>
            <Text style={[styles.baseFontStyle, styles.mv5]}>{translate('loungeAccessPage.description')}</Text>
        </IllustratedHeaderPageLayout>
    );
}

LoungeAccessPage.propTypes = propTypes;
LoungeAccessPage.defaultProps = defaultProps;
LoungeAccessPage.displayName = 'LoungeAccessPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(LoungeAccessPage);
