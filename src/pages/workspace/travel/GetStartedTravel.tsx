import React from 'react';
import BookTravelButton from '@components/BookTravelButton';
import FeatureList from '@components/FeatureList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasInProgressUSDVBBA, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel'] as const);
    // TODO: Remove this when Travel Invoicing feature is fully implemented
    const {isBetaEnabled} = usePermissions();

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: false});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});

    const isTravelInvoicingEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING);
    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);

    const handleCtaPress = () => {
        // Do nothing if beta is not enabled (existing noop behavior)
        if (!isTravelInvoicingEnabled) {
            return;
        }

        // If no bank accounts or setup is unfinished, start the add bank account flow
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)));
            return;
        }

        // If bank accounts exist, navigate to settlement account selection
        Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
    };

    // If Travel Invoicing beta is enabled, show a simple button that starts the setup flow
    if (isTravelInvoicingEnabled) {
        return (
            <FeatureList
                menuItems={[]}
                title={translate('workspace.moreFeatures.travel.getStarted.title')}
                subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
                ctaText={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.tangerine700}
                illustration={illustrations.PendingTravel}
                illustrationStyle={styles.travelCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
                titleStyles={styles.textHeadlineH1}
            />
        );
    }
    // TODO-END

    return (
        <FeatureList
            menuItems={[]}
            title={translate('workspace.moreFeatures.travel.getStarted.title')}
            subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
            illustrationBackgroundColor={colors.tangerine700}
            illustration={illustrations.PendingTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
            titleStyles={styles.textHeadlineH1}
            footer={
                <BookTravelButton
                    text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                    activePolicyID={policyID}
                    shouldShowVerifyAccountModal={false}
                />
            }
        />
    );
}

export default GetStartedTravel;
