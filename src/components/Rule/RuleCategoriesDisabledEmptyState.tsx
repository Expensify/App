import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import {enablePolicyCategories, openPolicyCategoriesPage} from '@libs/actions/Policy/Category';

import CONST from '@src/CONST';

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

    const enableCategories = () => {
        enablePolicyCategories(policyData, true, false);

        // The categories collection is empty while the feature is disabled, and enabling it only merges the
        // categories we already know about, so the collection has to be fetched for the picker to have rows.
        openPolicyCategoriesPage(policyID);
    };

    return (
        <View style={[styles.flex1]}>
            <WorkspaceEmptyStateSection
                shouldStyleAsCard={false}
                icon={illustrations.FolderOpen}
                title={translate('workspace.rules.categoriesDisabledEmptyState.title')}
                subtitle={translate('workspace.rules.categoriesDisabledEmptyState.subtitle')}
                containerStyle={[styles.flex1, styles.justifyContentCenter]}
            />
            <FixedFooter style={[styles.mtAuto, styles.pt5]}>
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
