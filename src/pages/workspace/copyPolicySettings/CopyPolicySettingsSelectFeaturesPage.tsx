import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
import {openDuplicatePolicyPage} from '@libs/actions/Policy/Policy';
import {areAllTargetsAccountingCompatible, areAllTargetsCompatibleForAccountingPart, FEATURE_ROWS, isCopyPolicySettingsPartEnabledOnSource} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDistanceRateCustomUnit, getMemberAccountIDsForWorkspace, getPerDiemCustomUnit, isCollectPolicy} from '@libs/PolicyUtils';
import {formatAddressToString} from '@libs/ReportActionsUtils';
import {getReportFieldsByPolicyID} from '@libs/ReportUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {getAllValidConnectedIntegration, getWorkflowRules, getWorkspaceRules} from '@pages/workspace/duplicate/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * Coding parts whose IDs are tied to the target's existing accounting connection.
 * When any of these are copied without "accounting", source and every target must already share the same connection (or all be unconnected).
 */
const CODING_PARTS_TIED_TO_CONNECTION = ['categories', 'tags', 'reports', 'taxes'] as const satisfies readonly Part[];

const isCodingPart = (part: Part): boolean => (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part);

function CopyPolicySettingsSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.SELECT_FEATURES>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${sourcePolicyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${sourcePolicyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettings?.targetPolicyIDs ?? [];

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]);

    const isCodingCompatible = areAllTargetsAccountingCompatible(sourcePolicy, targetPolicies);
    const isAccountingPartCompatible = areAllTargetsCompatibleForAccountingPart(sourcePolicy, targetPolicies);

    const memberCount = Object.keys(getMemberAccountIDsForWorkspace(sourcePolicy?.employeeList, false, false)).length;
    const categoriesCount = Object.values(policyCategories ?? {}).filter((c) => c?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const totalTags = policyTags
        ? Object.values(policyTags).reduce(
              (sum, tagGroup) => sum + Object.values(tagGroup?.tags ?? {}).filter((tag) => tag?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length,
              0,
          )
        : 0;
    const taxesCount = Object.values(sourcePolicy?.taxRates?.taxes ?? {}).filter((tax) => tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const reportFieldsCount = Object.values(getReportFieldsByPolicyID(sourcePolicy) ?? {}).filter((field) => field.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const codingRulesCount = Object.values(sourcePolicy?.rules?.codingRules ?? {}).filter((rule) => rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const connectedIntegration = getAllValidConnectedIntegration(sourcePolicy, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const distanceRatesCount = Object.values(getDistanceRateCustomUnit(sourcePolicy)?.rates ?? {}).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const perDiemRates = getPerDiemCustomUnit(sourcePolicy)?.rates ?? {};
    const perDiemCount = Object.values(perDiemRates).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const formattedAddress = !isEmptyObject(sourcePolicy) && !isEmptyObject(sourcePolicy.address) ? formatAddressToString(sourcePolicy.address) : '';
    const workflows = getWorkflowRules(sourcePolicy, translate);
    const rules = getWorkspaceRules(sourcePolicy, translate);
    const invoiceCompany = [sourcePolicy?.invoice?.companyName, sourcePolicy?.invoice?.companyWebsite].filter(Boolean).join(', ');

    const workspaceBankAccountsCount = getEligibleExistingBusinessBankAccounts(bankAccountList, sourcePolicy?.outputCurrency).length;

    const sourceFeatureContext = {
        policy: sourcePolicy,
        memberCount,
        categoriesCount,
        totalTags,
        reportFieldsCount,
        taxesCount,
        distanceRatesCount,
        perDiemCount,
        connectedIntegrationCount: connectedIntegration?.length ?? 0,
        hasWorkflowRules: !!workflows?.length,
        hasWorkspaceRules: !!rules?.length,
        codingRulesCount,
        hasInvoiceConfiguration: (!!sourcePolicy?.areInvoicesEnabled && workspaceBankAccountsCount > 0) || !!invoiceCompany,
        isCollectPolicy: isCollectPolicy(sourcePolicy),
    };

    useEffect(() => {
        if (!sourcePolicyID) {
            return;
        }
        openDuplicatePolicyPage(sourcePolicyID);
    }, [sourcePolicyID]);

    const isPartIncompatible = (part: Part): boolean => {
        if (part === CONST.POLICY.POLICY_FEATURE.ACCOUNTING) {
            return !isAccountingPartCompatible;
        }
        if (isCodingPart(part)) {
            return !isCodingCompatible;
        }
        return false;
    };

    const availableFeatureRows = FEATURE_ROWS.filter((row) => isCopyPolicySettingsPartEnabledOnSource(row.part, sourceFeatureContext));
    const availablePartSet = new Set(availableFeatureRows.map((row) => row.part));

    const [selectedFeatures, setSelectedFeatures] = useState<readonly Part[] | null>(null);
    const resolvedSelectedFeatures = selectedFeatures ?? (copyPolicySettings?.parts as Part[] | undefined) ?? [];
    const selectedAvailableFeatures = resolvedSelectedFeatures.filter((part) => availablePartSet.has(part) && !isPartIncompatible(part));
    const isAccountingSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.ACCOUNTING);

    const effectiveSelectedFeatures = isAccountingSelected
        ? Array.from(new Set<Part>([...selectedAvailableFeatures, ...CODING_PARTS_TIED_TO_CONNECTION.filter((part) => availablePartSet.has(part))]))
        : selectedAvailableFeatures;

    const isFeatureDisabled = (part: Part): boolean => isPartIncompatible(part) || (isAccountingSelected && isCodingPart(part));

    const getSourceDescription = (part: Part): string | undefined => {
        switch (part) {
            case CONST.POLICY.POLICY_FEATURE.OVERVIEW: {
                const currencyText = sourcePolicy?.outputCurrency ? `${sourcePolicy.outputCurrency} ${translate('common.currency')}` : '';
                return [currencyText, formattedAddress].filter(Boolean).join(', ') || undefined;
            }
            case CONST.POLICY.POLICY_FEATURE.MEMBERS:
                return memberCount > 1 ? `${memberCount} ${translate('workspace.common.members').toLowerCase()}` : undefined;
            case 'reports':
                return reportFieldsCount > 0 ? `${reportFieldsCount} ${translate('workspace.common.reportFields').toLowerCase()}` : undefined;
            case CONST.POLICY.POLICY_FEATURE.ACCOUNTING:
                return connectedIntegration?.length ? connectedIntegration.map((name) => CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[name]).join(', ') : undefined;
            case CONST.POLICY.POLICY_FEATURE.CATEGORIES:
                return categoriesCount > 0 ? `${categoriesCount} ${translate('workspace.duplicateWorkspace.categories').toLowerCase()}` : undefined;
            case CONST.POLICY.POLICY_FEATURE.TAGS:
                return totalTags > 0 ? `${totalTags} ${translate('workspace.common.tags').toLowerCase()}` : undefined;
            case CONST.POLICY.POLICY_FEATURE.TAXES:
                return taxesCount > 0 ? `${taxesCount} ${translate('workspace.common.taxes').toLowerCase()}` : undefined;
            case CONST.POLICY.POLICY_FEATURE.WORKFLOWS:
                return workflows?.join(', ');
            case CONST.POLICY.POLICY_FEATURE.RULES:
                return rules?.length
                    ? `${rules.length} ${translate('workspace.common.workspace').toLowerCase()} ${translate('workspace.common.rules').toLowerCase()}: ${rules.join(', ')}`
                    : undefined;
            case 'codingRules':
                return codingRulesCount > 0 ? translate('workspace.duplicateWorkspace.merchantRulesCount', {count: codingRulesCount}) : undefined;
            case 'distanceRates':
                return distanceRatesCount > 0 ? `${distanceRatesCount} ${translate('iou.rates').toLowerCase()}` : undefined;
            case 'perDiem':
                return perDiemCount > 0 ? `${perDiemCount} ${translate('workspace.common.perDiem').toLowerCase()}` : undefined;
            case 'invoices': {
                const bankAccountsText = workspaceBankAccountsCount > 0 ? `${workspaceBankAccountsCount} ${translate('common.bankAccounts').toLowerCase()}` : '';
                if (bankAccountsText && invoiceCompany) {
                    return `${bankAccountsText}, ${invoiceCompany}`;
                }
                return bankAccountsText || invoiceCompany || undefined;
            }
            default:
                return undefined;
        }
    };

    const isAccountingMismatch = (part: Part): boolean => {
        if (part === CONST.POLICY.POLICY_FEATURE.ACCOUNTING) {
            return !isAccountingPartCompatible;
        }
        // When accounting is selected, the connection mismatch will be resolved by the copy.
        if (isAccountingSelected) {
            return false;
        }
        return !isCodingCompatible && isCodingPart(part);
    };

    const getAlternateText = (part: Part): string | undefined => {
        if (isAccountingMismatch(part)) {
            return translate('workspace.copyPolicySettings.selectSettings.accountingMismatch', {
                part: translate(FEATURE_ROWS.find((row) => row.part === part)?.labelKey ?? 'workspace.common.accounting').toLowerCase(),
            });
        }
        return getSourceDescription(part);
    };

    const listItems: ListItem[] = availableFeatureRows.map((row) => {
        const isDisabled = isFeatureDisabled(row.part);
        const isSelected = effectiveSelectedFeatures.includes(row.part);
        const alternateText = getAlternateText(row.part);

        return {
            text: translate(row.labelKey),
            keyForList: row.part,
            isSelected,
            isDisabled,
            isDisabledCheckbox: isDisabled,
            alternateText: alternateText?.trim().replace(/,\s*$/, ''),
        };
    });

    const selectableFeatures: Part[] = availableFeatureRows.filter((row) => !isFeatureDisabled(row.part)).map((row) => row.part);

    const toggleFeature = (item: ListItem) => {
        const part = item.keyForList as Part | undefined;
        if (!part || isFeatureDisabled(part)) {
            return;
        }
        setSelectedFeatures((prev) => {
            const current = prev ?? resolvedSelectedFeatures;
            if (current.includes(part)) {
                return current.filter((selectedPart) => selectedPart !== part);
            }
            return [...current, part];
        });
    };

    const toggleAll = () => {
        const allSelected = selectableFeatures.every((part) => selectedAvailableFeatures.includes(part));
        if (allSelected) {
            setSelectedFeatures([]);
            return;
        }
        setSelectedFeatures(Array.from(new Set([...selectedAvailableFeatures, ...selectableFeatures])));
    };

    const saveAndNavigate = () => {
        if (!sourcePolicyID) {
            return;
        }
        setCopyPolicySettingsData({parts: effectiveSelectedFeatures.slice()});
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID));
    };

    const onConfirm = () => {
        const isWorkflowsSelected = effectiveSelectedFeatures.includes(CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
        const isMembersSelected = effectiveSelectedFeatures.includes(CONST.POLICY.POLICY_FEATURE.MEMBERS);
        const isMembersPartAvailable = availablePartSet.has(CONST.POLICY.POLICY_FEATURE.MEMBERS);

        if (!isWorkflowsSelected || isMembersSelected || !isMembersPartAvailable) {
            saveAndNavigate();
            return;
        }
        showConfirmModal({
            title: translate('common.headsUp'),
            prompt: translate('workspace.copyPolicySettings.confirmWorkflows.description'),
            confirmText: translate('workspace.copyPolicySettings.confirmWorkflows.continue'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            saveAndNavigate();
        });
    };

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.next'),
        onConfirm,
        isDisabled: effectiveSelectedFeatures.length === 0,
    };

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
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectSettings.title')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.selectSettings.description')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <SelectionList
                        data={listItems}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        alternateNumberOfSupportedLines={2}
                        onSelectRow={toggleFeature}
                        onSelectAll={selectableFeatures.length > 0 ? toggleAll : undefined}
                        selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.RIGHT}
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
