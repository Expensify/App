import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isCollectPolicy, tryNavigateToControlPolicyUpgrade} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {getBillableExpensesPendingAction, setPolicyBillableMode, toggleBillableExpenses} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

type RulesBillableDefaultPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT>;

function RulesBillableDefaultPage({
    route: {
        params: {policyID},
    },
}: RulesBillableDefaultPageProps) {
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const {isBetaEnabled} = usePermissions();
    const isRevamp = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isCollect = isCollectPolicy(policy);
    const rulesUpgradeAlias = CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias;
    const upgradeBackTo = ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID);

    const [draftBillable, setDraftBillable] = useState<boolean>();
    const persistedBillable = policy?.defaultBillable ?? false;
    const selectedBillable = draftBillable ?? persistedBillable;
    const hasChanges = selectedBillable !== persistedBillable;

    const navigateToBillableUpgrade = () => tryNavigateToControlPolicyUpgrade(policy, rulesUpgradeAlias, upgradeBackTo);

    const billableModes = [
        {
            value: true,
            text: translate(`workspace.rules.individualExpenseRules.billable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.billableDescription`),
            keyForList: CONST.POLICY_BILLABLE_MODES.BILLABLE,
            isSelected: selectedBillable,
        },
        {
            value: false,
            text: translate(`workspace.rules.individualExpenseRules.nonBillable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.nonBillableDescription`),
            keyForList: CONST.POLICY_BILLABLE_MODES.NON_BILLABLE,
            isSelected: !selectedBillable,
        },
    ];

    const initiallyFocusedOptionKey = selectedBillable ? CONST.POLICY_BILLABLE_MODES.BILLABLE : CONST.POLICY_BILLABLE_MODES.NON_BILLABLE;

    const saveAndGoBack = () => {
        if (isCollect && selectedBillable && navigateToBillableUpgrade()) {
            return;
        }

        setPolicyBillableMode(policyID, selectedBillable, policy?.defaultBillable, policy?.disabledFields?.defaultBillable, getReviewWorkspaceSettingsTaskCompletion());
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: !hasChanges,
    };

    const isBillableTrackingEnabled = policy?.disabledFields?.defaultBillable !== true;
    // Track-billable is controlled on this page (not Tags), so show defaults whenever tracking is on.
    const shouldShowBillableModeList = !isRevamp || isBillableTrackingEnabled;

    const handleBillableModeSelect = (value: boolean) => {
        if (isCollect && value && navigateToBillableUpgrade()) {
            return;
        }

        setDraftBillable(value);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesBillableDefaultPage"
            >
                <HeaderWithBackButton
                    title={translate(isRevamp ? 'workspace.rules.generalTab.billableExpenses' : 'workspace.rules.individualExpenseRules.billableDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, isRevamp ? styles.mb3 : styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.billableDefaultDescription')}</Text>
                </Text>
                {isRevamp && (
                    <ToggleSettingOptionRow
                        title={translate('workspace.tags.trackBillable')}
                        switchAccessibilityLabel={translate('workspace.tags.trackBillable')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mh5, styles.mv4]}
                        isActive={isBillableTrackingEnabled}
                        pendingAction={getBillableExpensesPendingAction(policy)}
                        onToggle={() => toggleBillableExpenses(policy, getReviewWorkspaceSettingsTaskCompletion())}
                    />
                )}
                {shouldShowBillableModeList && (
                    <SelectionList
                        data={billableModes}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => {
                            handleBillableModeSelect(item.value);
                        }}
                        confirmButtonOptions={confirmButtonOptions}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={initiallyFocusedOptionKey}
                        addBottomSafeAreaPadding
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesBillableDefaultPage;
