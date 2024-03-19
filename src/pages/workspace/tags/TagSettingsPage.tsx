import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Trashcan} from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
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
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagList} from '@src/types/onyx';

type TagSettingsPageOnyxProps = {
    /** All policy tags */
    policyTags: OnyxEntry<PolicyTagList>;
};

type TagSettingsPageProps = TagSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_SETTINGS>;

function TagSettingsPage({route, policyTags}: TagSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyTag = useMemo(() => PolicyUtils.getTagList(policyTags, 0), [policyTags]);

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

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={TagSettingsPage.displayName}
                >
                    <HeaderWithBackButton
                        title={route.params.tagName}
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
                        <MenuItemWithTopDescription
                            title={currentPolicyTag.name}
                            description={translate(`workspace.tags.tagName`)}
                        />
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

TagSettingsPage.displayName = 'TagSettingsPage';

export default withOnyx<TagSettingsPageProps, TagSettingsPageOnyxProps>({
    policyTags: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
    },
})(TagSettingsPage);
