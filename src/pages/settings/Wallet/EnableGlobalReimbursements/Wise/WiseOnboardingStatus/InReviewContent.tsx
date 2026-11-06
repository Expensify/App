/**
 * The status page content while Wise reviews the business.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type InReviewContentProps = {
    onDone: () => void;
};

function InReviewContent({onDone}: InReviewContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['NotebookGremlin']);

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content style={styles.ph5}>
                <ConfirmationPage.Illustration illustration={illustrations.NotebookGremlin} />
                <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.inReview.heading')}</ConfirmationPage.Heading>
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.inReview.description')}</ConfirmationPage.Description>
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.SecondaryButton
                    text={translate('walletPage.wiseOnboarding.inReview.chatWithConcierge')}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_ONBOARDING_IN_REVIEW.CHAT_WITH_CONCIERGE}
                    onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                />
                <ConfirmationPage.PrimaryButton
                    text={translate('common.done')}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_ONBOARDING_IN_REVIEW.DONE}
                    onPress={onDone}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default InReviewContent;
