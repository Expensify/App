import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useCallback, useState} from 'react';
import type {ImageStyle, StyleProp} from 'react-native';
import {Image, StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkSpaceProfilePageOnyxProps = {
    /** Constant, list of available currencies */
    currencyList: OnyxEntry<OnyxTypes.CurrencyList>;
};

type WorkSpaceProfilePageProps = WithPolicyProps & WorkSpaceProfilePageOnyxProps;

const parser = new ExpensiMark();

function WorkspaceProfilePage({policy, currencyList = {}, route}: WorkSpaceProfilePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const illustrations = useThemeIllustrations();
    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();
    const {canUseSpotnanaTravel} = usePermissions();

    const outputCurrency = policy?.outputCurrency ?? '';
    const currencySymbol = currencyList?.[outputCurrency]?.symbol ?? '';
    const formattedCurrency = !isEmptyObject(policy) && !isEmptyObject(currencyList) ? `${outputCurrency} - ${currencySymbol}` : '';

    const [street1, street2] = (policy?.address?.addressStreet ?? '').split('\n');
    const formattedAddress =
        !isEmptyObject(policy) && !isEmptyObject(policy.address)
            ? `${street1?.trim()}, ${street2 ? `${street2.trim()}, ` : ''}${policy.address.city}, ${policy.address.state} ${policy.address.zipCode ?? ''}`
            : '';

    const onPressCurrency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_CURRENCY.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressAddress = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressName = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_NAME.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressDescription = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressShare = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_SHARE.getRoute(policy?.id ?? '')), [policy?.id]);

    const policyName = policy?.name ?? '';
    const policyDescription =
        // policy?.description can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        policy?.description ||
        parser.replace(
            translate('workspace.common.welcomeNote', {
                workspaceName: policy?.name ?? '',
            }),
        );
    const readOnly = !PolicyUtils.isPolicyAdmin(policy);
    const imageStyle: StyleProp<ImageStyle> = isSmallScreenWidth ? [styles.mhv12, styles.mhn5, styles.mbn5] : [styles.mhv8, styles.mhn8, styles.mbn5];
    const shouldShowAddress = !readOnly || formattedAddress;

    const DefaultAvatar = useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXLarge}
                imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
                source={policy?.avatarURL || ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.XLARGE}
                name={policyName}
                accountID={policy?.id ?? ''}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [policy?.avatarURL, policy?.id, policyName, styles.alignSelfCenter, styles.avatarXLarge],
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const confirmDeleteAndHideModal = useCallback(() => {
        if (!policy?.id || !policyName) {
            return;
        }

        Policy.deleteWorkspace(policy?.id, policyName);
        setIsDeleteModalOpen(false);

        // If the workspace being deleted is the active workspace, switch to the "All Workspaces" view
        if (activeWorkspaceID === policy?.id) {
            setActiveWorkspaceID(undefined);
            Navigation.navigateWithSwitchPolicyID({policyID: undefined});
        }
    }, [policy?.id, policyName, activeWorkspaceID, setActiveWorkspaceID]);
    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.profile')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_PROFILE}
            shouldShowLoading={false}
            shouldUseScrollView
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
            icon={Illustrations.House}
        >
            {(hasVBA?: boolean) => (
                <View style={[styles.flex1, styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        isCentralPane
                        title=""
                    >
                        <Image
                            style={StyleSheet.flatten([styles.wAuto, styles.h68, imageStyle])}
                            source={illustrations.WorkspaceProfile}
                            resizeMode="cover"
                        />
                        <AvatarWithImagePicker
                            onViewPhotoPress={() => Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policy?.id ?? ''))}
                            source={policy?.avatarURL ?? ''}
                            size={CONST.AVATAR_SIZE.XLARGE}
                            avatarStyle={styles.avatarXLarge}
                            enablePreview
                            DefaultAvatar={DefaultAvatar}
                            type={CONST.ICON_TYPE_WORKSPACE}
                            fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                            style={[
                                policy?.errorFields?.avatarURL ?? isSmallScreenWidth ? styles.mb1 : styles.mb3,
                                isSmallScreenWidth ? styles.mtn17 : styles.mtn20,
                                styles.alignItemsStart,
                                styles.sectionMenuItemTopDescription,
                            ]}
                            editIconStyle={styles.smallEditIconWorkspace}
                            isUsingDefaultAvatar={!policy?.avatarURL ?? false}
                            onImageSelected={(file) => Policy.updateWorkspaceAvatar(policy?.id ?? '', file as File)}
                            onImageRemoved={() => Policy.deleteWorkspaceAvatar(policy?.id ?? '')}
                            editorMaskImage={Expensicons.ImageCropSquareMask}
                            pendingAction={policy?.pendingFields?.avatarURL}
                            errors={policy?.errorFields?.avatarURL}
                            onErrorClose={() => Policy.clearAvatarErrors(policy?.id ?? '')}
                            previewSource={UserUtils.getFullSizeAvatar(policy?.avatarURL ?? '')}
                            headerTitle={translate('workspace.common.workspaceAvatar')}
                            originalFileName={policy?.originalFileName}
                            disabled={readOnly}
                            disabledStyle={styles.cursorDefault}
                            errorRowStyles={styles.mt3}
                        />
                        <OfflineWithFeedback pendingAction={policy?.pendingFields?.generalSettings}>
                            <MenuItemWithTopDescription
                                title={policyName}
                                titleStyle={styles.workspaceTitleStyle}
                                description={translate('workspace.editor.nameInputLabel')}
                                shouldShowRightIcon={!readOnly}
                                disabled={readOnly}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, isSmallScreenWidth ? styles.mt3 : {}]}
                                onPress={onPressName}
                                shouldGreyOutWhenDisabled={false}
                                shouldUseDefaultCursorWhenDisabled
                            />
                        </OfflineWithFeedback>
                        {(!StringUtils.isEmptyString(policy?.description ?? '') || !readOnly) && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.description}
                                errors={ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.DESCRIPTION)}
                                onClose={() => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.DESCRIPTION)}
                            >
                                <MenuItemWithTopDescription
                                    title={policyDescription}
                                    description={translate('workspace.editor.descriptionInputLabel')}
                                    shouldShowRightIcon={!readOnly}
                                    disabled={readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressDescription}
                                    shouldGreyOutWhenDisabled={false}
                                    shouldUseDefaultCursorWhenDisabled
                                    shouldRenderAsHTML
                                />
                            </OfflineWithFeedback>
                        )}
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.generalSettings}
                            errors={ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS)}
                            onClose={() => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS)}
                            errorRowStyles={[styles.mt2]}
                        >
                            <View>
                                <MenuItemWithTopDescription
                                    title={formattedCurrency}
                                    description={translate('workspace.editor.currencyInputLabel')}
                                    shouldShowRightIcon={!readOnly}
                                    disabled={hasVBA ? true : readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressCurrency}
                                    shouldGreyOutWhenDisabled={false}
                                    shouldUseDefaultCursorWhenDisabled
                                    hintText={hasVBA ? translate('workspace.editor.currencyInputDisabledText') : translate('workspace.editor.currencyInputHelpText')}
                                />
                            </View>
                        </OfflineWithFeedback>
                        {canUseSpotnanaTravel && shouldShowAddress && (
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.generalSettings}>
                                <View>
                                    <MenuItemWithTopDescription
                                        title={formattedAddress}
                                        description={translate('common.companyAddress')}
                                        shouldShowRightIcon={!readOnly}
                                        disabled={readOnly}
                                        wrapperStyle={styles.sectionMenuItemTopDescription}
                                        onPress={onPressAddress}
                                        shouldGreyOutWhenDisabled={false}
                                        shouldUseDefaultCursorWhenDisabled
                                    />
                                </View>
                            </OfflineWithFeedback>
                        )}
                        {!readOnly && (
                            <View style={[styles.flexRow, styles.mt6, styles.mnw120]}>
                                <Button
                                    accessibilityLabel={translate('common.share')}
                                    text={translate('common.share')}
                                    onPress={onPressShare}
                                    medium
                                    icon={Expensicons.QrCode}
                                />
                                <Button
                                    accessibilityLabel={translate('common.delete')}
                                    text={translate('common.delete')}
                                    style={[styles.ml2]}
                                    onPress={() => setIsDeleteModalOpen(true)}
                                    medium
                                    icon={Expensicons.Trashcan}
                                />
                            </View>
                        )}
                    </Section>
                    <ConfirmModal
                        title={translate('common.delete')}
                        isVisible={isDeleteModalOpen}
                        onConfirm={confirmDeleteAndHideModal}
                        onCancel={() => setIsDeleteModalOpen(false)}
                        prompt={translate('workspace.common.deleteConfirmation')}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceProfilePage.displayName = 'WorkspaceProfilePage';

export default withPolicy(
    withOnyx<WorkSpaceProfilePageProps, WorkSpaceProfilePageOnyxProps>({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    })(WorkspaceProfilePage),
);
