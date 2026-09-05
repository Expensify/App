import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScrollView from '@components/ScrollView';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import {enablePolicyTaxes} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type RuleTaxesDisabledEmptyStateProps = {
    /** ID of the policy the rule belongs to */
    policyID: string;
};

/** The taxes counterpart of {@link RuleCategoriesDisabledEmptyState}, so a rule picker explains a disabled feature
 * rather than showing an empty list. */
function RuleTaxesDisabledEmptyState({policyID}: RuleTaxesDisabledEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Coins']);
    const policyData = usePolicyData(policyID);
    const {showConfirmModal} = useConfirmModal();
    const isConnectedToAccounting = hasAccountingConnections(policyData.policy);

    const enableTaxes = async () => {
        // Accounting owns Taxes while a connection is active, same as the Taxes toggle on More features.
        if (isConnectedToAccounting) {
            const {action} = await showConfirmModal({
                title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
                prompt: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText'),
                confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
                cancelText: translate('common.cancel'),
            });
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
            return;
        }

        enablePolicyTaxes(policyID, true, policyData.policy?.taxRates, policyData);
    };

    return (
        <View style={[styles.flex1]}>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <WorkspaceEmptyStateSection
                    shouldStyleAsCard={false}
                    icon={illustrations.Coins}
                    title={translate('workspace.rules.taxesDisabledEmptyState.title')}
                    subtitle={translate('workspace.rules.taxesDisabledEmptyState.subtitle')}
                />
            </ScrollView>
            <FixedFooter style={[styles.pt5]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.w100]}
                    onPress={enableTaxes}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('workspace.rules.taxesDisabledEmptyState.cta')}</Button.Text>
                </Button>
            </FixedFooter>
        </View>
    );
}

export default RuleTaxesDisabledEmptyState;
