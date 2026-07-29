import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import type {ImportedMerchantRule} from '@libs/actions/Policy/Rules';
import {importMerchantRulesSpreadsheet} from '@libs/actions/Policy/Rules';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {escapeTagName} from '@libs/PolicyUtils';
import {trimTag} from '@libs/TagUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';
import type {ImportFinalModal} from '@src/types/onyx/ImportedSpreadsheet';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {CodingRule} from '@src/types/onyx/Policy';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';

/** Column roles that update the matched expense; at least one must be mapped alongside a merchant filter */
const ACTION_COLUMNS: string[] = [
    CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT,
    CONST.CSV_IMPORT_COLUMNS.CATEGORY,
    CONST.CSV_IMPORT_COLUMNS.TAG,
    CONST.CSV_IMPORT_COLUMNS.COMMENT,
    CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE,
    CONST.CSV_IMPORT_COLUMNS.BILLABLE,
];

/**
 * Serializes the importable fields of a rule so identical rules can be detected. Used to skip
 * spreadsheet rows that would recreate a rule the policy already has (e.g. the same spreadsheet
 * imported twice) as well as duplicate rows within the same spreadsheet.
 */
function getRuleContentKey(rule: Pick<CodingRule, 'filters' | 'merchant' | 'category' | 'tag' | 'comment' | 'reimbursable' | 'billable'>): string {
    return JSON.stringify([
        rule.filters.operator,
        rule.filters.right.toLowerCase(),
        rule.merchant ?? '',
        rule.category ?? '',
        rule.tag ?? '',
        rule.comment ?? '',
        rule.reimbursable ?? null,
        rule.billable ?? null,
    ]);
}

/**
 * Normalizes an imported tag cell into the encoding the manual "Add tag" flow stores.
 *
 * On a multi-level policy ":" separates levels, so the levels are trimmed and re-joined (e.g. "Parent: Child" →
 * "Parent:Child"), matching trimTag(levels.join(':')). Without this, the cell would be persisted verbatim and later
 * split into ["Parent", " Child"] on display, so the rule row would render "Parent, Child" and the tag field would
 * only resolve the first level.
 *
 * On a single-level policy the whole cell is one literal tag name, so its colons are escaped instead (e.g. "ab:cd" →
 * "ab\:cd"), matching how tag names are stored on the policy. Internal spaces are part of the name and are preserved.
 */
function normalizeImportedTag(tag: string, hasMultipleTagLists: boolean): string {
    if (!tag) {
        return '';
    }
    if (!hasMultipleTagLists) {
        return escapeTagName(tag);
    }
    return trimTag(
        getTagArrayFromName(tag)
            .map((level) => level.trim())
            .join(':'),
    );
}

/**
 * Policy category names are stored HTML-encoded while spreadsheet cells are plain text, so imported cells are
 * matched against decoded names and resolved back to the stored name the rule must reference.
 */
function buildImportedCategoryLookup(policyCategories: OnyxEntry<PolicyCategories>): Map<string, string> {
    const lookup = new Map<string, string>();
    for (const category of Object.values(policyCategories ?? {})) {
        if (!category.enabled || category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        lookup.set(getDecodedCategoryName(category.name).toLowerCase(), category.name);
    }
    return lookup;
}

/** Parses a CSV cell into a boolean, or undefined when the cell is empty or unrecognized so the field is left unset */
function parseCsvBooleanValue(raw: string | undefined): boolean | undefined {
    const trimmed = raw?.trim().toLowerCase() ?? '';
    if (['true', 'yes'].includes(trimmed)) {
        return true;
    }
    if (['false', 'no'].includes(trimmed)) {
        return false;
    }
    return undefined;
}

type ImportedMerchantRulesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_IMPORTED>;

function ImportedMerchantRulesPage({route}: ImportedMerchantRulesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingRules, setIsImportingRules] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    // Fetch categories if they're not loaded (e.g. after a cache clear) so imported category cells are
    // validated against the policy's real category list instead of an empty one
    const fetchPolicyCategories = useCallback(() => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    }, [policyID, policy?.areCategoriesEnabled, policyCategories]);

    useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyCategories();
        }, [fetchPolicyCategories]),
    );

    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('workspace.rules.merchantRules.importColumnMerchantIs'), value: CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS},
        {text: translate('workspace.rules.merchantRules.importColumnMerchantContains'), value: CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedMerchant'), value: CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedCategory'), value: CONST.CSV_IMPORT_COLUMNS.CATEGORY},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedTag'), value: CONST.CSV_IMPORT_COLUMNS.TAG},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedDescription'), value: CONST.CSV_IMPORT_COLUMNS.COMMENT},
        {text: translate('common.reimbursable'), value: CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE},
        {text: translate('common.billable'), value: CONST.CSV_IMPORT_COLUMNS.BILLABLE},
    ];

    const validate = () => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const hasMerchantFilterColumn = columns.includes(CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS) || columns.includes(CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS);
        const hasActionColumn = ACTION_COLUMNS.some((actionColumn) => columns.includes(actionColumn));

        if (!hasMerchantFilterColumn || !hasActionColumn) {
            errors.required = translate('spreadsheet.importMerchantRulesRequiredColumns');
        } else {
            const duplicate = findDuplicate(columns);
            const duplicateColumn = columnRoles.find((role) => role.value === duplicate);

            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', duplicateColumn.text);
            } else {
                errors = {};
            }
        }
        return errors;
    };

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingRules(false);
        Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
    };

    const importRules = async () => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const merchantIsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS);
        const merchantContainsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS);
        const updatedMerchantColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT);
        const categoryColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.CATEGORY);
        const tagColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.TAG);
        const commentColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.COMMENT);
        const reimbursableColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE);
        const billableColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.BILLABLE);

        const rowCount = (spreadsheet?.data.at(0)?.length ?? 0) - (containsHeader ? 1 : 0);
        const getCellValue = (columnIndex: number, rowIndex: number): string => {
            if (columnIndex === -1) {
                return '';
            }
            const dataIndex = containsHeader ? rowIndex + 1 : rowIndex;
            return spreadsheet?.data.at(columnIndex)?.at(dataIndex)?.toString().trim() ?? '';
        };

        // Seed the duplicate check with the policy's current rules so re-importing a spreadsheet doesn't recreate them
        const seenRuleKeys = new Set(
            Object.values(policy?.rules?.codingRules ?? {})
                .filter((rule) => rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && rule.filters?.right)
                .map(getRuleContentKey),
        );
        let skippedDuplicateCount = 0;

        const categoryLookup = buildImportedCategoryLookup(policyCategories);
        const invalidCategoryNames = new Set<string>();

        const rules: Record<string, ImportedMerchantRule> = {};
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            // "Merchant is" wins when both filter columns have a value for the same row
            const merchantIsValue = getCellValue(merchantIsColumn, rowIndex);
            const merchantToMatch = merchantIsValue || getCellValue(merchantContainsColumn, rowIndex);
            if (!merchantToMatch) {
                continue;
            }

            const updatedMerchant = getCellValue(updatedMerchantColumn, rowIndex);

            // A rule may only reference a category that exists on the workspace, so unknown cells are dropped
            // and reported in the final modal rather than stored as a category the rule could never apply
            const categoryCell = getCellValue(categoryColumn, rowIndex);
            const category = categoryCell ? (categoryLookup.get(categoryCell.toLowerCase()) ?? '') : '';
            if (categoryCell && !category) {
                invalidCategoryNames.add(categoryCell.toLowerCase());
            }
            const tag = normalizeImportedTag(getCellValue(tagColumn, rowIndex), !!policy?.hasMultipleTagLists);
            const comment = getCellValue(commentColumn, rowIndex);
            const reimbursable = parseCsvBooleanValue(getCellValue(reimbursableColumn, rowIndex));
            const billable = parseCsvBooleanValue(getCellValue(billableColumn, rowIndex));

            // Skip rows where every action cell is empty since the resulting rule would never change anything
            if (!updatedMerchant && !category && !tag && !comment && reimbursable === undefined && billable === undefined) {
                continue;
            }

            const rule: ImportedMerchantRule = {
                filters: {
                    left: 'merchant',
                    operator: merchantIsValue ? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO : CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
                    right: merchantToMatch,
                },
                ...(updatedMerchant && {merchant: updatedMerchant}),
                ...(category && {category}),
                ...(tag && {tag}),
                ...(comment && {comment: Parser.replace(comment)}),
                ...(reimbursable !== undefined && {reimbursable}),
                ...(billable !== undefined && {billable}),
                created: new Date().toISOString(),
            };

            const ruleKey = getRuleContentKey(rule);
            if (seenRuleKeys.has(ruleKey)) {
                skippedDuplicateCount++;
                continue;
            }
            seenRuleKeys.add(ruleKey);

            rules[rand64()] = rule;
        }

        setIsImportingRules(true);
        // When every row was skipped (duplicate rules and/or unknown categories), skip the API call and confirm that nothing was added
        const importFinalModal: ImportFinalModal =
            Object.keys(rules).length === 0 && (skippedDuplicateCount > 0 || invalidCategoryNames.size > 0)
                ? {
                      titleKey: 'spreadsheet.importSuccessfulTitle',
                      promptKey: 'spreadsheet.importMerchantRulesSuccessfulDescription',
                      promptKeyParams: {rules: 0, duplicates: skippedDuplicateCount, invalidCategories: invalidCategoryNames.size},
                  }
                : await importMerchantRulesSpreadsheet(policyID, rules, invalidCategoryNames.size);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
        if (!didShowImportFinalModal) {
            setIsImportingRules(false);
            return;
        }
        closeImportPageAndModal();
    };

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return null;
    }

    const spreadsheetColumns = spreadsheet?.data;

    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="ImportedMerchantRulesPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.merchantRules.importRulesTitle')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.RULES_MERCHANT_IMPORT.getRoute(policyID))}
                />
                <ImportSpreadsheetColumns
                    spreadsheetColumns={spreadsheetColumns}
                    columnNames={columnNames}
                    importFunction={importRules}
                    errors={isValidationEnabled ? validate() : undefined}
                    columnRoles={columnRoles}
                    isButtonLoading={isImportingRules}
                    customHeaderText={translate('workspace.rules.merchantRules.importRulesSupportingText')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ImportedMerchantRulesPage;
export {buildImportedCategoryLookup, normalizeImportedTag};
