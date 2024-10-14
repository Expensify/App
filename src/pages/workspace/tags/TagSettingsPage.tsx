import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
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

type TagSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_SETTINGS>;

function TagSettingsPage({route, navigation}: TagSettingsPageProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`);
    const {orderWeight, policyID, tagName, backTo} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyTag = useMemo(() => PolicyUtils.getTagList(policyTags, orderWeight), [policyTags, orderWeight]);
    const policy = usePolicy(policyID);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    const {canUseCategoryAndTagApprovers} = usePermissions();
    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = React.useState(false);
    const isQuickSettingsFlow = !isEmpty(backTo);

    const currentPolicyTag = policyTag.tags[tagName] ?? Object.values(policyTag.tags ?? {}).find((tag) => tag.previousTagName === tagName);

    useEffect(() => {
        if (currentPolicyTag?.name === tagName || !currentPolicyTag) {
            return;
        }
        navigation.setParams({tagName: currentPolicyTag?.name});
    }, [tagName, currentPolicyTag, navigation]);

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const deleteTagAndHideModal = () => {
        Tag.deletePolicyTags(policyID, [currentPolicyTag.name]);
        setIsDeleteTagModalOpen(false);
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined);
    };

    const updateWorkspaceTagEnabled = (value: boolean) => {
        setWorkspaceTagEnabled(policyID, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}}, policyTag.orderWeight);
    };

    const navigateToEditTag = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
    };

    const navigateToEditGlCode = () => {
        if (!PolicyUtils.isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.glCodes.alias,
                    isQuickSettingsFlow
                        ? ROUTES.SETTINGS_TAG_GL_CODE.getRoute(policy?.id ?? '', orderWeight, tagName, backTo)
                        : ROUTES.WORKSPACE_TAG_GL_CODE.getRoute(policy?.id ?? '', orderWeight, tagName),
                ),
            );
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
    };

    const navigateToEditTagApprover = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const isMultiLevelTags = PolicyUtils.isMultiLevelTags(policyTags);
    const tagApprover = PolicyUtils.getTagApproverRule(policyID, route.params.tagName)?.approver;

    const shouldShowDeleteMenuItem = !isThereAnyAccountingConnection && !isMultiLevelTags;
    const workflowApprovalsUnavailable = PolicyUtils.getWorkflowApprovalsUnavailable(policy);
    const approverDisabled = !policy?.areWorkflowsEnabled || workflowApprovalsUnavailable;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={TagSettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={PolicyUtils.getCleanedTagName(tagName)}
                    shouldSetModalVisibility={false}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined)}
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
                        onClose={() => Tag.clearPolicyTagErrors(policyID, tagName, orderWeight)}
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
                            description={translate(`common.name`)}
                            onPress={navigateToEditTag}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.['GL Code']}>
                        <MenuItemWithTopDescription
                            title={currentPolicyTag['GL Code']}
                            description={translate(`workspace.tags.glCode`)}
                            onPress={navigateToEditGlCode}
                            iconRight={hasAccountingConnections ? Expensicons.Lock : undefined}
                            interactive={!hasAccountingConnections}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>

                    {policy?.areRulesEnabled && canUseCategoryAndTagApprovers && (
                        <>
                            <View style={[styles.mh5, styles.mv3, styles.pt3, styles.borderTop]}>
                                <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.tags.tagRules')}</Text>
                            </View>
                            <MenuItemWithTopDescription
                                title={tagApprover ?? ''}
                                description={translate(`workspace.tags.approverDescription`)}
                                onPress={navigateToEditTagApprover}
                                shouldShowRightIcon
                                disabled={approverDisabled}
                            />
                            {approverDisabled && (
                                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mv2, styles.mh5]}>
                                    <Text style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.goTo')}</Text>{' '}
                                    <TextLink
                                        style={[styles.link, styles.label]}
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID))}
                                    >
                                        {translate('workspace.common.moreFeatures')}
                                    </TextLink>{' '}
                                    <Text style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.andEnableWorkflows')}</Text>
                                </Text>
                            )}
                        </>
                    )}

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

export default TagSettingsPage;
