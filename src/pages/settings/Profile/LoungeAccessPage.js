import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '@components/LottieAnimations';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import userPropTypes from '@pages/settings/userPropTypes';
import {styles} from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Current user details, which will hold whether or not they have Lounge Access */
    user: userPropTypes,
    isLoadingReportData: PropTypes.bool,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    user: {},
    isLoadingReportData: true,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function LoungeAccessPage(props) {
    const {translate} = useLocalize();

    if (props.isLoadingReportData && _.isEmpty(props.user)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!props.user.hasLoungeAccess) {
        return <FullPageNotFoundView shouldShow />;
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
