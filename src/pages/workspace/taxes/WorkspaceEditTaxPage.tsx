import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
    const currentTaxRate = PolicyUtils.getTaxByID(policy, taxID);
    const {windowWidth} = useWindowDimensions();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const canEdit = policy && PolicyUtils.canEditTaxRate(policy, taxID);

    const toggleTaxRate = () => {
        if (!currentTaxRate) {
            return;
        }
        setPolicyTaxesEnabled(policyID, [taxID], !!currentTaxRate.isDisabled);
    };

    const deleteTaxRate = () => {
        if (!policyID) {
            return;
        }
        deletePolicyTaxes(policyID, [taxID]);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    const threeDotsMenuItems: ThreeDotsMenuItem[] = useMemo(
        () => [
            {
                icon: Expensicons.Trashcan,
                text: translate('common.delete'),
                onSelected: () => setIsDeleteModalVisible(true),
            },
        ],
        [translate],
    );

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }

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
                    <HeaderWithBackButton
                        title={currentTaxRate?.name}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldShowThreeDotsButton={!!canEdit && !PolicyUtils.hasAccountingConnections(policy)}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    />
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
                                    disabled={!canEdit}
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
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_NAME.getRoute(`${policyID}`, taxID))}
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
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_VALUE.getRoute(`${policyID}`, taxID))}
                        />
                    </OfflineWithFeedback>
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
