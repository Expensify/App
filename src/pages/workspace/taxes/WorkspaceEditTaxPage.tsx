import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
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
import {clearTaxRateFieldError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceEditTaxPageBaseProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_EDIT>;

function WorkspaceEditTaxPage({
    route: {
        params: {policyID, taxID},
    },
    policy,
}: WorkspaceEditTaxPageBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentTaxID = PolicyUtils.getCurrentTaxID(policy, taxID);
    const currentTaxRate = currentTaxID && policy?.taxRates?.taxes?.[currentTaxID];
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const canEditTaxRate = policy && PolicyUtils.canEditTaxRate(policy, currentTaxID ?? taxID);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);

    const shouldShowDeleteMenuItem = canEditTaxRate && !hasAccountingConnections;

    const toggleTaxRate = () => {
        if (!currentTaxRate) {
            return;
        }
        setPolicyTaxesEnabled(policyID, [taxID], !!currentTaxRate.isDisabled);
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
        deletePolicyTaxes(policyID, [taxID]);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }
    const taxCodeToShow = PolicyUtils.isControlPolicy(policy) ? taxID : '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceEditTaxPage.displayName}
                style={styles.mb5}
            >
                <View style={[styles.h100, styles.flex1]}>
                    <HeaderWithBackButton title={currentTaxRate?.name} />
                    <OfflineWithFeedback
                        errors={ErrorUtils.getLatestErrorField(currentTaxRate, 'isDisabled')}
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
                        errors={ErrorUtils.getLatestErrorField(currentTaxRate, 'name')}
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
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_NAME.getRoute(policyID, taxID))}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={ErrorUtils.getLatestErrorField(currentTaxRate, 'value')}
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
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_VALUE.getRoute(policyID, taxID))}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback
                        errors={ErrorUtils.getLatestErrorField(currentTaxRate, 'code')}
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
                                if (!PolicyUtils.isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.taxCodes.alias, ROUTES.WORKSPACE_TAX_CODE.getRoute(policyID, taxID)),
                                    );
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TAX_CODE.getRoute(policyID, taxID));
                            }}
                        />
                    </OfflineWithFeedback>
                    {shouldShowDeleteMenuItem && (
                        <MenuItem
                            icon={Expensicons.Trashcan}
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

WorkspaceEditTaxPage.displayName = 'WorkspaceEditTaxPage';

export default withPolicyAndFullscreenLoading(WorkspaceEditTaxPage);
