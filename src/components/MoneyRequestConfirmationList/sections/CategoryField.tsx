import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedLeafCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {canCreateCategoryInSitu} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import CategoryFieldDropdown from './CategoryFieldDropdown';
import ExpenseFieldDropdown from './ExpenseFieldDropdown';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import {categoryStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

const hasEnabledCategoriesSelector = (policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>) => hasEnabledOptions(Object.values(policyCategories ?? {}));

type CategoryFieldProps = {
    isCategoryRequired: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    formError: string;
    shouldNavigateToUpgradePath: boolean;
    shouldSelectPolicy: boolean;
};

function CategoryField({
    isCategoryRequired,
    didConfirm,
    isReadOnly,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    policy,
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
}: CategoryFieldProps) {
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {isEditingSplitBill} = useConfirmationFields();
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const currentUserLogin = useCurrentUserPersonalDetails().login;

    const categoryState = useTransactionSelector(transactionID, categoryStateSelector);
    const [hasEnabledCategories = false] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`, {selector: hasEnabledCategoriesSelector});

    const shouldDisplayCategoryError = formError === 'violations.categoryOutOfPolicy';
    const iouCategory = categoryState?.category ?? '';
    const willAutoFill = categoryState?.willAutoFill ?? false;
    const isAutoFillFromReceipt = categoryState?.isAutoFillFromReceipt ?? false;
    const decodedCategoryName = getDecodedLeafCategoryName(iouCategory);
    // The list marks and clears by the stored category name, not by the leaf name the row shows.
    const selectedCategory = isCategoryMissing(iouCategory) ? '' : iouCategory;

    // Categorization comes from the workspace, so there is nothing to promise without one. The setting itself defaults to on.
    const isAutoCategorizationEnabled = !!policy && policy.autoCategorizeNewExpenses !== false;
    // Invoices are never auto-categorized, so the row must not promise a category it will never get.
    const isInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const shouldPromiseAutomaticCategory = isAutoCategorizationEnabled && !isInvoice && willAutoFill && (isAutoFillFromReceipt || !isCategoryRequired);

    const getCategoryRightLabelIcon = () => (shouldPromiseAutomaticCategory ? icons.Sparkles : undefined);
    const getCategoryRightLabel = () => {
        if (shouldPromiseAutomaticCategory) {
            return translate('common.automatic');
        }
        if (isCategoryRequired) {
            return translate('common.required');
        }
        return '';
    };

    const openCategoryPage = () => {
        if (!transactionID) {
            return;
        }

        if (shouldNavigateToUpgradePath) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action,
                        iouType,
                        transactionID,
                        reportID,
                        upgradeBackTo: createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                                action,
                                iouType,
                                transactionID,
                                reportID,
                                reportActionID,
                            }),
                        ),
                        upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                    }),
                ),
            );
        } else if (!policy && shouldSelectPolicy) {
            Navigation.navigate(
                ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                            action,
                            iouType,
                            transactionID,
                            reportID,
                            reportActionID,
                        }),
                    ),
                ),
            );
        } else {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({
                        action,
                        iouType,
                        transactionID,
                        reportID,
                        reportActionID,
                    }),
                ),
            );
        }
    };

    const canSaveFromThisForm = action !== CONST.IOU.ACTION.EDIT || isEditingSplitBill;
    const canUseAnchoredFieldDropdowns = isBetaEnabled(CONST.BETAS.ANCHORED_FIELD_DROPDOWNS);
    const shouldOpenInDropdown =
        canUseAnchoredFieldDropdowns && !!transactionID && !!policy && !shouldNavigateToUpgradePath && !shouldSelectPolicy && hasEnabledCategories && canSaveFromThisForm;
    const canAddCategory = canCreateCategoryInSitu(policy, currentUserLogin);

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldDropdown
                name={translate('common.category')}
                value={decodedCategoryName}
                numberOfLinesValue={2}
                rightLabel={getCategoryRightLabel()}
                rightLabelIcon={getCategoryRightLabelIcon()}
                // On a scan, `Automatic` describes the category Concierge picked, so it has to outlive the field
                // being filled in. On a manual expense it only promises a category for a field that is still
                // empty, so there it goes the moment the field holds one, the same way `Required` does.
                shouldKeepRightLabelWhenFilled={shouldPromiseAutomaticCategory && isAutoFillFromReceipt}
                errorText={shouldDisplayCategoryError ? translate(formError as TranslationPaths) : ''}
                onPress={openCategoryPage}
                shouldOpenInDropdown={shouldOpenInDropdown && !isReadOnly && !didConfirm}
                listHeaderHeight={canAddCategory ? variables.componentSizeNormal : 0}
                renderDropdown={(dropdownProps) =>
                    !!transactionID && (
                        <CategoryFieldDropdown
                            {...dropdownProps}
                            transactionID={transactionID}
                            policy={policy}
                            selectedCategory={selectedCategory}
                            canAddCategory={canAddCategory}
                        />
                    )
                }
                isDisabled={didConfirm}
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.CATEGORY_FIELD}
            />
        );
    }

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={decodedCategoryName}
            description={translate('common.category')}
            numberOfLinesTitle={2}
            onPress={openCategoryPage}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            disabled={didConfirm}
            interactive={!isReadOnly}
            rightLabel={getCategoryRightLabel()}
            rightLabelIcon={getCategoryRightLabelIcon()}
            brickRoadIndicator={shouldDisplayCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayCategoryError ? translate(formError as TranslationPaths) : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.CATEGORY_FIELD}
        />
    );
}

export default CategoryField;
