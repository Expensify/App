import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {setPolicyShowCategoryGLCodes} from '@userActions/Policy/Category';
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
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORIES_SETTINGS;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CATEGORIES_SETTINGS.path);

    const updateShowCategoryGLCodes = (value: boolean) => {
        setPolicyShowCategoryGLCodes(policyID, value);
    };

    // Only the GL codes toggle is left here, so the page has nothing to show without it.
    const shouldBlockEmptySettings = !policy?.glCodes;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            shouldBeBlocked={shouldBlockEmptySettings}
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
