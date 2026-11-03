/**
 * The status page content for an account Wise needs more info about. Continue fetches a link to Wise's own form and opens it,
 * since only Wise can collect those details.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import openExternalLink from '@libs/openExternalLink';

import {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';

type MoreInfoNeededContentProps = {
    bankAccountID: number;
};

function MoreInfoNeededContent({bankAccountID}: MoreInfoNeededContentProps) {
    const [embeddedLink] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);
    const {translate} = useLocalize();
    // A read lost to a dropped connection applies no failureData, so reconnecting clears the stuck loading state
    const {isOffline} = useNetwork({onReconnect: clearWiseKYCReviewEmbeddedLink});
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);

    // Only a link asked for on this visit redirects, so a fetch that returns after an earlier visit closed does not
    const [hasRequestedLink, setHasRequestedLink] = useState(false);
    const kycReviewURL = embeddedLink?.url;
    useEffect(() => {
        if (!hasRequestedLink || !kycReviewURL) {
            return;
        }
        openExternalLink(kycReviewURL, undefined, true);
    }, [hasRequestedLink, kycReviewURL]);

    // The link carries a token and a fetch can land after an earlier visit closed, so the content drops it on open and on close.
    // Close includes the status changing while the page is open, which swaps this content out.
    useEffect(() => {
        clearWiseKYCReviewEmbeddedLink();
        return () => clearWiseKYCReviewEmbeddedLink();
    }, []);

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content requestErrors={embeddedLink?.errors}>
                <ConfirmationPage.Illustration illustration={illustrations.UserShield} />
                <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.moreInfoNeeded.title')}</ConfirmationPage.Heading>
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.moreInfoNeeded.subtitle')}</ConfirmationPage.Description>
            </ConfirmationPage.Content>
            <FixedFooter>
                {/* A read is not queued offline, so the link can only be fetched online */}
                <ConfirmationPage.PrimaryButton
                    text={translate('common.continue')}
                    isDisabled={isOffline}
                    isLoading={!!embeddedLink?.isLoading}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_MORE_INFO_NEEDED.CONTINUE}
                    onPress={() => {
                        setHasRequestedLink(true);
                        getWiseKYCReviewEmbeddedLink(bankAccountID);
                    }}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default MoreInfoNeededContent;
