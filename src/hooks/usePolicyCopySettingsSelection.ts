import type {ListItem} from '@components/SelectionList/types';

import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {openDuplicatePolicyPage} from '@libs/actions/Policy/Policy';
import {
    areAllTargetsAccountingCompatible,
    areAllTargetsCompatibleForAccountingPart,
    FEATURE_ROWS,
    getReceiptPartnersCopySettingsDescription,
    getTimeTrackingCopySettingsDescription,
    hasCurrencyConflictWithAnyTarget,
    isCopyPolicySettingsPartEnabledOnSource,
    isCurrencyBlockedByTargetBA,
    needsCurrencyForWorkflows,
} from '@libs/CopyPolicySettingsUtils';
import {
    createFilteredMemberCountSelector,
    createInvoiceConfigurationTextSelector,
    getDistanceRateCustomUnit,
    getPerDiemCustomUnit,
    isCollectPolicy,
    isInvoiceFieldsEnabled,
} from '@libs/PolicyUtils';
import {formatAddressToString} from '@libs/ReportActionsUtils';
import {getReportFieldsByPolicyID} from '@libs/ReportUtils';

import {getAllValidConnectedIntegration, getWorkflowRules, getWorkspaceRules} from '@pages/workspace/duplicate/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {createExpenseDefaultRuleCountSelector} from '@selectors/Rule';
import {useEffect, useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import {usePersonalDetailsByLogins} from './usePersonalDetailByLogin';
import {useAllPersonalDetails} from './usePersonalDetails';
import useRulesPrefetch from './useRulesPrefetch';

/** Coding IDs must match the target accounting connection unless Accounting is also copied. */
const CODING_PARTS_TIED_TO_CONNECTION = ['categories', 'tags', 'reports', 'taxes'] as const satisfies readonly Part[];

const isCodingPart = (part: Part): boolean => (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part);

type FeatureListItem = ListItem & {
    keyForList: Part;
};

/** Shares settings selection between copy and duplicate. */
function usePolicyCopySettingsSelection(sourcePolicy: Policy | undefined, targetPolicies: Array<Policy | undefined>, initialParts?: readonly Part[], isNewPolicy = false) {
    const sourcePolicyID = sourcePolicy?.id;
    const {translate} = useLocalize();
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${sourcePolicyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${sourcePolicyID}`);
    const [codingRulesCount = 0] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: createExpenseDefaultRuleCountSelector(sourcePolicyID)});
    useRulesPrefetch();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isCodingCompatible = isNewPolicy || areAllTargetsAccountingCompatible(sourcePolicy, targetPolicies);
    const isAccountingPartCompatible = isNewPolicy || areAllTargetsCompatibleForAccountingPart(sourcePolicy, targetPolicies);

    // Targets without an address need Overview copied before Travel can be set up.
    const sourceHasAddress = !isEmptyObject(sourcePolicy?.address);
    const hasTargetWithoutAddress = targetPolicies.some((policy) => isEmptyObject(policy?.address));

    const sourceEmployeePersonalDetails = usePersonalDetailsByLogins(Object.keys(sourcePolicy?.employeeList ?? {}));
    const [memberCount = 0] = useAllPersonalDetails(
        createFilteredMemberCountSelector(sourcePolicy?.employeeList, sourcePolicy?.owner, currentUserPersonalDetails.login, sourceEmployeePersonalDetails),
    );
    const invoiceCompany = [sourcePolicy?.invoice?.companyName, sourcePolicy?.invoice?.companyWebsite].filter(Boolean).join(', ');
    const [invoiceConfigurationText = ''] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: createInvoiceConfigurationTextSelector(translate, invoiceCompany),
    });
    const categoriesCount = Object.values(policyCategories ?? {}).filter((c) => c?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const totalTags = policyTags
        ? Object.values(policyTags).reduce(
              (sum, tagGroup) => sum + Object.values(tagGroup?.tags ?? {}).filter((tag) => tag?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length,
              0,
          )
        : 0;
    const taxesCount = Object.values(sourcePolicy?.taxRates?.taxes ?? {}).filter((tax) => tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const policyFields = Object.values(getReportFieldsByPolicyID(sourcePolicy) ?? {}).filter((field) => field.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportFieldsCount = policyFields.filter((field) => field.target !== CONST.REPORT_FIELD_TARGETS.INVOICE).length;
    const invoiceFieldsCount = policyFields.filter((field) => field.target === CONST.REPORT_FIELD_TARGETS.INVOICE).length;
    const connectedIntegration = getAllValidConnectedIntegration(sourcePolicy, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const distanceRatesCount = Object.values(getDistanceRateCustomUnit(sourcePolicy)?.rates ?? {}).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const perDiemRates = getPerDiemCustomUnit(sourcePolicy)?.rates ?? {};
    const perDiemCount = Object.values(perDiemRates).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const formattedAddress = !isEmptyObject(sourcePolicy) && !isEmptyObject(sourcePolicy.address) ? formatAddressToString(sourcePolicy.address) : '';
    const workflows = getWorkflowRules(sourcePolicy, translate);
    const rules = getWorkspaceRules(sourcePolicy, translate, policyCategories);
    const shouldShowCurrency = isNewPolicy || hasCurrencyConflictWithAnyTarget(sourcePolicy, targetPolicies);
    const currencyBlockedByBA = isCurrencyBlockedByTargetBA(sourcePolicy, targetPolicies);
    const currencyNeededForWorkflows = needsCurrencyForWorkflows(sourcePolicy, targetPolicies);
    const hasOverviewContent = !!formattedAddress || !!sourcePolicy?.description || !!sourcePolicy?.rulesDocumentURL;

    const sourceFeatureContext = {
        policy: sourcePolicy,
        hasOverviewContent,
        shouldShowCurrency,
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
        hasInvoiceConfiguration: !!sourcePolicy?.areInvoicesEnabled && (!!invoiceConfigurationText || invoiceFieldsCount > 0 || isInvoiceFieldsEnabled(sourcePolicy)),
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
        if (part === 'travel') {
            return hasTargetWithoutAddress && !sourceHasAddress;
        }
        if (part === 'currency') {
            return currencyBlockedByBA;
        }
        return false;
    };

    const availableFeatureRows = FEATURE_ROWS.filter((row) => isCopyPolicySettingsPartEnabledOnSource(row.part, sourceFeatureContext));
    const availablePartSet = new Set(availableFeatureRows.map((row) => row.part));

    const [selectedFeatures, setSelectedFeatures] = useState<readonly Part[] | null>(null);
    const resolvedSelectedFeatures = selectedFeatures ?? initialParts ?? availableFeatureRows.map((row) => row.part);
    const selectedAvailableFeatures = resolvedSelectedFeatures.filter((part) => availablePartSet.has(part) && !isPartIncompatible(part));
    const isAccountingSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const isWorkflowsSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const isOverviewSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.OVERVIEW);

    const effectiveSelectedFeatures = (
        isAccountingSelected
            ? Array.from(new Set<Part>([...selectedAvailableFeatures, ...CODING_PARTS_TIED_TO_CONNECTION.filter((part) => availablePartSet.has(part))]))
            : selectedAvailableFeatures
    ).filter((part) => part !== 'travel' || !hasTargetWithoutAddress || (isOverviewSelected && sourceHasAddress));

    const shouldIncludeCurrency = effectiveSelectedFeatures.length > 0 && !isPartIncompatible('currency') && isWorkflowsSelected && currencyNeededForWorkflows;
    if (shouldIncludeCurrency && !effectiveSelectedFeatures.includes('currency')) {
        effectiveSelectedFeatures.push('currency');
    }

    const isTravelAddressMismatch = (part: Part): boolean => part === 'travel' && hasTargetWithoutAddress && !(isOverviewSelected && sourceHasAddress);

    const shouldSelectCurrency = (part: Part): boolean => part === 'currency' && isWorkflowsSelected && currencyNeededForWorkflows && !currencyBlockedByBA;
    const isFeatureDisabled = (part: Part): boolean =>
        isPartIncompatible(part) || (isAccountingSelected && isCodingPart(part)) || isTravelAddressMismatch(part) || shouldSelectCurrency(part);

    const getSourceDescription = (part: Part): string | undefined => {
        switch (part) {
            case 'currency':
                return sourcePolicy?.outputCurrency ?? undefined;
            case CONST.POLICY.POLICY_FEATURE.OVERVIEW:
                return formattedAddress || undefined;
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
            case 'timeTracking':
                return getTimeTrackingCopySettingsDescription(sourcePolicy, translate);
            case 'receiptPartners':
                return getReceiptPartnersCopySettingsDescription(sourcePolicy, translate);
            case 'invoices': {
                const invoiceDetails = [invoiceConfigurationText, invoiceFieldsCount ? `${invoiceFieldsCount} ${translate('workspace.common.invoiceFields').toLowerCase()}` : '']
                    .filter(Boolean)
                    .join(', ');
                return invoiceDetails || undefined;
            }
            default:
                return undefined;
        }
    };

    const isAccountingMismatch = (part: Part): boolean => {
        if (part === CONST.POLICY.POLICY_FEATURE.ACCOUNTING) {
            return !isAccountingPartCompatible;
        }
        // Copying Accounting resolves the connection mismatch.
        if (isAccountingSelected) {
            return false;
        }
        return !isCodingCompatible && isCodingPart(part);
    };

    const getAlternateText = (part: Part): string | undefined => {
        if (isTravelAddressMismatch(part)) {
            return translate('workspace.copyPolicySettings.selectSettings.travelAddressMismatch');
        }
        if (part === 'currency' && currencyBlockedByBA) {
            return translate('workspace.copyPolicySettings.selectSettings.currencyBlockedByBankAccount');
        }
        if (isAccountingMismatch(part)) {
            return translate('workspace.copyPolicySettings.selectSettings.accountingMismatch', {
                part: translate(FEATURE_ROWS.find((row) => row.part === part)?.labelKey ?? 'workspace.common.accounting').toLowerCase(),
            });
        }
        return getSourceDescription(part);
    };

    const listItems: FeatureListItem[] = availableFeatureRows.map((row) => {
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

    const toggleFeature = (item: FeatureListItem) => {
        const part = item.keyForList;
        if (isFeatureDisabled(part)) {
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

    return {
        listItems,
        selectableFeatures,
        effectiveSelectedFeatures,
        selectedAvailableFeatures,
        availablePartSet,
        isWorkflowsSelected,
        toggleFeature,
        toggleAll,
        policyCategories,
        policyTags,
        memberCount,
        sourceEmployeePersonalDetails,
        currentUserPersonalDetails,
    };
}

export default usePolicyCopySettingsSelection;
