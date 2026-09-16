import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScrollView from '@components/ScrollView';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import {enablePolicyCategories, openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type RuleCategoriesDisabledEmptyStateProps = {
    /** ID of the policy the rule belongs to */
    policyID: string;
};

function RuleCategoriesDisabledEmptyState({policyID}: RuleCategoriesDisabledEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderOpen']);
    const policyData = usePolicyData(policyID);
    const {showConfirmModal} = useConfirmModal();
    const isConnectedToAccounting = hasAccountingConnections(policyData.policy);

    const enableCategories = async () => {
        // Accounting owns Categories while a connection is active, same as the Categories toggle on More features.
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

        enablePolicyCategories(policyData, true, false);

        // The categories collection is empty while the feature is disabled, and enabling it only merges the
        // categories we already know about, so the collection has to be fetched for the picker to have rows.
        openPolicyCategoriesPage(policyID);
    };

    return (
        <View style={[styles.flex1]}>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <WorkspaceEmptyStateSection
                    shouldStyleAsCard={false}
                    icon={illustrations.FolderOpen}
                    title={translate('workspace.rules.categoriesDisabledEmptyState.title')}
                    subtitle={translate('workspace.rules.categoriesDisabledEmptyState.subtitle')}
                />
            </ScrollView>
            <FixedFooter style={[styles.pt5]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.w100]}
                    onPress={enableCategories}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('workspace.categories.enableCategories')}</Button.Text>
                </Button>
            </FixedFooter>
        </View>
    );
}

export default RuleCategoriesDisabledEmptyState;
