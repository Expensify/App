import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CategoryUtils from '@libs/CategoryUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {isControlPolicy} from '@libs/PolicyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CategorySettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_SETTINGS>;

function CategorySettingsPage({
    route: {
        params: {backTo, policyID, categoryName},
    },
    navigation,
}: CategorySettingsPageProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [deleteCategoryConfirmModalVisible, setDeleteCategoryConfirmModalVisible] = useState(false);
    const policy = usePolicy(policyID);

    const policyCategory = policyCategories?.[categoryName] ?? Object.values(policyCategories ?? {}).find((category) => category.previousCategoryName === categoryName);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const policyCategoryExpenseLimitType = policyCategory?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    const areCommentsRequired = policyCategory?.areCommentsRequired ?? false;

    const navigateBack = () => {
        if (backTo) {
            Navigation.goBack(ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo));
            return;
        }
        Navigation.goBack();
    };

    useEffect(() => {
        if (policyCategory?.name === categoryName || !policyCategory) {
            return;
        }
        navigation.setParams({categoryName: policyCategory?.name});
    }, [categoryName, navigation, policyCategory]);

    const flagAmountsOverText = useMemo(() => {
        if (policyCategory?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE || !policyCategory?.maxExpenseAmount) {
            return '';
        }

        return `${CurrencyUtils.convertToDisplayString(policyCategory?.maxExpenseAmount, policyCurrency)} ${CONST.DOT_SEPARATOR} ${translate(
            `workspace.rules.categoryRules.expenseLimitTypes.${policyCategoryExpenseLimitType}`,
        )}`;
    }, [policyCategory?.maxExpenseAmount, policyCategoryExpenseLimitType, policyCurrency, translate]);

    const approverText = useMemo(() => {
        const categoryApprover = CategoryUtils.getCategoryApproverRule(policy?.rules?.approvalRules ?? [], categoryName)?.approver ?? '';
        const approver = PersonalDetailsUtils.getPersonalDetailByEmail(categoryApprover);
        return approver?.displayName || categoryApprover;
    }, [categoryName, policy?.rules?.approvalRules]);

    const defaultTaxRateText = useMemo(() => {
        const taxID = CategoryUtils.getCategoryDefaultTaxRate(policy?.rules?.expenseRules ?? [], categoryName, policy?.taxRates?.defaultExternalID);

        if (!taxID) {
            return '';
        }

        const taxRate = policy?.taxRates?.taxes[taxID];

        if (!taxRate) {
            return '';
        }

        return CategoryUtils.formatDefaultTaxRateText(translate, taxID, taxRate, policy?.taxRates);
    }, [categoryName, policy?.rules?.expenseRules, policy?.taxRates, translate]);

    const requireReceiptsOverText = useMemo(() => {
        if (!policy) {
            return '';
        }
        return CategoryUtils.formatRequireReceiptsOverText(translate, policy, policyCategory?.maxExpenseAmountNoReceipt);
    }, [policy, policyCategory?.maxExpenseAmountNoReceipt, translate]);

    if (!policyCategory) {
        return <NotFoundPage />;
    }

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        Category.setWorkspaceCategoryEnabled(policyID, {[policyCategory.name]: {name: policyCategory.name, enabled: value}});
    };

    const navigateToEditCategory = () => {
        if (backTo) {
            Navigation.navigate(ROUTES.SETTINGS_CATEGORY_EDIT.getRoute(policyID, policyCategory.name, backTo));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_EDIT.getRoute(policyID, policyCategory.name));
    };

    const deleteCategory = () => {
        Category.deleteWorkspaceCategories(policyID, [categoryName]);
        setDeleteCategoryConfirmModalVisible(false);
        navigateBack();
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const workflowApprovalsUnavailable = PolicyUtils.getWorkflowApprovalsUnavailable(policy);
    const approverDisabled = !policy?.areWorkflowsEnabled || workflowApprovalsUnavailable;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategorySettingsPage.displayName}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithBackButton
                            title={categoryName}
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
                        <ScrollView contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}>
                            <OfflineWithFeedback
                                errors={ErrorUtils.getLatestErrorMessageField(policyCategory)}
                                pendingAction={policyCategory?.pendingFields?.enabled}
                                errorRowStyles={styles.mh5}
                                onClose={() => Category.clearCategoryErrors(policyID, categoryName)}
                            >
                                <View style={[styles.mt2, styles.mh5]}>
                                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.categories.enableCategory')}</Text>
                                        <Switch
                                            isOn={policyCategory.enabled}
                                            accessibilityLabel={translate('workspace.categories.enableCategory')}
                                            onToggle={updateWorkspaceRequiresCategory}
                                        />
                                    </View>
                                </View>
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.name}>
                                <MenuItemWithTopDescription
                                    title={policyCategory.name}
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
                                                    ROUTES.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name),
                                                ),
                                            );
                                            return;
                                        }
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name));
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
                                        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name));
                                    }}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>

                            {policy?.areRulesEnabled && (
                                <>
                                    <View style={[styles.mh5, styles.pt3, styles.borderTop]}>
                                        <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.rules.categoryRules.title')}</Text>
                                    </View>
                                    <OfflineWithFeedback pendingAction={policyCategory?.pendingFields?.areCommentsRequired}>
                                        <View style={[styles.mt2, styles.mh5]}>
                                            <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                                <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.categoryRules.requireDescription')}</Text>
                                                <Switch
                                                    isOn={policyCategory?.areCommentsRequired ?? false}
                                                    accessibilityLabel={translate('workspace.rules.categoryRules.requireDescription')}
                                                    onToggle={() => Category.setPolicyCategoryDescriptionRequired(policyID, categoryName, !areCommentsRequired)}
                                                />
                                            </View>
                                        </View>
                                    </OfflineWithFeedback>
                                    {policyCategory?.areCommentsRequired && (
                                        <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.commentHint}>
                                            <MenuItemWithTopDescription
                                                title={policyCategory?.commentHint}
                                                description={translate('workspace.rules.categoryRules.descriptionHint')}
                                                onPress={() => {
                                                    Navigation.navigate(ROUTES.WORSKPACE_CATEGORY_DESCRIPTION_HINT.getRoute(policyID, policyCategory.name));
                                                }}
                                                shouldShowRightIcon
                                            />
                                        </OfflineWithFeedback>
                                    )}
                                    <MenuItemWithTopDescription
                                        title={approverText}
                                        description={translate('workspace.rules.categoryRules.approver')}
                                        onPress={() => {
                                            Navigation.navigate(ROUTES.WORSKPACE_CATEGORY_APPROVER.getRoute(policyID, policyCategory.name));
                                        }}
                                        shouldShowRightIcon
                                        disabled={approverDisabled}
                                    />
                                    {approverDisabled && (
                                        <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mv2, styles.mh5]}>
                                            <Text style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.goTo')}</Text>{' '}
                                            <TextLink
                                                style={[styles.link, styles.label]}
                                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID))}
                                            >
                                                {translate('workspace.common.moreFeatures')}
                                            </TextLink>{' '}
                                            <Text style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.andEnableWorkflows')}</Text>
                                        </Text>
                                    )}
                                    {policy?.tax?.trackingEnabled && (
                                        <MenuItemWithTopDescription
                                            title={defaultTaxRateText}
                                            description={translate('workspace.rules.categoryRules.defaultTaxRate')}
                                            onPress={() => {
                                                Navigation.navigate(ROUTES.WORSKPACE_CATEGORY_DEFAULT_TAX_RATE.getRoute(policyID, policyCategory.name));
                                            }}
                                            shouldShowRightIcon
                                        />
                                    )}

                                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.maxExpenseAmount}>
                                        <MenuItemWithTopDescription
                                            title={flagAmountsOverText}
                                            description={translate('workspace.rules.categoryRules.flagAmountsOver')}
                                            onPress={() => {
                                                Navigation.navigate(ROUTES.WORSKPACE_CATEGORY_FLAG_AMOUNTS_OVER.getRoute(policyID, policyCategory.name));
                                            }}
                                            shouldShowRightIcon
                                        />
                                    </OfflineWithFeedback>
                                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.maxExpenseAmountNoReceipt}>
                                        <MenuItemWithTopDescription
                                            title={requireReceiptsOverText}
                                            description={translate(`workspace.rules.categoryRules.requireReceiptsOver`)}
                                            onPress={() => {
                                                Navigation.navigate(ROUTES.WORSKPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.getRoute(policyID, policyCategory.name));
                                            }}
                                            shouldShowRightIcon
                                        />
                                    </OfflineWithFeedback>
                                </>
                            )}

                            {!isThereAnyAccountingConnection && (
                                <MenuItem
                                    icon={Expensicons.Trashcan}
                                    title={translate('common.delete')}
                                    onPress={() => setDeleteCategoryConfirmModalVisible(true)}
                                />
                            )}
                        </ScrollView>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategorySettingsPage.displayName = 'CategorySettingsPage';

export default CategorySettingsPage;
