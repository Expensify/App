/**
 * The status page content once Wise approved the business, so the admin can pay members worldwide.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type ApprovedContentProps = {
    onDone: () => void;
};

function ApprovedContent({onDone}: ApprovedContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Fireworks']);

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content style={styles.ph5}>
                <ConfirmationPage.Illustration illustration={illustrations.Fireworks} />
                <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.approved.heading')}</ConfirmationPage.Heading>
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.approved.description')}</ConfirmationPage.Description>
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.PrimaryButton
                    text={translate('common.done')}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_ONBOARDING_APPROVED.DONE}
                    onPress={onDone}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default ApprovedContent;
