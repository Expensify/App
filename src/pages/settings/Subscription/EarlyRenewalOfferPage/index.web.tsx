/** Lets the billing owner choose one of the incentivized early renewal discounts and renew their annual subscription with it. */
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';
import {View} from 'react-native';

type IncentivizedOfferID = typeof CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_ONE_YEAR | typeof CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS;

type Offer = {
    offerID: IncentivizedOfferID;
    label: TranslationPaths;
    illustration: 'IceCreamNumberOne' | 'IceCreamNumberTwo';
    isBestDeal: boolean;
};

const OFFERS: Offer[] = [
    {offerID: CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_ONE_YEAR, label: 'earlyRenewal.offer.oneYear', illustration: 'IceCreamNumberOne', isBestDeal: false},
    {offerID: CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS, label: 'earlyRenewal.offer.twoYears', illustration: 'IceCreamNumberTwo', isBestDeal: true},
];

function EarlyRenewalOfferPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const themeIllustrations = useThemeIllustrations();
    const illustrations = useMemoizedLazyIllustrations(['IceCreamMenu', 'IceCreamNumberOne', 'IceCreamNumberTwo']);
    const [selectedOfferID, setSelectedOfferID] = useState<IncentivizedOfferID | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const {isIncentivizedPeriod} = useEarlyRenewalPeriod();
    // Auth would reject a claim from anyone who can't claim right now, so they shouldn't reach the picker by URL
    const shouldShowNotFound = eligibilityMetadata.status === 'loaded' && (!eligibility?.canClaim || !isIncentivizedPeriod);

    const selectOffer = (offerID: IncentivizedOfferID) => {
        setSelectedOfferID(offerID);
        setErrorMessage('');
    };

    const renewWithSelectedOffer = () => {
        if (!selectedOfferID) {
            setErrorMessage(translate('earlyRenewal.offer.chooseOptionError'));
            return;
        }

        // Any failure surfaces on the Subscription banner and Home card, which read the offer's errors
        acceptEarlyRenewalOffer(selectedOfferID);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID="EarlyRenewalOfferPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView
                shouldShow={shouldShowNotFound}
                onBackButtonPress={Navigation.goBack}
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('earlyRenewal.claim')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={[styles.alignItemsCenter, styles.ph5, styles.pv3, styles.gap6]}>
                    <View style={styles.earlyRenewalOfferBackground}>
                        <ImageSVG
                            src={themeIllustrations.IceCreamBackgroundImage}
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMidYMid slice"
                        />
                    </View>
                    <Icon
                        src={illustrations.IceCreamMenu}
                        width={variables.earlyRenewalOfferHeroWidth}
                        height={variables.earlyRenewalOfferHeroHeight}
                    />
                    <View style={[styles.w100, styles.gap2]}>
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>{translate('earlyRenewal.offer.heading')}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('earlyRenewal.offer.subtitle')}</Text>
                    </View>
                    <View
                        style={[styles.flexRow, styles.w100, styles.gap2]}
                        role={CONST.ROLE.RADIOGROUP}
                        accessibilityLabel={translate('earlyRenewal.offer.heading')}
                    >
                        {OFFERS.map((offer) => {
                            const isSelected = selectedOfferID === offer.offerID;
                            return (
                                <PressableWithFeedback
                                    key={offer.offerID}
                                    onPress={() => selectOffer(offer.offerID)}
                                    role={CONST.ROLE.RADIO}
                                    accessibilityState={{checked: isSelected}}
                                    accessibilityLabel={translate(offer.label)}
                                    wrapperStyle={styles.flex1}
                                    style={[styles.earlyRenewalOfferOption, isSelected && styles.earlyRenewalOfferOptionSelected]}
                                    sentryLabel={CONST.SENTRY_LABEL.EARLY_RENEWAL_OFFER.OPTION}
                                >
                                    {/* The whole tile is the radio for assistive tech, so this one is only visual. */}
                                    <View
                                        style={styles.earlyRenewalOfferOptionRadio}
                                        aria-hidden
                                        importantForAccessibility="no-hide-descendants"
                                    >
                                        <RadioButton
                                            isChecked={isSelected}
                                            onPress={() => selectOffer(offer.offerID)}
                                            accessibilityLabel={translate(offer.label)}
                                            tabIndex={-1}
                                        />
                                    </View>
                                    {offer.isBestDeal && (
                                        <Badge
                                            success
                                            isCondensed
                                            text={translate('earlyRenewal.offer.bestDeal')}
                                            badgeStyles={styles.earlyRenewalOfferOptionBadge}
                                        />
                                    )}
                                    <Icon
                                        src={illustrations[offer.illustration]}
                                        width={variables.earlyRenewalOfferOptionIllustrationSize}
                                        height={variables.earlyRenewalOfferOptionIllustrationSize}
                                    />
                                    <Text style={[styles.textStrong, styles.textAlignCenter]}>{translate(offer.label)}</Text>
                                </PressableWithFeedback>
                            );
                        })}
                    </View>
                </ScrollView>
                <FixedFooter addBottomSafeAreaPadding>
                    <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3]}>{translate('earlyRenewal.offer.disclaimer')}</Text>
                    <FormAlertWithSubmitButton
                        isAlertVisible={!!errorMessage}
                        message={errorMessage}
                        onSubmit={renewWithSelectedOffer}
                        shouldShowLoadingImmediatelyOnPress={false}
                        buttonText={translate('earlyRenewal.offer.renewAndClaim')}
                        containerStyles={[styles.mh0, styles.mv0, styles.mb0]}
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default EarlyRenewalOfferPage;
