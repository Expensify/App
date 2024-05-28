import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
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
    const policyTag = useMemo(() => PolicyUtils.getTagList(policyTags, 0), [policyTags]);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`);

    const {windowWidth} = useWindowDimensions();

    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = React.useState(false);

    const currentPolicyTag =
        policyTag.tags[decodeURIComponent(route.params.tagName)] ?? Object.values(policyTag.tags ?? {}).find((tag) => tag.previousTagName === decodeURIComponent(route.params.tagName));

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
        setWorkspaceTagEnabled(route.params.policyID, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}});
    };

    const navigateToEditTag = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_EDIT.getRoute(route.params.policyID, currentPolicyTag.name));
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const isMultiLevelTags = PolicyUtils.isMultiLevelTags(policyTags);
    const threeDotsMenuItems = [];
    if (!isThereAnyAccountingConnection && !isMultiLevelTags) {
        threeDotsMenuItems.push({
            icon: Trashcan,
            text: translate('workspace.tags.deleteTag'),
            onSelected: () => setIsDeleteTagModalOpen(true),
        });
    }

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
                    shouldShowThreeDotsButton={threeDotsMenuItems.length > 0}
                    shouldSetModalVisibility={false}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                    threeDotsMenuItems={threeDotsMenuItems}
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
                        onClose={() => Tag.clearPolicyTagErrors(route.params.policyID, route.params.tagName)}
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
