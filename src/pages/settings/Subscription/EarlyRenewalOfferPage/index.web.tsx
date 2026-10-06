/** Lets the billing owner choose one of the incentivized early renewal discounts and renew their annual subscription with it. */
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
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
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';
import {View} from 'react-native';

import EarlyRenewalOfferTile from './EarlyRenewalOfferTile';

type IncentivizedOfferID = typeof CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_ONE_YEAR | typeof CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS;

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
                        <EarlyRenewalOfferTile
                            label={translate('earlyRenewal.offer.oneYear')}
                            illustration={illustrations.IceCreamNumberOne}
                            isSelected={selectedOfferID === CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_ONE_YEAR}
                            onSelect={() => selectOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_ONE_YEAR)}
                        />
                        <EarlyRenewalOfferTile
                            label={translate('earlyRenewal.offer.twoYears')}
                            illustration={illustrations.IceCreamNumberTwo}
                            isSelected={selectedOfferID === CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS}
                            onSelect={() => selectOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS)}
                        >
                            <Badge
                                success
                                isCondensed
                                text={translate('earlyRenewal.offer.bestDeal')}
                                badgeStyles={styles.earlyRenewalOfferOptionBadge}
                            />
                        </EarlyRenewalOfferTile>
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
