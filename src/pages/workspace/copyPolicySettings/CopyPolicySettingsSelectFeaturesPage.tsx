import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {areAllTargetsAccountingCompatible} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

/**
 * Parts that depend on a compatible accounting connection between source and targets.
 * When any selected target has a mismatched (or missing) connection relative to the source,
 * these parts are disabled because the export references would break on the target side.
 */
const ACCOUNTING_DEPENDENT_PARTS = ['categories', 'tags', 'reports', 'taxes'] as const satisfies readonly Part[];

/**
 * Selecting "accounting" implies its coding settings must come along, so these parts flip to
 * (selected + disabled) while accounting is on.
 */
const ACCOUNTING_FORCE_ENABLED_PARTS = ACCOUNTING_DEPENDENT_PARTS;

type FeatureRow = {
    part: Part;
    labelKey: Parameters<ReturnType<typeof useLocalize>['translate']>[0];
};

const FEATURE_ROWS = [
    {part: 'overview', labelKey: 'workspace.common.profile'},
    {part: 'members', labelKey: 'workspace.common.members'},
    {part: 'reports', labelKey: 'workspace.common.reports'},
    {part: 'accounting', labelKey: 'workspace.common.accounting'},
    {part: 'categories', labelKey: 'workspace.common.categories'},
    {part: 'tags', labelKey: 'workspace.common.tags'},
    {part: 'taxes', labelKey: 'workspace.common.taxes'},
    {part: 'workflows', labelKey: 'workspace.common.workflows'},
    {part: 'rules', labelKey: 'workspace.common.rules'},
    {part: 'distanceRates', labelKey: 'workspace.common.distanceRates'},
    {part: 'perDiem', labelKey: 'workspace.common.perDiem'},
    {part: 'invoices', labelKey: 'workspace.common.invoices'},
    {part: 'travel', labelKey: 'workspace.common.travel'},
] as const satisfies readonly FeatureRow[];

function CopyPolicySettingsSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.SELECT_FEATURES>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettings?.targetPolicyIDs ?? [];

    const targetPolicies = useMemo(() => targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).filter(Boolean), [targetPolicyIDs, policies]);

    const isAccountingCompatible = useMemo(() => areAllTargetsAccountingCompatible(sourcePolicy, targetPolicies), [sourcePolicy, targetPolicies]);

    const [selectedParts, setSelectedParts] = useState<readonly Part[]>([]);

    const isAccountingSelected = selectedParts.includes('accounting');

    // Force-enabled parts cannot be toggled off while accounting is selected.
    const effectiveSelectedParts = useMemo(() => {
        if (!isAccountingSelected) {
            return selectedParts;
        }
        const next = new Set<Part>(selectedParts);
        for (const part of ACCOUNTING_FORCE_ENABLED_PARTS) {
            next.add(part);
        }
        return Array.from(next);
    }, [selectedParts, isAccountingSelected]);

    const isPartDisabled = useCallback(
        (part: Part) => {
            if (isAccountingSelected && (ACCOUNTING_FORCE_ENABLED_PARTS as readonly Part[]).includes(part)) {
                return true;
            }
            if (!isAccountingCompatible && (ACCOUNTING_DEPENDENT_PARTS as readonly Part[]).includes(part)) {
                return true;
            }
            return false;
        },
        [isAccountingSelected, isAccountingCompatible],
    );

    const listItems: ListItem[] = useMemo(
        () =>
            FEATURE_ROWS.map((row) => ({
                text: translate(row.labelKey),
                keyForList: row.part,
                isSelected: effectiveSelectedParts.includes(row.part),
                isDisabled: isPartDisabled(row.part),
                isDisabledCheckbox: isPartDisabled(row.part),
            })),
        [translate, effectiveSelectedParts, isPartDisabled],
    );

    const togglePart = useCallback(
        (item: ListItem) => {
            const part = item.keyForList as Part | undefined;
            if (!part || isPartDisabled(part)) {
                return;
            }
            setSelectedParts((prev) => (prev.includes(part) ? prev.filter((selectedPart) => selectedPart !== part) : [...prev, part]));
        },
        [isPartDisabled],
    );

    const selectableParts = useMemo<Part[]>(() => FEATURE_ROWS.filter((row) => !isPartDisabled(row.part)).map((row) => row.part), [isPartDisabled]);

    const toggleAll = useCallback(() => {
        const selectableSet = new Set(selectableParts);
        setSelectedParts((prev) => {
            const allSelected = selectableParts.every((part) => prev.includes(part));
            if (allSelected) {
                // Deselect selectable parts, keep any disabled-but-selected parts as-is (none exist today).
                return prev.filter((part) => !selectableSet.has(part));
            }
            return Array.from(new Set([...prev, ...selectableParts]));
        });
    }, [selectableParts]);

    const commitAndNavigate = useCallback(() => {
        if (!sourcePolicyID) {
            return;
        }
        setCopyPolicySettingsData({parts: effectiveSelectedParts.slice()});
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID));
    }, [sourcePolicyID, effectiveSelectedParts]);

    const onConfirm = useCallback(() => {
        const isWorkflowsSelected = effectiveSelectedParts.includes('workflows');
        const isMembersSelected = effectiveSelectedParts.includes('members');

        if (!isWorkflowsSelected || isMembersSelected) {
            commitAndNavigate();
            return;
        }
        showConfirmModal({
            title: translate('workspace.copyPolicySettings.workflowsWithoutMembersTitle'),
            prompt: translate('workspace.copyPolicySettings.workflowsWithoutMembersPrompt'),
            confirmText: translate('common.continue'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            commitAndNavigate();
        });
    }, [effectiveSelectedParts, commitAndNavigate, showConfirmModal, translate]);

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = useMemo(
        () => ({
            showButton: true,
            text: translate('common.next'),
            onConfirm,
            isDisabled: effectiveSelectedParts.length === 0,
        }),
        [translate, onConfirm, effectiveSelectedParts.length],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={sourcePolicyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={CopyPolicySettingsSelectFeaturesPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.copyPolicySettings.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectFeatures')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.whichFeatures')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <SelectionList
                        data={listItems}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={togglePart}
                        onSelectAll={selectableParts.length > 0 ? toggleAll : undefined}
                        shouldSingleExecuteRowSelect
                        addBottomSafeAreaPadding
                        confirmButtonOptions={confirmButtonOptions}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsSelectFeaturesPage.displayName = 'CopyPolicySettingsSelectFeaturesPage';

export default CopyPolicySettingsSelectFeaturesPage;
