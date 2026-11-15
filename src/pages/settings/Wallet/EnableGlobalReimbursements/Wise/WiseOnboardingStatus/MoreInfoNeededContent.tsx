/**
 * The status page content while Wise needs details only its own hosted form can collect.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import openWiseKYCReview, {getWiseKYCRedirectURL} from '@libs/openWiseKYCReview';

import {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';

type MoreInfoNeededContentProps = {
    bankAccountID: number;

    /** The status page's own path, where Wise sends the user when its form ends and which the form's mobile screen opens over */
    statusPath: string;
};

function MoreInfoNeededContent({bankAccountID, statusPath}: MoreInfoNeededContentProps) {
    const [embeddedLink] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);
    const {environmentURL} = useEnvironment();

    const {translate} = useLocalize();
    // A read lost to a dropped connection applies no failureData, so reconnecting clears the stuck loading state, but keeps a link the open form still shows
    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!embeddedLink?.isLoading) {
                return;
            }
            clearWiseKYCReviewEmbeddedLink();
        },
    });
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);

    // Wise gets no query, because the entry screen's query (for example a Search query) can hold personal data and the entry screen falls back to its defaults without it, and the form's mobile screen opens over the same path
    const [statusPathWithoutQuery = statusPath] = splitPathAndQuery(statusPath.replaceAll(/^\/+/g, ''));

    // Only a link asked for on this visit redirects, so a fetch that returns after an earlier visit closed does not
    const [hasRequestedLink, setHasRequestedLink] = useState(false);
    const kycReviewURL = embeddedLink?.url;
    useEffect(() => {
        if (!hasRequestedLink || !kycReviewURL) {
            return;
        }
        openWiseKYCReview(kycReviewURL, statusPathWithoutQuery);
    }, [hasRequestedLink, kycReviewURL, statusPathWithoutQuery]);

    // The link carries a token and a fetch can land after an earlier visit closed, so the content drops it on open and on close
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
                        getWiseKYCReviewEmbeddedLink(bankAccountID, getWiseKYCRedirectURL(statusPathWithoutQuery, environmentURL));
                    }}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default MoreInfoNeededContent;
