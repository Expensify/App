import React, {useCallback} from 'react';
import type {ImageStyle, StyleProp} from 'react-native';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import WorkspaceProfile from '@assets/images/workspace-profile.png';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CurrencyList} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkSpaceProfilePageOnyxProps = {
    /** Constant, list of available currencies */
    currencyList: OnyxEntry<CurrencyList>;
};

type WorkSpaceProfilePageProps = WithPolicyProps & WorkSpaceProfilePageOnyxProps;

function WorkspaceProfilePage({policy, currencyList = {}, route}: WorkSpaceProfilePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const outputCurrency = policy?.outputCurrency ?? '';
    const currencySymbol = currencyList?.[outputCurrency]?.symbol ?? '';
    const formattedCurrency = !isEmptyObject(policy) && !isEmptyObject(currencyList) ? `${outputCurrency} - ${currencySymbol}` : '';

    const onPressCurrency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_CURRENCY.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressName = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_NAME.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressDescription = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressShare = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_SHARE.getRoute(policy?.id ?? '')), [policy?.id]);

    const policyName = policy?.name ?? '';
    const policyDescription = policy?.description ?? '';
    const readOnly = !PolicyUtils.isPolicyAdmin(policy);
    const imageStyle: StyleProp<ImageStyle> = isSmallScreenWidth ? [styles.mhv12, styles.mhn5] : [styles.mhv8, styles.mhn8];

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
                <ScrollView>
                    <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            isCentralPane
                            title=""
                        >
                            <Image
                                style={StyleSheet.flatten([styles.br4, styles.wAuto, styles.h68, imageStyle])}
                                source={WorkspaceProfile}
                                resizeMode="cover"
                            />
                            <AvatarWithImagePicker
                                onViewPhotoPress={() => Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policy?.id ?? ''))}
                                source={policy?.avatar ?? ''}
                                size={CONST.AVATAR_SIZE.XLARGE}
                                avatarStyle={styles.avatarXLarge}
                                enablePreview
                                DefaultAvatar={() => (
                                    <Avatar
                                        containerStyles={styles.avatarXLarge}
                                        imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                                        source={policy?.avatar ? policy?.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                        fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                        size={CONST.AVATAR_SIZE.XLARGE}
                                        name={policyName}
                                        type={CONST.ICON_TYPE_WORKSPACE}
                                    />
                                )}
                                type={CONST.ICON_TYPE_WORKSPACE}
                                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                style={[styles.mb3, isSmallScreenWidth ? styles.mtn17 : styles.mtn20, styles.alignItemsStart, styles.sectionMenuItemTopDescription]}
                                isUsingDefaultAvatar={!policy?.avatar ?? null}
                                onImageSelected={(file: File) => Policy.updateWorkspaceAvatar(policy?.id ?? '', file)}
                                onImageRemoved={() => Policy.deleteWorkspaceAvatar(policy?.id ?? '')}
                                editorMaskImage={Expensicons.ImageCropSquareMask}
                                pendingAction={policy?.pendingFields?.avatar ?? null}
                                errors={policy?.errorFields?.avatar ?? null}
                                onErrorClose={() => Policy.clearAvatarErrors(policy?.id ?? '')}
                                previewSource={UserUtils.getFullSizeAvatar(policy?.avatar ?? '')}
                                headerTitle={translate('workspace.common.workspaceAvatar')}
                                originalFileName={policy?.originalFileName}
                                disabled={readOnly}
                                disabledStyle={styles.cursorDefault}
                                errorRowStyles={undefined}
                            />
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.generalSettings as OnyxCommon.PendingAction}>
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
                                <OfflineWithFeedback pendingAction={policy?.pendingFields?.description as OnyxCommon.PendingAction}>
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
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.generalSettings as OnyxCommon.PendingAction}>
                                <View>
                                    <MenuItemWithTopDescription
                                        title={formattedCurrency}
                                        description={translate('workspace.editor.currencyInputLabel')}
                                        shouldShowRightIcon={!readOnly}
                                        disabled={hasVBA ?? readOnly}
                                        wrapperStyle={styles.sectionMenuItemTopDescription}
                                        onPress={onPressCurrency}
                                        shouldGreyOutWhenDisabled={false}
                                        shouldUseDefaultCursorWhenDisabled
                                    />
                                    <Text style={[styles.textLabel, styles.colorMuted, styles.mt1, styles.mh5, styles.sectionMenuItemTopDescription]}>
                                        {hasVBA ? translate('workspace.editor.currencyInputDisabledText') : translate('workspace.editor.currencyInputHelpText')}
                                    </Text>
                                </View>
                            </OfflineWithFeedback>
                            {!readOnly && (
                                <View style={[styles.flexRow, styles.mnw120]}>
                                    <Button
                                        accessibilityLabel={translate('common.share')}
                                        style={styles.mt6}
                                        text={translate('common.share')}
                                        onPress={onPressShare}
                                        medium
                                    />
                                </View>
                            )}
                        </Section>
                    </View>
                </ScrollView>
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
