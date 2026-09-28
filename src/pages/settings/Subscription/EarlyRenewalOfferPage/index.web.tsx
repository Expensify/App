/** Lets the billing owner choose one of the incentivized early renewal discounts and renew their annual subscription with it. */
import Badge from '@components/Badge';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

type IncentivizedOfferID = ValueOf<Pick<typeof CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID, 'INCENTIVIZED_ONE_YEAR' | 'INCENTIVIZED_TWO_YEARS'>>;

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
    const illustrations = useMemoizedLazyIllustrations(['AgentsIceCream', 'IceCreamNumberOne', 'IceCreamNumberTwo']);
    const [selectedOfferID, setSelectedOfferID] = useState<IncentivizedOfferID | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRenewing, setIsRenewing] = useState(false);

    const selectOffer = (offerID: IncentivizedOfferID) => {
        setSelectedOfferID(offerID);
        setErrorMessage('');
    };

    const renewWithSelectedOffer = async () => {
        if (!selectedOfferID) {
            setErrorMessage(translate('earlyRenewal.offer.chooseOptionError'));
            return;
        }

        setIsRenewing(true);
        try {
            const response = await acceptEarlyRenewalOffer(selectedOfferID);
            if (response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
                Navigation.goBack();
                return;
            }
            setErrorMessage(response?.message ?? translate('common.genericErrorMessage'));
        } catch {
            setErrorMessage(translate('common.genericErrorMessage'));
        }
        setIsRenewing(false);
    };

    return (
        <ScreenWrapper
            testID="EarlyRenewalOfferPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
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
                    src={illustrations.AgentsIceCream}
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
                    isLoading={isRenewing}
                    shouldShowLoadingImmediatelyOnPress={false}
                    buttonText={translate('earlyRenewal.offer.renewAndClaim')}
                    containerStyles={[styles.mh0, styles.mv0, styles.mb0]}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default EarlyRenewalOfferPage;
