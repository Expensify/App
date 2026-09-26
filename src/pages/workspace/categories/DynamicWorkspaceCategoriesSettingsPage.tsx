import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {setPolicyAutoCategorizeNewExpenses, setPolicyShowCategoryGLCodes} from '@userActions/Policy/Category';
import {clearPolicyErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

type DynamicWorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps &
    (
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_SETTINGS>
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORIES_SETTINGS>
    );

function DynamicWorkspaceCategoriesSettingsPage({policy, route}: DynamicWorkspaceCategoriesSettingsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORIES_SETTINGS;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CATEGORIES_SETTINGS.path);

    const updateAutoCategorizeNewExpenses = (value: boolean) => {
        setPolicyAutoCategorizeNewExpenses(policyID, value);
    };

    const updateShowCategoryGLCodes = (value: boolean) => {
        setPolicyShowCategoryGLCodes(policyID, value);
    };

    const hasEnabledCategories = hasEnabledOptions(policyData.categories);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicWorkspaceCategoriesSettingsPage"
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? backPath : undefined)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <ToggleSettingOptionRow
                        title={translate('workspace.categories.autoCategorizeNewExpenses')}
                        switchAccessibilityLabel={translate('workspace.categories.autoCategorizeNewExpenses')}
                        isActive={policy?.autoCategorizeNewExpenses ?? true}
                        onToggle={updateAutoCategorizeNewExpenses}
                        pendingAction={policy?.pendingFields?.autoCategorizeNewExpenses}
                        disabled={!policy?.areCategoriesEnabled || !hasEnabledCategories}
                        wrapperStyle={[styles.pv2, styles.mh5]}
                        errors={policy?.errorFields?.autoCategorizeNewExpenses ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policy?.id, 'autoCategorizeNewExpenses')}
                    />
                    {!!policy?.glCodes && (
                        <ToggleSettingOptionRow
                            title={translate('workspace.categories.showCategoryGLCodes')}
                            switchAccessibilityLabel={translate('workspace.categories.showCategoryGLCodes')}
                            isActive={policy?.showCategoryGLCodes ?? false}
                            onToggle={updateShowCategoryGLCodes}
                            pendingAction={policy?.pendingFields?.showCategoryGLCodes}
                            disabled={!policy?.areCategoriesEnabled}
                            wrapperStyle={[styles.pv2, styles.mh5]}
                            errors={policy?.errorFields?.showCategoryGLCodes ?? undefined}
                            onCloseError={() => clearPolicyErrorField(policy?.id, 'showCategoryGLCodes')}
                        />
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(DynamicWorkspaceCategoriesSettingsPage);
