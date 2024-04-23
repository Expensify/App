import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Trashcan} from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {setWorkspaceTagEnabled} from '@libs/actions/Policy';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy as PolicyType} from '@src/types/onyx';

type TagSettingsPageOnyxProps = {
    /** All policy tags */
    policy: OnyxEntry<PolicyType>;
};

type TagSettingsPageProps = TagSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_SETTINGS>;

function TagSettingsPage({route, policy}: TagSettingsPageProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyTag = useMemo(() => PolicyUtils.getTagList(policyTags, 0), [policyTags]);
    const {environmentURL} = useEnvironment();

    const {windowWidth} = useWindowDimensions();

    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = React.useState(false);

    const currentPolicyTag = policyTag.tags[decodeURIComponent(route.params.tagName)];

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const deleteTagAndHideModal = () => {
        Policy.deletePolicyTags(route.params.policyID, [currentPolicyTag.name]);
        setIsDeleteTagModalOpen(false);
        Navigation.goBack();
    };

    const updateWorkspaceTagEnabled = (value: boolean) => {
        setWorkspaceTagEnabled(route.params.policyID, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}});
    };

    const navigateToEditTag = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_EDIT.getRoute(route.params.policyID, currentPolicyTag.name));
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
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
                            shouldShowThreeDotsButton
                            shouldSetModalVisibility={false}
                            threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                            threeDotsMenuItems={[
                                {
                                    icon: Trashcan,
                                    text: translate('workspace.tags.deleteTag'),
                                    onSelected: () => setIsDeleteTagModalOpen(true),
                                },
                            ]}
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
                                onClose={() => Policy.clearPolicyTagErrors(route.params.policyID, route.params.tagName)}
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
                            {Object.keys(policy?.connections ?? {}).length > 0 ? (
                                <Text>
                                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.categories.importedFromAccountingSoftware')} `}</Text>
                                    <TextLink
                                        style={[styles.textNormal, styles.link]}
                                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyId)}`}
                                    >
                                        {`${translate('workspace.accounting.qbo')} ${translate('workspace.accounting.settings')}`}
                                    </TextLink>
                                </Text>
                            ) : (
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text>
                            )}
                            <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.name}>
                                <MenuItemWithTopDescription
                                    title={PolicyUtils.getCleanedTagName(currentPolicyTag.name)}
                                    description={translate(`workspace.tags.tagName`)}
                                    onPress={navigateToEditTag}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                        </View>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

TagSettingsPage.displayName = 'TagSettingsPage';

export default withPolicyConnections(TagSettingsPage);
