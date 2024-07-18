import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
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
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setWorkspaceTagEnabled} from '@userActions/Policy/Tag';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagList} from '@src/types/onyx';

type TagSettingsPageOnyxProps = {
    /** All policy tags */
    policyTags: OnyxEntry<PolicyTagList>;
};

type TagSettingsPageProps = TagSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_SETTINGS>;

function TagSettingsPage({route, policyTags, navigation}: TagSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyTag = useMemo(() => PolicyUtils.getTagList(policyTags, route.params.orderWeight), [policyTags, route.params.orderWeight]);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`);

    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = React.useState(false);

    const currentPolicyTag = policyTag.tags[route.params.tagName] ?? Object.values(policyTag.tags ?? {}).find((tag) => tag.previousTagName === route.params.tagName);

    useEffect(() => {
        if (currentPolicyTag?.name === route.params.tagName || !currentPolicyTag) {
            return;
        }
        navigation.setParams({tagName: currentPolicyTag?.name});
    }, [route.params.tagName, currentPolicyTag, navigation]);

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const deleteTagAndHideModal = () => {
        Tag.deletePolicyTags(route.params.policyID, [currentPolicyTag.name]);
        setIsDeleteTagModalOpen(false);
        Navigation.goBack();
    };

    const updateWorkspaceTagEnabled = (value: boolean) => {
        setWorkspaceTagEnabled(route.params.policyID, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}}, policyTag.orderWeight);
    };

    const navigateToEditTag = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_EDIT.getRoute(route.params.policyID, route.params.orderWeight, currentPolicyTag.name));
    };

    const navigateToEditGlCode = () => {
        if (!PolicyUtils.isControlPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(route.params.policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.glCodes.alias));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_TAG_GL_CODE.getRoute(route.params.policyID, route.params.orderWeight, currentPolicyTag.name));
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const isMultiLevelTags = PolicyUtils.isMultiLevelTags(policyTags);

    const shouldShowDeleteMenuItem = !isThereAnyAccountingConnection && !isMultiLevelTags;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={TagSettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={PolicyUtils.getCleanedTagName(route.params.tagName)}
                    shouldSetModalVisibility={false}
                />
                <ConfirmModal
                    title={translate('workspace.tags.deleteTag')}
                    isVisible={isDeleteTagModalOpen}
                    onConfirm={deleteTagAndHideModal}
                    onCancel={() => setIsDeleteTagModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.tags.deleteTagConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <View style={styles.flexGrow1}>
                    <OfflineWithFeedback
                        errors={ErrorUtils.getLatestErrorMessageField(currentPolicyTag)}
                        pendingAction={currentPolicyTag.pendingFields?.enabled}
                        errorRowStyles={styles.mh5}
                        onClose={() => Tag.clearPolicyTagErrors(route.params.policyID, route.params.tagName, route.params.orderWeight)}
                    >
                        <View style={[styles.mt2, styles.mh5]}>
                            <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text>{translate('workspace.tags.enableTag')}</Text>
                                <Switch
                                    isOn={currentPolicyTag.enabled}
                                    accessibilityLabel={translate('workspace.tags.enableTag')}
                                    onToggle={updateWorkspaceTagEnabled}
                                />
                            </View>
                        </View>
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.name}>
                        <MenuItemWithTopDescription
                            title={PolicyUtils.getCleanedTagName(currentPolicyTag.name)}
                            description={translate(`workspace.tags.tagName`)}
                            onPress={navigateToEditTag}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.['GL Code']}>
                        <MenuItemWithTopDescription
                            title={currentPolicyTag['GL Code']}
                            description={translate(`workspace.tags.glCode`)}
                            onPress={navigateToEditGlCode}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    {shouldShowDeleteMenuItem && (
                        <MenuItem
                            icon={Expensicons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => setIsDeleteTagModalOpen(true)}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

TagSettingsPage.displayName = 'TagSettingsPage';

export default withOnyx<TagSettingsPageProps, TagSettingsPageOnyxProps>({
    policyTags: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
    },
})(TagSettingsPage);
