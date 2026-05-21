import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {areAllTargetsAccountingCompatible, areAllTargetsCompatibleForAccountingPart, FEATURE_ROWS, isCopyPolicySettingsPartEnabledOnSource} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDistanceRateCustomUnit, getMemberAccountIDsForWorkspace, getPerDiemCustomUnit, isCollectPolicy} from '@libs/PolicyUtils';
import {formatAddressToString} from '@libs/ReportActionsUtils';
import {getReportFieldsByPolicyID} from '@libs/ReportUtils';
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

/**
 * Selecting accounting also copies coding settings; these parts are auto-selected with accounting.
 */
const ACCOUNTING_FORCE_ENABLED_PARTS = CODING_PARTS_TIED_TO_CONNECTION;

function CopyPolicySettingsSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.SELECT_FEATURES>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
    const categoriesCount = Object.values(policyCategories ?? {}).filter((c) => c.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const totalTags = policyTags
        ? Object.values(policyTags).reduce((sum, tagGroup) => sum + Object.values(tagGroup.tags).filter((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length, 0)
        : 0;
    const taxesCount = Object.values(sourcePolicy?.taxRates?.taxes ?? {}).filter((tax) => tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const reportFieldsCount = Object.values(getReportFieldsByPolicyID(sourcePolicyID) ?? {}).filter((field) => field.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const connectedIntegration = getAllValidConnectedIntegration(sourcePolicy, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const distanceRatesCount = Object.values(getDistanceRateCustomUnit(sourcePolicy)?.rates ?? {}).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const perDiemRates = getPerDiemCustomUnit(sourcePolicy)?.rates ?? {};
    const perDiemCount = Object.values(perDiemRates).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const formattedAddress = !isEmptyObject(sourcePolicy) && !isEmptyObject(sourcePolicy.address) ? formatAddressToString(sourcePolicy.address) : '';
    const workflows = getWorkflowRules(sourcePolicy, translate);
    const rules = getWorkspaceRules(sourcePolicy, translate);
    const invoiceCompany =
        sourcePolicy?.invoice?.companyName && sourcePolicy?.invoice?.companyWebsite
            ? `${sourcePolicy.invoice.companyName}, ${sourcePolicy.invoice.companyWebsite}`
            : (sourcePolicy?.invoice?.companyName ?? sourcePolicy?.invoice?.companyWebsite ?? '');

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
        hasInvoiceConfiguration: !!(bankAccountList && Object.keys(bankAccountList).length) || !!invoiceCompany,
        isCollectPolicy: isCollectPolicy(sourcePolicy),
    };

    const isPartVisible = (part: Part): boolean => {
        if (part === 'accounting' && !isAccountingPartCompatible) {
            return true;
        }
        if (!isCodingCompatible && (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part)) {
            return true;
        }
        return isCopyPolicySettingsPartEnabledOnSource(part, sourceFeatureContext);
    };

    const availableFeatureRows = FEATURE_ROWS.filter((row) => isPartVisible(row.part));
    const availablePartSet = new Set(availableFeatureRows.map((row) => row.part));

    const [selectedFeatures, setSelectedFeatures] = useState<readonly Part[]>([]);

    useEffect(() => {
        if (!copyPolicySettings?.parts) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedFeatures(copyPolicySettings.parts as Part[]);
    }, [copyPolicySettings?.parts]);

    const selectedAvailableFeatures = selectedFeatures.filter((part) => availablePartSet.has(part));
    const isAccountingSelected = selectedAvailableFeatures.includes('accounting');

    const effectiveSelectedFeatures = isAccountingSelected
        ? Array.from(new Set<Part>([...selectedAvailableFeatures, ...ACCOUNTING_FORCE_ENABLED_PARTS.filter((part) => availablePartSet.has(part))]))
        : selectedAvailableFeatures;

    const isFeatureDisabled = (part: Part): boolean => {
        if (part === 'accounting' && !isAccountingPartCompatible) {
            return true;
        }
        if (!isCodingCompatible && (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part)) {
            return true;
        }
        if (isAccountingSelected && (ACCOUNTING_FORCE_ENABLED_PARTS as readonly Part[]).includes(part)) {
            return true;
        }
        return false;
    };

    const isAccountingMismatch = (part: Part): boolean => {
        if (part === 'accounting') {
            return !isAccountingPartCompatible;
        }
        return !isCodingCompatible && (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part);
    };

    const getSourceDescription = (part: Part): string | undefined => {
        switch (part) {
            case 'overview': {
                const currencyText = sourcePolicy?.outputCurrency ? `${sourcePolicy.outputCurrency} ${translate('common.currency')}` : '';
                return [currencyText, formattedAddress].filter(Boolean).join(', ') || undefined;
            }
            case 'members':
                return memberCount > 1 ? `${memberCount} ${translate('workspace.common.members').toLowerCase()}` : undefined;
            case 'reports':
                return reportFieldsCount > 0 ? `${reportFieldsCount} ${translate('workspace.common.reportFields').toLowerCase()}` : undefined;
            case 'accounting':
                return connectedIntegration?.length ? connectedIntegration.map((name) => CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[name]).join(', ') : undefined;
            case 'categories':
                return categoriesCount > 0 ? `${categoriesCount} ${translate('workspace.common.categories').toLowerCase()}` : undefined;
            case 'tags':
                return totalTags > 0 ? `${totalTags} ${translate('workspace.common.tags').toLowerCase()}` : undefined;
            case 'taxes':
                return taxesCount > 0 ? `${taxesCount} ${translate('workspace.common.taxes').toLowerCase()}` : undefined;
            case 'workflows':
                return workflows?.join(', ');
            case 'rules':
                return rules?.length
                    ? `${rules.length} ${translate('workspace.common.workspace').toLowerCase()} ${translate('workspace.common.rules').toLowerCase()}: ${rules.join(', ')}`
                    : undefined;
            case 'distanceRates':
                return distanceRatesCount > 0 ? `${distanceRatesCount} ${translate('iou.rates').toLowerCase()}` : undefined;
            case 'perDiem':
                return perDiemCount > 0 ? `${perDiemCount} ${translate('workspace.common.perDiem').toLowerCase()}` : undefined;
            case 'invoices': {
                const bankCount = bankAccountList ? Object.keys(bankAccountList).length : 0;
                if (bankCount > 0 && invoiceCompany) {
                    return `${bankCount} ${translate('common.bankAccounts').toLowerCase()}, ${invoiceCompany}`;
                }
                return invoiceCompany || undefined;
            }
            default:
                return undefined;
        }
    };

    const getAlternateText = (part: Part): string | undefined => {
        if (isAccountingMismatch(part)) {
            return translate('workspace.copyPolicySettings.accountingMismatch', {
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
            if (prev.includes(part)) {
                return prev.filter((selectedPart) => selectedPart !== part);
            }
            return [...prev, part];
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

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.next'),
        onConfirm: saveAndNavigate,
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
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectFeatures')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.whichFeatures')}</Text>
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
