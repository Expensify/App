import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type CategorySettingsPageOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type CategorySettingsPageProps = CategorySettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_SETTINGS>;

function CategorySettingsPage({route, policyCategories, navigation}: CategorySettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [deleteCategoryConfirmModalVisible, setDeleteCategoryConfirmModalVisible] = useState(false);
    const backTo = route.params?.backTo;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`);
    const shouldDisablePayrollCode = !isControlPolicy(policy);

    const policyCategory =
        policyCategories?.[route.params.categoryName] ?? Object.values(policyCategories ?? {}).find((category) => category.previousCategoryName === route.params.categoryName);

    const navigateBack = () => {
        if (backTo) {
            Navigation.goBack(ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(route.params.policyID, backTo));
            return;
        }
        Navigation.goBack();
    };

    useEffect(() => {
        if (policyCategory?.name === route.params.categoryName || !policyCategory) {
            return;
        }
        navigation.setParams({categoryName: policyCategory?.name});
    }, [route.params.categoryName, navigation, policyCategory]);

    if (!policyCategory) {
        return <NotFoundPage />;
    }

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceCategoryEnabled(route.params.policyID, {[policyCategory.name]: {name: policyCategory.name, enabled: value}});
    };

    const navigateToEditCategory = () => {
        if (backTo) {
            Navigation.navigate(ROUTES.SETTINGS_CATEGORY_EDIT.getRoute(route.params.policyID, policyCategory.name, backTo));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_EDIT.getRoute(route.params.policyID, policyCategory.name));
    };

    const deleteCategory = () => {
        Category.deleteWorkspaceCategories(route.params.policyID, [route.params.categoryName]);
        setDeleteCategoryConfirmModalVisible(false);
        navigateBack();
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategorySettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={route.params.categoryName}
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
                <View style={styles.flexGrow1}>
                    <OfflineWithFeedback
                        errors={ErrorUtils.getLatestErrorMessageField(policyCategory)}
                        pendingAction={policyCategory?.pendingFields?.enabled}
                        errorRowStyles={styles.mh5}
                        onClose={() => Category.clearCategoryErrors(route.params.policyID, route.params.categoryName)}
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
                            description={translate(`workspace.categories.categoryName`)}
                            onPress={navigateToEditCategory}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.['GL Code']}>
                        <MenuItemWithTopDescription
                            title={policyCategory['GL Code']}
                            description={translate(`workspace.categories.glCode`)}
                            onPress={() => {
                                if (!isControlPolicy(policy)) {
                                    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(route.params.policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias));
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_GL_CODE.getRoute(route.params.policyID, policyCategory.name));
                            }}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={policyCategory.pendingFields?.['Payroll Code']}>
                        <MenuItemWithTopDescription
                            title={policyCategory['Payroll Code']}
                            description={translate(`workspace.categories.payrollCode`)}
                            onPress={() => {
                                if (!isControlPolicy(policy)) {
                                    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(route.params.policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias));
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(route.params.policyID, policyCategory.name));
                            }}
                            shouldShowRightIcon
                            disabled={shouldDisablePayrollCode}
                        />
                    </OfflineWithFeedback>
                    {!isThereAnyAccountingConnection && (
                        <MenuItem
                            icon={Expensicons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => setDeleteCategoryConfirmModalVisible(true)}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategorySettingsPage.displayName = 'CategorySettingsPage';

export default withOnyx<CategorySettingsPageProps, CategorySettingsPageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(CategorySettingsPage);
