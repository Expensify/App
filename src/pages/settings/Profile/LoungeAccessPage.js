import React from 'react';
import {withOnyx} from 'react-native-onyx';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import userPropTypes from '@pages/settings/userPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Current user details, which will hold whether or not they have Lounge Access */
    user: userPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    user: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function LoungeAccessPage(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!props.user.hasLoungeAccess) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.ExpensifyLounge}
        >
            <Text
                style={[styles.flex1, styles.ph5, styles.textHeadline, styles.preWrap, styles.mb2]}
                numberOfLines={1}
            >
                {translate('loungeAccessPage.headline')}
            </Text>
            <Text style={[styles.flex1, styles.ph5, styles.baseFontStyle]}>{translate('loungeAccessPage.description')}</Text>
        </IllustratedHeaderPageLayout>
    );
}

LoungeAccessPage.propTypes = propTypes;
LoungeAccessPage.defaultProps = defaultProps;
LoungeAccessPage.displayName = 'LoungeAccessPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(LoungeAccessPage);
