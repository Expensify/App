import React, { useCallback, useMemo } from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {format} from 'date-fns';
import DateUtils from '../../../libs/DateUtils';
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

function LoungeAccessPage({
    preferredLocale,
    user: {
        hasLoungeAccess,
        loungeCheckInDetails: {isCheckedIn, checkInsRemaining, nextCheckInReset},
    },
    currentUserPersonalDetails: {avatar, displayName, fallbackIcon},
    session: {accountID, email},
}) {
    const {translate} = useLocalize();

    const checkIn = useCallback(() => {
        Lounge.recordLoungeVisit(checkInsRemaining);
    }, [checkInsRemaining]);

    const overlayContent = () => (
        <LinearGradient
            colors={[`${themeColors.loungeAccessOverlay}00`, themeColors.loungeAccessOverlay]}
            style={[styles.pAbsolute, styles.w100, styles.h100]}
        >
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.pt5, styles.ph5]}>
                <Avatar
                    imageStyles={[styles.avatarLarge]}
                    source={UserUtils.getAvatar(avatar, accountID)}
                    size={CONST.AVATAR_SIZE.LARGE}
                    fallbackIcon={fallbackIcon}
                />
                <Text
                    style={[styles.textHeadline, styles.pre, styles.mt2]}
                    numberOfLines={1}
                >
                    {displayName || LocalePhoneNumber.formatPhoneNumber(email)}
                </Text>
                <Text
                    style={[styles.textLabelSupporting, styles.mt1]}
                    numberOfLines={1}
                >
                    {LocalePhoneNumber.formatPhoneNumber(email)}
                </Text>
            </View>
        </LinearGradient>
    );

    /**
     * Returns 1st day of the next month in proper locale, e.g.
     * - 1 November - for English language
     * - 1 de noviembre - for Spanish language
     *
     * @returns {String}
     */
    const localizeDate = useMemo(() => {
        DateUtils.setLocale(preferredLocale);
        // The .format('LL') returns localized format of the date:
        // - 1 November 2023 - for English language
        // - 1 de noviembre de 2023 - for Spanish language
        const dayMonthYear = format(new Date(nextCheckInReset), CONST.DATE.LOCALIZED_DATE_FORMAT)

        // We only care about the day and the month, so we
        // get rid of the year for both languages:
        return dayMonthYear.replace(/ (?:de )?\d{4}$/, '') // Drop English or Spanish year
    }, [nextCheckInReset, preferredLocale]);

    if (!hasLoungeAccess) {
        return <NotFoundPage />;
    }

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
                {checkInsRemaining === 0 && !isCheckedIn ? (
                    <Text style={[styles.mb4]}>
                        <Text style={[styles.textStrong]}>{translate('loungeAccessPage.noCheckInsLeftFirstPart')}</Text>
                        {translate('loungeAccessPage.noCheckInsLeftSecondPart', {nextCheckIn: localizeDate})}
                    </Text>
                ) : (
                    <Text style={[styles.mb4]}>
                        {isCheckedIn
                            ? translate('loungeAccessPage.nextCheckInBeforeNumberCheckedIn', {checkInsRemaining})
                            : translate('loungeAccessPage.nextCheckInBeforeNumberCheckIn', {checkInsRemaining})}{' '}
                        <Text style={[styles.textStrong]}>
                            {NumberFormatUtils.format(preferredLocale, checkInsRemaining)}{' '}
                            {checkInsRemaining === 1 ? translate('loungeAccessPage.nextCheckInNumberCountSingular') : translate('loungeAccessPage.nextCheckInNumberCountPlural')}
                        </Text>{' '}
                        {translate('loungeAccessPage.nextCheckInAfterNumber')}
                    </Text>
                )}
                {isCheckedIn ? (
                    <Button
                        shouldUseDefaultHover={false}
                        style={[styles.buttonSuccess, styles.w100]}
                        innerStyles={[styles.appBG, styles.alignItemsCenter]}
                        text={translate('loungeAccessPage.youAreCheckedIn')}
                        icon={Expensicons.Checkmark}
                        iconFill={styles.success}
                    />
                ) : (
                    <>
                        {checkInsRemaining > 0 && (
                            <Button
                                style={[styles.w100]}
                                text={translate('loungeAccessPage.checkIn')}
                                onPress={checkIn}
                                success
                            />
                        )}
                    </>
                )}
            </View>
            <FeatureList
                headlineSize={CONST.HEADLINE_SIZE.LARGE}
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
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LoungeAccessPage);
