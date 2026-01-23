import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Trashcan} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatRequiredFieldsTitle} from '@libs/AttendeeUtils';
import {formatDefaultTaxRateText, formatRequireReceiptsOverText, getCategoryApproverRule, getCategoryDefaultTaxRate, getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDisablingOrDeletingLastEnabledCategory} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getWorkflowApprovalsUnavailable, hasTags, isControlPolicy} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearCategoryErrors, deleteWorkspaceCategories, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type CategorySettingsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_SETTINGS>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS>;

function CategorySettingsPage({
    route: {
        params: {backTo, policyID, categoryName},
        name,
    },
    navigation,
}: CategorySettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [deleteCategoryConfirmModalVisible, setDeleteCategoryConfirmModalVisible] = useState(false);
    const policyData = usePolicyData(policyID);
    const {policy, categories: policyCategories} = policyData;
    const {environmentURL} = useEnvironment();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const policyCategory = policyCategories?.[categoryName] ?? Object.values(policyCategories).find((category) => category.previousCategoryName === categoryName);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const policyCategoryExpenseLimitType = policyCategory?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;
    const decodedCategoryName = getDecodedCategoryName(policyCategory?.name ?? '');

    const [isCannotDeleteOrDisableLastCategoryModalVisible, setIsCannotDeleteOrDisableLastCategoryModalVisible] = useState(false);
    const shouldPreventDisableOrDelete = isDisablingOrDeletingLastEnabledCategory(policy, policyData.categories, [policyCategory]);
    const areCommentsRequired = policyCategory?.areCommentsRequired ?? false;
    const isQuickSettingsFlow = name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS;
    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const {
        taskReport: setupCategoriesAndTagsTaskReport,
        taskParentReport: setupCategoriesAndTagsTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoriesAndTagsTaskParentReportArchived,
        hasOutstandingChildTask: setupCategoriesAndTagsHasOutstandingChildTask,
        parentReportAction: setupCategoriesAndTagsParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});

    const policyHasTags = hasTags(policyTags);

    const navigateBack = () => {
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : undefined);
    };

    const isFocused = useIsFocused();

    useEffect(() => {
        if (policyCategory?.name === categoryName || !isFocused) {
            return;
        }
        navigation.setParams({categoryName: policyCategory?.name});
    }, [categoryName, navigation, policyCategory?.name, isFocused]);

    const flagAmountsOverText = useMemo(() => {
        if (policyCategory?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE || !policyCategory?.maxExpenseAmount) {
            return '';
        }

        return `${convertToDisplayString(policyCategory?.maxExpenseAmount, policyCurrency)} ${CONST.DOT_SEPARATOR} ${translate(
            `workspace.rules.categoryRules.expenseLimitTypes.${policyCategoryExpenseLimitType}`,
        )}`;
    }, [policyCategory?.maxExpenseAmount, policyCategoryExpenseLimitType, policyCurrency, translate]);

    const approverText = useMemo(() => {
        const categoryApprover = getCategoryApproverRule(policy?.rules?.approvalRules ?? [], categoryName)?.approver ?? '';
        const approver = getPersonalDetailByEmail(categoryApprover);
        return approver?.displayName ?? categoryApprover;
    }, [categoryName, policy?.rules?.approvalRules]);

    const defaultTaxRateText = useMemo(() => {
        const taxID = getCategoryDefaultTaxRate(policy?.rules?.expenseRules ?? [], categoryName, policy?.taxRates?.defaultExternalID);

        if (!taxID) {
            return '';
        }

        const taxRate = policy?.taxRates?.taxes[taxID];

        if (!taxRate) {
            return '';
        }

        return formatDefaultTaxRateText(translate, taxID, taxRate, policy?.taxRates);
    }, [categoryName, policy?.rules?.expenseRules, policy?.taxRates, translate]);

    const requireReceiptsOverText = useMemo(() => {
        if (!policy) {
            return '';
        }
        return formatRequireReceiptsOverText(translate, policy, policyCategory?.maxAmountNoReceipt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policy, policyCategory?.maxAmountNoReceipt, translate]);

    const requiredFieldsTitle = useMemo(() => {
        if (!policyCategory) {
            return '';
        }
        return formatRequiredFieldsTitle(translate, policyCategory, policy?.isAttendeeTrackingEnabled);
    }, [policyCategory, translate, policy?.isAttendeeTrackingEnabled]);

    const requireFieldsPendingAction = useMemo(() => {
        if (policy?.isAttendeeTrackingEnabled) {
            // Pending fields are objects so we can't use nullish coalescing
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return policyCategory?.pendingFields?.areAttendeesRequired || policyCategory?.pendingFields?.areCommentsRequired;
        }
        return policyCategory?.pendingFields?.areCommentsRequired;
    }, [policyCategory?.pendingFields, policy?.isAttendeeTrackingEnabled]);

    const updateWorkspaceCategoryEnabled = useCallback(
        (value: boolean) => {
            if (shouldPreventDisableOrDelete) {
                setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                return;
            }
            setWorkspaceCategoryEnabled({
                policyData,
                categoriesToUpdate: {[policyCategory.name]: {name: policyCategory.name, enabled: value}},
                isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
                setupCategoriesAndTagsTaskReport,
                setupCategoriesAndTagsTaskParentReport,
                isSetupCategoriesAndTagsTaskParentReportArchived,
                setupCategoriesAndTagsHasOutstandingChildTask,
                setupCategoriesAndTagsParentReportAction,
                policyHasTags,
            });
        },
        [
            setIsCannotDeleteOrDisableLastCategoryModalVisible,
            shouldPreventDisableOrDelete,
            policyData,
            policyCategory.name,
            isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
            setupCategoriesAndTagsTaskReport,
            setupCategoriesAndTagsTaskParentReport,
            isSetupCategoriesAndTagsTaskParentReportArchived,
            setupCategoriesAndTagsHasOutstandingChildTask,
            setupCategoriesAndTagsParentReportAction,
            policyHasTags,
        ],
    );

    const navigateToEditCategory = () => {
        Navigation.navigate(
            isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_EDIT.getRoute(policyID, policyCategory.name, backTo) : ROUTES.WORKSPACE_CATEGORY_EDIT.getRoute(policyID, policyCategory.name),
        );
    };

    const deleteCategory = () => {
        deleteWorkspaceCategories(
            policyData,
            [categoryName],
            isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
        );
        setDeleteCategoryConfirmModalVisible(false);
        navigateBack();
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const approverDisabled = !policy?.areWorkflowsEnabled || workflowApprovalsUnavailable;

    if (!policyCategory) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="CategorySettingsPage"
            >
                <HeaderWithBackButton
                    title={decodedCategoryName}
                    onBackButtonPress={navigateBack}
                />
                <ConfirmModal
                    isVisible={deleteCategoryConfirmModalVisible}
                    onConfirm={deleteCategory}
                    onCancel={() => setDeleteCategoryConfirmModalVisible(false)}
                    title={translate('workspace.categories.deleteCategory')}
                    prompt={translate('workspace.categories.deleteCategoryPrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    isVisible={isCannotDeleteOrDisableLastCategoryModalVisible}
                    onConfirm={() => setIsCannotDeleteOrDisableLastCategoryModalVisible(false)}
                    onCancel={() => setIsCannotDeleteOrDisableLastCategoryModalVisible(false)}
                    title={translate('workspace.categories.cannotDeleteOrDisableAllCategories.title')}
                    prompt={translate('workspace.categories.cannotDeleteOrDisableAllCategories.description')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1]}
                    addBottomSafeAreaPadding
                >
                    <OfflineWithFeedback
                        errors={getLatestErrorMessageField(policyCategory)}
                        pendingAction={policyCategory?.pendingFields?.enabled}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearCategoryErrors(policyID, categoryName, policyCategories)}
                    >
                        <View style={[styles.mt2, styles.mh5]}>
                            <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text
                                    style={[styles.flexShrink1, styles.mr2]}
                                    accessible={false}
                                >
                                    {translate('workspace.categories.enableCategory')}
                                </Text>
                                <Switch
                                    isOn={policyCategory.enabled}
                                    accessibilityLabel={translate('workspace.categories.enableCategory')}
                                    onToggle={updateWorkspaceCategoryEnabled}
                                    showLockIcon={shouldPreventDisableOrDelete}
                                />
                            </View>
                        </View>
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.name}>
                        <MenuItemWithTopDescription
                            title={decodedCategoryName}
                            description={translate('common.name')}
                            onPress={navigateToEditCategory}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.['GL Code']}>
                        <MenuItemWithTopDescription
                            title={policyCategory['GL Code']}
                            description={translate('workspace.categories.glCode')}
                            onPress={() => {
                                if (!isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(
                                            policyID,
                                            CONST.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias,
                                            isQuickSettingsFlow
                                                ? ROUTES.SETTINGS_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name, backTo)
                                                : ROUTES.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name),
                                        ),
                                    );
                                    return;
                                }
                                Navigation.navigate(
                                    isQuickSettingsFlow
                                        ? ROUTES.SETTINGS_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name, backTo)
                                        : ROUTES.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name),
                                );
                            }}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.['Payroll Code']}>
                        <MenuItemWithTopDescription
                            title={policyCategory['Payroll Code']}
                            description={translate('workspace.categories.payrollCode')}
                            onPress={() => {
                                if (!isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(
                                            policyID,
                                            CONST.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias,
                                            ROUTES.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name),
                                        ),
                                    );
                                    return;
                                }
                                Navigation.navigate(
                                    isQuickSettingsFlow
                                        ? ROUTES.SETTINGS_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name, backTo)
                                        : ROUTES.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name),
                                );
                            }}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>

                    {areCommentsRequired && (
                        <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.commentHint}>
                            <MenuItemWithTopDescription
                                title={policyCategory?.commentHint}
                                description={translate('workspace.rules.categoryRules.descriptionHint')}
                                onPress={() => {
                                    Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_DESCRIPTION_HINT.getRoute(policyID, policyCategory.name));
                                }}
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                    )}

                    {!isThereAnyAccountingConnection && (
                        <MenuItem
                            icon={Trashcan}
                            title={translate('workspace.categories.deleteCategory')}
                            onPress={() => {
                                if (shouldPreventDisableOrDelete) {
                                    setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                                    return;
                                }
                                setDeleteCategoryConfirmModalVisible(true);
                            }}
                        />
                    )}

                    {!!policy?.areRulesEnabled && (
                        <>
                            <View style={[styles.mh5, styles.pt3, styles.borderTop]}>
                                <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.rules.categoryRules.title')}</Text>
                            </View>
                            <MenuItemWithTopDescription
                                title={approverText}
                                description={translate('workspace.rules.categoryRules.approver')}
                                onPress={() => {
                                    Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_APPROVER.getRoute(policyID, policyCategory.name));
                                }}
                                shouldShowRightIcon
                                disabled={approverDisabled}
                                helperText={
                                    approverDisabled
                                        ? translate('workspace.rules.categoryRules.enableWorkflows', {
                                              moreFeaturesLink: `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`,
                                          })
                                        : undefined
                                }
                                shouldParseHelperText
                            />
                            {!!policy?.tax?.trackingEnabled && (
                                <MenuItemWithTopDescription
                                    title={defaultTaxRateText}
                                    description={translate('workspace.rules.categoryRules.defaultTaxRate')}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_DEFAULT_TAX_RATE.getRoute(policyID, policyCategory.name));
                                    }}
                                    shouldShowRightIcon
                                />
                            )}

                            <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.maxExpenseAmount}>
                                <MenuItemWithTopDescription
                                    title={flagAmountsOverText}
                                    description={translate('workspace.rules.categoryRules.flagAmountsOver')}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER.getRoute(policyID, policyCategory.name));
                                    }}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.maxAmountNoReceipt}>
                                <MenuItemWithTopDescription
                                    title={requireReceiptsOverText}
                                    description={translate(`workspace.rules.categoryRules.requireReceiptsOver`)}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.getRoute(policyID, policyCategory.name));
                                    }}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={requireFieldsPendingAction}>
                                <MenuItemWithTopDescription
                                    title={requiredFieldsTitle}
                                    description={translate('workspace.rules.categoryRules.requireFields')}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_REQUIRED_FIELDS.getRoute(policyID, policyCategory.name));
                                    }}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                        </>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CategorySettingsPage;
