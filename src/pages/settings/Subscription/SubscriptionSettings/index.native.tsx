import React from 'react';
import {Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import RenderHtml, {defaultSystemFonts} from 'react-native-render-html';
import type {CustomRendererProps} from 'react-native-render-html';
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
import usePolicy from '@hooks/usePolicy';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getSubscriptionPrice} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const systemFonts = [...defaultSystemFonts, 'CustomFontName'];
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const isActivePolicyAdmin = isPolicyAdmin(activePolicy);
    const subscriptionPlan = useSubscriptionPlan();
    const preferredCurrency = usePreferredCurrency();
    const illustrations = useThemeIllustrations();
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const subscriptionPrice = getSubscriptionPrice(subscriptionPlan, preferredCurrency, privateSubscription?.type);
    const priceDetails = translate(`subscription.yourPlan.${subscriptionPlan === CONST.POLICY.TYPE.CORPORATE ? 'control' : 'collect'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
        lower: convertToShortDisplayString(subscriptionPrice, preferredCurrency),
        upper: convertToShortDisplayString(subscriptionPrice * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });
    const adminsChatReportID = isActivePolicyAdmin && activePolicy?.chatReportIDAdmins ? activePolicy.chatReportIDAdmins.toString() : undefined;

    const openAdminsRoom = () => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
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
                <RenderHtml
                    contentWidth={windowWidth}
                    systemFonts={systemFonts}
                    source={{
                        html: translate('subscription.subscriptionSettings.learnMore'),
                    }}
                    tagsStyles={{
                        a: {...styles.link},
                        body: {
                            ...styles.textSupporting,
                            ...styles.mb5,
                        },
                    }}
                    renderers={{
                        a: ({TDefaultRenderer, ...props}: CustomRendererProps<any>) => {
                            // Determine which link to use based on the href or position
                            const isAdminsRoom = !!adminsChatReportID && props?.tnode?.domNode?.children?.[0]?.data?.includes('#admins');
                            if (isAdminsRoom) {
                                return (
                                    <TextLink onPress={openAdminsRoom}>
                                        <TDefaultRenderer {...props} />
                                    </TextLink>
                                );
                            }
                            return (
                                <TextLink onPress={() => Linking.openURL(CONST.PRICING)}>
                                    <TDefaultRenderer {...props} />
                                </TextLink>
                            );
                        },
                    }}
                />
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
                        {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE ? (
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
