import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearTaxRateFieldError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canEditTaxRate as canEditTaxRateUtil, getCurrentTaxID, hasAccountingConnections, isControlPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceEditTaxPageBaseProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_EDIT>;

function WorkspaceEditTaxPage({
    route: {
        params: {policyID, taxID},
    },
    policy,
}: WorkspaceEditTaxPageBaseProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const currentTaxID = getCurrentTaxID(policy, taxID);
    const currentTaxRate = currentTaxID && policy?.taxRates?.taxes?.[currentTaxID];
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const canEditTaxRate = policy && canEditTaxRateUtil(policy, currentTaxID ?? taxID);

    const shouldShowDeleteMenuItem = canEditTaxRate && !hasAccountingConnections(policy);

    const toggleTaxRate = () => {
        if (!currentTaxRate) {
            return;
        }
        setPolicyTaxesEnabled(policy, [taxID], !!currentTaxRate.isDisabled);
    };

    useEffect(() => {
        if (currentTaxID === taxID || !currentTaxID) {
            return;
        }
        Navigation.setParams({taxID: currentTaxID});
    }, [taxID, currentTaxID]);

    const deleteTaxRate = () => {
        if (!policyID) {
            return;
        }
        deletePolicyTaxes(policy, [taxID], localeCompare);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }
    const taxCodeToShow = isControlPolicy(policy) ? taxID : '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceEditTaxPage"
                style={styles.mb5}
            >
                <View style={[styles.h100, styles.flex1]}>
                    <HeaderWithBackButton title={currentTaxRate?.name} />
                    <OfflineWithFeedback
                        errors={getLatestErrorField(currentTaxRate, 'isDisabled')}
                        pendingAction={currentTaxRate?.pendingFields?.isDisabled}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearTaxRateFieldError(policyID, taxID, 'isDisabled')}
                    >
                        <View style={[styles.mt2, styles.mh5]}>
                            <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text>{translate('workspace.taxes.actions.enable')}</Text>
                                <Switch
                                    isOn={!currentTaxRate?.isDisabled}
                                    accessibilityLabel={translate('workspace.taxes.actions.enable')}
                                    onToggle={toggleTaxRate}
                                    disabled={!canEditTaxRate}
                                />
                            </View>
                        </View>
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={getLatestErrorField(currentTaxRate, 'name')}
                        pendingAction={currentTaxRate?.pendingFields?.name}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearTaxRateFieldError(policyID, taxID, 'name')}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={currentTaxRate?.name}
                            description={translate('common.name')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_NAME.getRoute(`${policyID}`, taxID))}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={getLatestErrorField(currentTaxRate, 'value')}
                        pendingAction={currentTaxRate?.pendingFields?.value}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearTaxRateFieldError(policyID, taxID, 'value')}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={currentTaxRate?.value}
                            description={translate('workspace.taxes.value')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_VALUE.getRoute(`${policyID}`, taxID))}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={getLatestErrorField(currentTaxRate, 'code')}
                        pendingAction={currentTaxRate?.pendingFields?.code}
                        errorRowStyles={styles.mh5}
                        onClose={() => clearTaxRateFieldError(policyID, taxID, 'code')}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={taxCodeToShow}
                            description={translate('workspace.taxes.taxCode')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(
                                            policyID,
                                            CONST.UPGRADE_FEATURE_INTRO_MAPPING.taxCodes.alias,
                                            ROUTES.WORKSPACE_TAX_CODE.getRoute(`${policyID}`, taxID),
                                        ),
                                    );
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TAX_CODE.getRoute(`${policyID}`, taxID));
                            }}
                        />
                    </OfflineWithFeedback>
                    {!!shouldShowDeleteMenuItem && (
                        <MenuItem
                            icon={icons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => setIsDeleteModalVisible(true)}
                        />
                    )}
                </View>
                <ConfirmModal
                    title={translate('workspace.taxes.actions.delete')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteTaxRate}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    prompt={translate('workspace.taxes.deleteTaxConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceEditTaxPage);
