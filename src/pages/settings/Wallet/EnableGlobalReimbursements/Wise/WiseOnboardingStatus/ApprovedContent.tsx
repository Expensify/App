/**
 * The status page content once Wise approved the business, so the admin can pay members worldwide.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

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

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content style={styles.ph5}>
                {/* The default illustration is the fireworks animation from the design */}
                <ConfirmationPage.Illustration />
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
