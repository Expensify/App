import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Lounge from '../../../libs/actions/Lounge';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import userPropTypes from '../userPropTypes';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import useLocalize from '../../../hooks/useLocalize';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FeatureList from '../../../components/FeatureList';
import * as Illustrations from '../../../components/Icon/Illustrations';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as NumberFormatUtils from '../../../libs/NumberFormatUtils';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import LinearGradient from '../../../components/LinearGradient';
import Avatar from '../../../components/Avatar';
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

const menuItems = [
    {
        translationKey: 'loungeAccessPage.coffeePromo',
        icon: Illustrations.CoffeeMug,
    },
    {
        translationKey: 'loungeAccessPage.networkingPromo',
        icon: Illustrations.ChatBubbles,
    },
    {
        translationKey: 'loungeAccessPage.viewsPromo',
        icon: Illustrations.SanFrancisco,
    },
];

function LoungeAccessPage(props) {
    const {translate} = useLocalize();

    if (!props.user.hasLoungeAccess) {
        return <NotFoundPage />;
    }

    const checkIn = () => {
        Lounge.recordLoungeVisit(props.user.loungeCheckInDetails.checkInsRemaining);
    }

    const overlayContent = () => (
        <LinearGradient
            colors={[`${themeColors.dark}00`, themeColors.dark]}
            style={[styles.pAbsolute, styles.w100, styles.h100]}
        >
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.pt5]}>
                <Avatar
                    imageStyles={[styles.avatarLarge]}
                    source={UserUtils.getAvatar(props.currentUserPersonalDetails.avatar, props.session.accountID)}
                    size={CONST.AVATAR_SIZE.LARGE}
                />
                <Text
                    style={[styles.textHeadline, styles.pre, styles.mt2]}
                    numberOfLines={1}
                >
                    {props.currentUserPersonalDetails.displayName ? props.currentUserPersonalDetails.displayName : LocalePhoneNumber.formatPhoneNumber(props.session.email)}
                </Text>
                <Text
                    style={[styles.textLabelSupporting, styles.mt1]}
                    numberOfLines={1}
                >
                    {LocalePhoneNumber.formatPhoneNumber(props.session.email)}
                </Text>
            </View>
        </LinearGradient>
    );

    return (
        <IllustratedHeaderPageLayout
            title={translate('loungeAccessPage.loungeAccess')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.ExpensifyLounge}
            overlayContent={overlayContent}
        >
            <View style={[styles.w100, styles.ph5, styles.pb8]}>
                <Text style={[styles.textStrong, styles.mb2]}>{translate('loungeAccessPage.checkIn')}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('loungeAccessPage.addressLabel')}</Text>
                <Text style={[styles.mb4]}>{translate('loungeAccessPage.address')}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('loungeAccessPage.nextCheckInLabel')}</Text>
                <Text style={[styles.mb4]}>
                    {props.user.loungeCheckInDetails.isCheckedIn ? translate('loungeAccessPage.nextCheckInBeforeNumberCheckedIn') : translate('loungeAccessPage.nextCheckInBeforeNumberCheckIn')}
                    {' '}
                    <Text style={[styles.textStrong]}>
                        {NumberFormatUtils.format(props.preferredLocale, props.user.loungeCheckInDetails.checkInsRemaining)}
                        {' '}
                        {props.user.loungeCheckInDetails.checkInsRemaining === 1 ? translate('loungeAccessPage.nextCheckInNumberCountSingular') : translate('loungeAccessPage.nextCheckInNumberCountPlural')}
                    </Text>
                    {' '}
                    {translate('loungeAccessPage.nextCheckInAfterNumber')}
                </Text>
                {props.user.loungeCheckInDetails.isCheckedIn ? (
                    <Button
                        style={[styles.buttonSuccessHovered, styles.w100]}
                        innerStyles={[styles.appBG,styles.alignItemsCenter]}
                        text={translate('loungeAccessPage.youAreCheckedIn')}
                        icon={Expensicons.Checkmark}
                        iconFill={styles.success}
                    />
                ) : (
                    <Button
                        style={[styles.w100]}
                        text={translate('loungeAccessPage.checkIn')}
                        onPress={checkIn}
                        success
                    />
                )}
            </View>
            <FeatureList
                headlineType="strong"
                headline="loungeAccessPage.headline"
                description="loungeAccessPage.description"
                menuItems={menuItems}
            />
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
