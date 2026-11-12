/**
 * The status page content once Wise rejected the business's bank account, pointing the admin to Concierge for the reason.
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

type RejectedContentProps = {
    onDone: () => void;
};

function RejectedContent({onDone}: RejectedContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MagnifyingGlassSpyNewspaper']);

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content style={styles.ph5}>
                <ConfirmationPage.Illustration illustration={illustrations.MagnifyingGlassSpyNewspaper} />
                <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.rejected.heading')}</ConfirmationPage.Heading>
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.rejected.description')}</ConfirmationPage.Description>
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.SecondaryButton
                    text={translate('walletPage.wiseOnboarding.inReview.chatWithConcierge')}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_ONBOARDING_REJECTED.CHAT_WITH_CONCIERGE}
                    onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                />
                <ConfirmationPage.PrimaryButton
                    text={translate('common.buttonConfirm')}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_ONBOARDING_REJECTED.GOT_IT}
                    onPress={onDone}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default RejectedContent;
