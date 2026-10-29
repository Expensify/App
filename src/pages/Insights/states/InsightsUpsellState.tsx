import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type InsightsUpsellStateProps = {
    /** Workspace the upgrade flow starts on, left out when none or several in scope qualify so the flow asks which one */
    policyID?: string;
};

/** Stands in for the whole dashboard when it needs Control but no workspace in scope is on it. */
function InsightsUpsellState({policyID}: InsightsUpsellStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Chart']);

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.Chart}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            headerContentStyles={[styles.insightsEmptyStateIllustration]}
            title={translate('insightsPage.upsellState.title')}
            subtitle={translate('insightsPage.upsellState.subtitle')}
            minModalHeight={0}
            buttons={[
                {
                    buttonText: translate('insightsPage.upsellState.button'),
                    buttonAction: () => Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias)),
                    buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                },
            ]}
        />
    );
}

export default InsightsUpsellState;
