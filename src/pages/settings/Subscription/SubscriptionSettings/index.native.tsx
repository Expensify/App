import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OptionItem from '@components/OptionsPicker/OptionItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getRoom} from '@libs/ReportUtils';
import {getSubscriptionPrice} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const subscriptionPlan = useSubscriptionPlan();
    const preferredCurrency = usePreferredCurrency();
    const illustrations = useThemeIllustrations();
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const subscriptionPrice = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscription?.type);
    const priceDetails = translate(`subscription.yourPlan.${subscriptionPlan === CONST.POLICY.TYPE.CORPORATE ? 'control' : 'collect'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
        lower: convertToShortDisplayString(subscriptionPrice, preferredCurrency),
        upper: convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });

    const openAdminsRoom = () => {
        if (!activePolicyID) {
            return;
        }
        const roomReport = getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, activePolicyID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(roomReport?.reportID));
    };

    const subscriptionSizeSection =
        privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && privateSubscription?.userCount ? (
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                title={`${privateSubscription?.userCount}`}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
        ) : null;

    return (
        <ScreenWrapper
            testID={SubscriptionSettings.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSettings.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.mobileReducedFunctionalityMessage')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.pricingConfiguration')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>
                    {translate('subscription.subscriptionSettings.learnMore.part1')}
                    <TextLink href={CONST.PRICING}>{translate('subscription.subscriptionSettings.learnMore.pricingPage')}</TextLink>
                    {translate('subscription.subscriptionSettings.learnMore.part2')}
                    <TextLink onPress={openAdminsRoom}>{translate('subscription.subscriptionSettings.learnMore.adminsRoom')}</TextLink>
                </Text>
                <Text style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.estimatedPrice')}</Text>
                <Text style={styles.mv1}>{priceDetails}</Text>
                <Text style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.changesBasedOn')}</Text>
                {!!account?.isApprovedAccountant || !!account?.isApprovedAccountantClient ? (
                    <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                        <Icon
                            src={illustrations.ExpensifyApprovedLogo}
                            width={variables.modalTopIconWidth}
                            height={variables.menuIconSize}
                        />
                        <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                    </View>
                ) : (
                    <>
                        {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAYPERUSE ? (
                            <OptionItem
                                title="subscription.details.payPerUse"
                                icon={Illustrations.SubscriptionPPU}
                                style={[styles.mt5, styles.flex0]}
                                isDisabled
                            />
                        ) : (
                            <OptionItem
                                title="subscription.details.annual"
                                icon={Illustrations.SubscriptionAnnual}
                                style={[styles.mt5, styles.flex0]}
                                isDisabled
                            />
                        )}
                        {subscriptionSizeSection}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

SubscriptionSettings.displayName = 'SubscriptionSettings';

export default SubscriptionSettings;
