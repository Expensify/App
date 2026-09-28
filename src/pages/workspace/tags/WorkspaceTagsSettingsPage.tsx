import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField} from '@libs/actions/Policy/Policy';
import {clearPolicyTagListErrors, setPolicyShowTagGLCodes} from '@libs/actions/Policy/Tag';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getTagLists as getTagListsUtil, isMultiLevelTags as isMultiLevelTagsUtil} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type WorkspaceTagsSettingsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_TAGS_SETTINGS>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAGS_SETTINGS>;

function WorkspaceTagsSettingsPage({route}: WorkspaceTagsSettingsPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const policyData = usePolicyData(policyID);
    const {tags: policyTags} = policyData;
    const {translate} = useLocalize();
    const [policyTagLists, isMultiLevelTags] = useMemo(() => [getTagListsUtil(policyTags), isMultiLevelTagsUtil(policyTags)], [policyTags]);
    const customTagName = policyTagLists.at(0)?.name;
    const isLoading = !getTagListsUtil(policyTags)?.at(0) || Object.keys(policyTags ?? {}).at(0) === 'undefined';
    const {isOffline} = useNetwork();
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAGS_SETTINGS;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_TAGS_SETTINGS.path);
    // Multi-level tag settings moved to Rules, so the GL codes toggle is the only thing that can keep this page alive.
    const shouldBlockEmptySettings = isMultiLevelTags && !isLoading && !policyData.policy?.glCodes;

    const getTagsSettings = (policy: OnyxEntry<Policy>) => {
        const updateShowTagGLCodes = (value: boolean) => {
            setPolicyShowTagGLCodes(policyID, value, policy?.showTagGLCodes);
        };
        return (
            <View style={styles.flexGrow1}>
                {!isMultiLevelTags && (
                    <OfflineWithFeedback
                        errors={policyTags?.[policyTagLists.at(0)?.name ?? '']?.errors}
                        onClose={() =>
                            clearPolicyTagListErrors({
                                policyID,
                                tagListIndex: policyTagLists.at(0)?.orderWeight ?? 0,
                                policyTags,
                            })
                        }
                        pendingAction={policyTags?.[policyTagLists.at(0)?.name ?? '']?.pendingAction}
                        errorRowStyles={styles.mh5}
                    >
                        <MenuItemField
                            name={translate(`workspace.tags.customTagName`)}
                            onPress={() => {
                                Navigation.navigate(
                                    isQuickSettingsFlow
                                        ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAGS_EDIT.getRoute(policyTagLists.at(0)?.orderWeight ?? 0))
                                        : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EDIT_TAGS.getRoute(policyTagLists.at(0)?.orderWeight ?? 0)),
                                );
                            }}
                            value={customTagName}
                        />
                    </OfflineWithFeedback>
                )}
                {!!policy?.glCodes && (
                    <ToggleSettingOptionRow
                        title={translate('workspace.tags.showTagGLCodes')}
                        subtitle={translate('workspace.tags.showTagGLCodesSubtitle')}
                        switchAccessibilityLabel={translate('workspace.tags.showTagGLCodes')}
                        shouldPlaceSubtitleBelowSwitch
                        isActive={policy?.showTagGLCodes ?? false}
                        onToggle={updateShowTagGLCodes}
                        pendingAction={policy?.pendingFields?.showTagGLCodes}
                        disabled={!policy?.areTagsEnabled}
                        wrapperStyle={[styles.pv2, styles.mh5]}
                        errors={policy?.errorFields?.showTagGLCodes ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'showTagGLCodes')}
                    />
                )}
            </View>
        );
    };
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            shouldBeBlocked={shouldBlockEmptySettings}
        >
            {({policy}) => (
                <ScreenWrapper
                    enableEdgeToEdgeBottomSafeAreaPadding
                    style={[styles.defaultModalContainer]}
                    testID="WorkspaceTagsSettingsPage"
                >
                    <HeaderWithBackButton
                        title={translate('common.settings')}
                        onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? backPath : undefined)}
                    />
                    {isOffline && isLoading ? <FullPageOfflineBlockingView addBottomSafeAreaPadding>{getTagsSettings(policy)}</FullPageOfflineBlockingView> : getTagsSettings(policy)}
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTagsSettingsPage;
