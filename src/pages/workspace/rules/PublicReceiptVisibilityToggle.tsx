/**
 * Shared Public receipt visibility toggle for classic and revamp Rules General sections.
 */
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyReceiptVisibilityPublic} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type PublicReceiptVisibilityToggleProps = {
    /** Workspace policy ID */
    policyID: string;

    /** Whether the current user can write Rules settings */
    canWriteRules: boolean;

    /** Wraps disabled actions for read-only Rules users (classic Rules page) */
    withReadOnlyFallback?: (disabledAction?: () => void | Promise<void>) => (() => void | Promise<void>) | undefined;

    /** Compact subtitle spacing used by Rules Revamp rows */
    shouldUseCompactSubtitleSpacing?: boolean;

    /** Optional leading row icon (Rules Revamp) */
    rowIcon?: IconAsset;

    /** Optional title style overrides (classic Rules) */
    titleStyle?: StyleProp<TextStyle>;

    /** Optional subtitle style overrides (classic Rules) */
    subtitleStyle?: StyleProp<TextStyle>;
};

function PublicReceiptVisibilityToggle({
    policyID,
    canWriteRules,
    withReadOnlyFallback,
    shouldUseCompactSubtitleSpacing,
    rowIcon,
    titleStyle,
    subtitleStyle,
}: PublicReceiptVisibilityToggleProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const isEnabled = !!policy?.isReceiptVisibilityPublic;
    const isUnavailable = !isControlPolicy(policy);

    const navigateToUpgrade = () => {
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.publicReceiptVisibility.alias, ROUTES.WORKSPACE_RULES.getRoute(policyID)));
    };

    const upgradeDisabledAction = isUnavailable ? navigateToUpgrade : undefined;
    let disabledAction: (() => void | Promise<void>) | undefined;
    if (withReadOnlyFallback) {
        disabledAction = withReadOnlyFallback(upgradeDisabledAction);
    } else if (canWriteRules) {
        disabledAction = upgradeDisabledAction;
    }

    return (
        <ToggleSettingOptionRow
            title={translate('workspace.rules.individualExpenseRules.publicReceiptVisibility')}
            subtitle={translate(
                isEnabled ? 'workspace.rules.individualExpenseRules.publicReceiptVisibilityHintEnabled' : 'workspace.rules.individualExpenseRules.publicReceiptVisibilityHintDisabled',
            )}
            switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.publicReceiptVisibility')}
            wrapperStyle={[styles.mt3]}
            shouldPlaceSubtitleBelowSwitch
            shouldUseCompactSubtitleSpacing={shouldUseCompactSubtitleSpacing}
            titleStyle={titleStyle}
            subtitleStyle={subtitleStyle}
            isActive={isEnabled}
            disabled={!canWriteRules || isUnavailable}
            disabledAction={disabledAction}
            showLockIcon={!canWriteRules || isUnavailable}
            onToggle={() => (canWriteRules ? setPolicyReceiptVisibilityPublic(policyID, !isEnabled, policy?.isReceiptVisibilityPublic) : undefined)}
            pendingAction={policy?.pendingFields?.isReceiptVisibilityPublic}
            rowIcon={rowIcon}
        />
    );
}

export default PublicReceiptVisibilityToggle;
