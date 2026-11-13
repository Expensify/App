import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type InsightsUpsellStateProps = {
    /** Workspaces in scope the user could upgrade. With none the CTA is hidden, and with several the user picks one. */
    upgradeablePolicyIDs: string[];
};

/** Stands in for a dashboard's charts when it needs Control and no workspace in scope is on it. */
function InsightsUpsellState({upgradeablePolicyIDs}: InsightsUpsellStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Chart']);

    const policyID = upgradeablePolicyIDs.length === 1 ? upgradeablePolicyIDs.at(0) : undefined;

    // The route keeps the feature only alongside a workspace, so without one this lands on the generic Control pitch.
    // The upgrade page sends Rules upgrades to More features unless told where to return, so pass the current
    // dashboard and its filters to bring the user back here.
    const navigateToUpgrade = () => Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, Navigation.getActiveRoute()));

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.Chart}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            headerContentStyles={[styles.insightsEmptyStateIllustration]}
            title={translate('insightsPage.upsellState.title')}
            subtitle={translate('insightsPage.upsellState.subtitle')}
            minModalHeight={0}
            buttons={
                upgradeablePolicyIDs.length > 0
                    ? [
                          {
                              buttonText: translate('insightsPage.upsellState.button'),
                              sentryLabel: CONST.SENTRY_LABEL.INSIGHTS.UPSELL_UPGRADE,
                              buttonAction: navigateToUpgrade,
                              buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                          },
                      ]
                    : undefined
            }
        />
    );
}

export default InsightsUpsellState;
