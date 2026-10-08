import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import usePolicyCategoriesForConfirmation from '@components/MoneyRequestConfirmationList/hooks/usePolicyCategoriesForConfirmation';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedLeafCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {hasEnabledOptions} from '@libs/OptionsListUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

import type {ExpenseFieldDropdownHandle} from './ExpenseFieldDropdown';

import CategoryFieldDropdown from './CategoryFieldDropdown';
import ExpenseFieldDropdown from './ExpenseFieldDropdown';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import {categoryStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

/** idle → departing (row pressed) → away (left for the workspace step) → returned (back on the form) → idle */
type WorkspaceStep = 'idle' | 'departing' | 'away' | 'returned';

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
    const dropdownRef = useRef<ExpenseFieldDropdownHandle>(null);
    const isFocused = useIsFocused();
    // Where the user is in the workspace step the row sent them to. Scoped to that one departure and return: it
    // disarms when they leave the form again, so a later unrelated focus cannot open the list by itself.
    const workspaceStepRef = useRef<WorkspaceStep>('idle');

    const categoryState = useTransactionSelector(transactionID, categoryStateSelector);
    const policyCategories = usePolicyCategoriesForConfirmation(policy?.id);
    const hasEnabledCategories = hasEnabledOptions(Object.values(policyCategories ?? {}));

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

    const canSaveFromThisForm = action !== CONST.IOU.ACTION.EDIT || isEditingSplitBill;
    const canUseAnchoredFieldDropdowns = isBetaEnabled(CONST.BETAS.ANCHORED_FIELD_DROPDOWNS);
    const isCreatingExpense = action === CONST.IOU.ACTION.CREATE;
    // While creating, the list loads the categories itself and shows its own empty state, so it never needs the full page.
    const canShowCategories = isCreatingExpense || hasEnabledCategories;
    const shouldOpenInDropdown =
        canUseAnchoredFieldDropdowns && !!transactionID && !!policy && !shouldNavigateToUpgradePath && !shouldSelectPolicy && canShowCategories && canSaveFromThisForm;
    // The one condition both the row and the effect below open on, so the effect never asks the row to open a
    // list it would refuse and fall back to the full page for.
    const canOpenListInPlace = shouldOpenInDropdown && !isReadOnly && !didConfirm;
    const canOpenInDropdownAfterWorkspaceStep = canUseAnchoredFieldDropdowns && shouldUseDropdownRows && isCreatingExpense;

    // Blurs move the step along: the first is the departure to the workspace step, the next after returning means
    // the user left the form for something else, and the arm must not survive that.
    useEffect(() => {
        if (isFocused) {
            return;
        }
        if (workspaceStepRef.current === 'departing') {
            workspaceStepRef.current = 'away';
        } else if (workspaceStepRef.current === 'returned') {
            workspaceStepRef.current = 'idle';
        }
    }, [isFocused]);

    // The row sent the user to create or pick a workspace, and the upgrade step was told to only go back (`shouldReturnToConfirmation`).
    // Once the form is focused again with a workspace, wait for the RHP to finish closing, then open the list in place.
    useFocusEffect(() => {
        if (workspaceStepRef.current === 'away') {
            workspaceStepRef.current = 'returned';
        }
        if (workspaceStepRef.current !== 'returned') {
            return;
        }

        // The user backed out without a workspace, so there is still nothing to list.
        if (shouldNavigateToUpgradePath || shouldSelectPolicy) {
            workspaceStepRef.current = 'idle';
            return;
        }

        if (!canOpenListInPlace) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                workspaceStepRef.current = 'idle';
                dropdownRef.current?.open();
            },
            waitForUpcomingTransition: 'navigation',
        });
        return () => handle.cancel();
    });

    const openCategoryPage = () => {
        if (!transactionID) {
            return;
        }

        workspaceStepRef.current = (shouldNavigateToUpgradePath || (!policy && shouldSelectPolicy)) && canOpenInDropdownAfterWorkspaceStep ? 'departing' : 'idle';
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
                        shouldReturnToConfirmation: canOpenInDropdownAfterWorkspaceStep,
                    }),
                ),
            );
        } else if (!policy && shouldSelectPolicy) {
            // Without `navigateTo`, the page goes back to this form once a workspace is picked, and the list opens here.
            const categoryStepRoute = canOpenInDropdownAfterWorkspaceStep
                ? undefined
                : createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({action, iouType, transactionID, reportID, reportActionID}));
            Navigation.navigate(ROUTES.SET_DEFAULT_WORKSPACE.getRoute(categoryStepRoute));
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

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldDropdown
                ref={dropdownRef}
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
                shouldOpenInDropdown={canOpenListInPlace}
                renderDropdown={(dropdownProps) =>
                    !!transactionID && (
                        <CategoryFieldDropdown
                            {...dropdownProps}
                            transactionID={transactionID}
                            policy={policy}
                            selectedCategory={selectedCategory}
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
