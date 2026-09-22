import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useIsNonIncentivizedEarlyRenewalPeriod from '@hooks/useIsNonIncentivizedEarlyRenewalPeriod';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';
import {View} from 'react-native';

function EarlyRenewalOfferPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const isNonIncentivizedPeriod = useIsNonIncentivizedEarlyRenewalPeriod();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [hasSubmittedClaim, setHasSubmittedClaim] = useState(false);

    if (eligibilityMetadata.status !== 'loaded') {
        return <FullScreenLoadingIndicator />;
    }

    if (!eligibility?.canClaim || !isNonIncentivizedPeriod) {
        if (hasSubmittedClaim) {
            return null;
        }
        return <NotFoundPage />;
    }

    const copy = {
        headerTitle: CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER.HEADER_TITLE,
        title: CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER.TITLE,
        description: CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER.DESCRIPTION,
        cta: CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER.CTA,
    };

    const submitOffer = () => {
        setIsSubmitting(true);
        setErrorMessage('');
        setHasSubmittedClaim(true);
        acceptEarlyRenewalOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR)
            .then((response) => {
                setIsSubmitting(false);
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    setHasSubmittedClaim(false);
                    setErrorMessage(response?.message ?? translate('common.genericErrorMessage'));
                    return;
                }

                Navigation.goBack();
            })
            .catch(() => {
                setHasSubmittedClaim(false);
                setErrorMessage(translate('common.genericErrorMessage'));
                setIsSubmitting(false);
            });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="EarlyRenewalOfferPage"
        >
            <HeaderWithBackButton
                title={copy.headerTitle}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                <View style={[styles.flexGrow1, styles.justifyContentCenter]}>
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb3]}>{copy.title}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting]}>{copy.description}</Text>
                </View>
            </ScrollView>
            <FixedFooter>
                <FormAlertWithSubmitButton
                    isAlertVisible={!!errorMessage}
                    isLoading={isSubmitting}
                    message={errorMessage}
                    onSubmit={submitOffer}
                    buttonText={copy.cta}
                    sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.WIDGET_ITEM}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default EarlyRenewalOfferPage;
