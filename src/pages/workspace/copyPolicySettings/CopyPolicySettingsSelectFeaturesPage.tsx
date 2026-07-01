import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
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
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import {createFilteredMemberCountSelector, createInvoiceConfigurationTextSelector, getDistanceRateCustomUnit, getPerDiemCustomUnit, isCollectPolicy} from '@libs/PolicyUtils';
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

const isCodingPart = (part: Part): boolean => (CODING_PARTS_TIED_TO_CONNECTION as readonly Part[]).includes(part);

type FeatureListItem = ListItem & {
    keyForList: Part;
};

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
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettings?.targetPolicyIDs ?? [];

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]);

    const isCodingCompatible = areAllTargetsAccountingCompatible(sourcePolicy, targetPolicies);
    const isAccountingPartCompatible = areAllTargetsCompatibleForAccountingPart(sourcePolicy, targetPolicies);

    // Provisioning a target for travel creates a Spotnana entity, which requires a company address.
    // The source address only reaches a target when "overview" is also copied, so without overview a
    // target that lacks an address can't be provisioned.
    const sourceHasAddress = !isEmptyObject(sourcePolicy?.address);
    const hasTargetWithoutAddress = targetPolicies.some((policy) => isEmptyObject(policy?.address));

    const [memberCount = 0] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: createFilteredMemberCountSelector(sourcePolicy?.employeeList, sourcePolicy?.owner, currentUserPersonalDetails.login),
    });
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
    const reportFieldsCount = Object.values(getReportFieldsByPolicyID(sourcePolicy) ?? {}).filter((field) => field.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const codingRulesCount = Object.values(sourcePolicy?.rules?.codingRules ?? {}).filter((rule) => rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const connectedIntegration = getAllValidConnectedIntegration(sourcePolicy, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const distanceRatesCount = Object.values(getDistanceRateCustomUnit(sourcePolicy)?.rates ?? {}).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const perDiemRates = getPerDiemCustomUnit(sourcePolicy)?.rates ?? {};
    const perDiemCount = Object.values(perDiemRates).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    const formattedAddress = !isEmptyObject(sourcePolicy) && !isEmptyObject(sourcePolicy.address) ? formatAddressToString(sourcePolicy.address) : '';
    const workflows = getWorkflowRules(sourcePolicy, translate);
    const rules = getWorkspaceRules(sourcePolicy, translate);
    const shouldShowCurrency = hasCurrencyConflictWithAnyTarget(sourcePolicy, targetPolicies);
    const currencyBlockedByBA = isCurrencyBlockedByTargetBA(sourcePolicy, targetPolicies);
    const currencyNeededForWorkflows = needsCurrencyForWorkflows(sourcePolicy, targetPolicies);
    const hasOverviewContent = !!formattedAddress || !!sourcePolicy?.description;

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
        hasInvoiceConfiguration: !!sourcePolicy?.areInvoicesEnabled && !!invoiceConfigurationText,
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
        // Travel needs a company address on every target. When the source has no address either,
        // copying "overview" can't supply one, so travel can never be provisioned - hard-disable it.
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
    const resolvedSelectedFeatures = selectedFeatures ?? copyPolicySettings?.parts ?? [];
    const selectedAvailableFeatures = resolvedSelectedFeatures.filter((part) => availablePartSet.has(part) && !isPartIncompatible(part));
    const isAccountingSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const isWorkflowsSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const isOverviewSelected = selectedAvailableFeatures.includes(CONST.POLICY.POLICY_FEATURE.OVERVIEW);

    const effectiveSelectedFeatures = isAccountingSelected
        ? Array.from(new Set<Part>([...selectedAvailableFeatures, ...CODING_PARTS_TIED_TO_CONNECTION.filter((part) => availablePartSet.has(part))]))
        : selectedAvailableFeatures;

    const shouldIncludeCurrency = effectiveSelectedFeatures.length > 0 && !isPartIncompatible('currency') && (!shouldShowCurrency || (isWorkflowsSelected && currencyNeededForWorkflows));
    if (shouldIncludeCurrency && !effectiveSelectedFeatures.includes('currency')) {
        effectiveSelectedFeatures.push('currency');
    }

    // Travel needs every target to have a company address. The source address only reaches a target
    // when "overview" is copied, so when a target lacks one require overview (and a source address to
    // copy). isPartIncompatible already hard-disables the case where the source has no address.
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
            case 'invoices':
                return invoiceConfigurationText || undefined;
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

    const saveAndNavigate = () => {
        if (!sourcePolicyID) {
            return;
        }
        setCopyPolicySettingsData({parts: effectiveSelectedFeatures.slice()}).then(() => {
            Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID));
        });
    };

    const onConfirm = () => {
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
                    onBackButtonPress={() => Navigation.goBack(sourcePolicyID ? ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID) : undefined)}
                />
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectSettings.title')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.selectSettings.description')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <View style={[styles.searchListHeaderContainerStyle, styles.pv3, styles.ph5, styles.flexRow, styles.alignItemsCenter]}>
                        <Checkbox
                            accessibilityLabel={translate('accessibilityHints.selectAllFeatures')}
                            isChecked={selectableFeatures.length > 0 && selectableFeatures.every((part) => selectedAvailableFeatures.includes(part))}
                            isIndeterminate={selectedAvailableFeatures.length > 0 && selectedAvailableFeatures.length < selectableFeatures.length}
                            onPress={toggleAll}
                            disabled={selectableFeatures.length === 0}
                            shouldSelectOnPressEnter
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={toggleAll}
                            accessible={false}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            tabIndex={-1}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COPY_SETTINGS_SELECT_FEATURES_SELECT_ALL}
                        >
                            <Text style={[styles.textLabelSupporting, styles.ph3]}>{translate('workspace.common.selectAll')}</Text>
                        </PressableWithFeedback>
                    </View>
                    <SelectionList
                        data={listItems}
                        shouldSingleExecuteRowSelect
                        ListItem={MultiSelectListItem}
                        onSelectRow={toggleFeature}
                        alternateNumberOfSupportedLines={2}
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
