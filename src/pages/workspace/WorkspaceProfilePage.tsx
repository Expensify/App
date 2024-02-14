import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CurrencyList} from '@src/types/onyx';
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

    const formattedCurrency = !isEmptyObject(policy) && !isEmptyObject(currencyList) ? `${policy?.outputCurrency ?? ''} - ${currencyList?.[policy?.outputCurrency ?? '']?.symbol ?? ''}` : '';

    const onPressCurrency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_CURRENCY.getRoute(policy?.id ?? '')), [policy?.id]);
    const onPressName = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE_NAME.getRoute(policy?.id ?? '')), [policy?.id]);

    const policyName = policy?.name ?? '';
    const readOnly = !PolicyUtils.isPolicyAdmin(policy);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.profile')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_PROFILE}
            shouldShowLoading={false}
            shouldUseScrollView
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
        >
            {(hasVBA?: boolean) => (
                <>
                    <AvatarWithImagePicker
                        onViewPhotoPress={() => Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policy?.id ?? ''))}
                        source={lodashGet(policy, 'avatar')}
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
                        style={[styles.mb3, styles.mt5, styles.mh5]}
                        isUsingDefaultAvatar={!lodashGet(policy, 'avatar', null)}
                        onImageSelected={(file: File) => Policy.updateWorkspaceAvatar(policy?.id ?? '', file)}
                        onImageRemoved={() => Policy.deleteWorkspaceAvatar(lodashGet(policy, 'id', ''))}
                        editorMaskImage={Expensicons.ImageCropSquareMask}
                        pendingAction={lodashGet(policy, 'pendingFields.avatar', null)}
                        errors={lodashGet(policy, 'errorFields.avatar', null)}
                        onErrorClose={() => Policy.clearAvatarErrors(policy?.id ?? '')}
                        previewSource={UserUtils.getFullSizeAvatar(policy?.avatar ?? '')}
                        headerTitle={translate('workspace.common.workspaceAvatar')}
                        originalFileName={policy?.originalFileName}
                        disabled={readOnly}
                        disabledStyle={styles.cursorDefault}
                        errorRowStyles={undefined}
                    />
                    <OfflineWithFeedback pendingAction={lodashGet(policy, 'pendingFields.generalSettings')}>
                        <MenuItemWithTopDescription
                            title={policy?.name ?? ''}
                            description={translate('workspace.editor.nameInputLabel')}
                            shouldShowRightIcon={!readOnly}
                            disabled={readOnly}
                            onPress={onPressName}
                            shouldGreyOutWhenDisabled={false}
                            shouldUseDefaultCursorWhenDisabled
                        />

                        <View>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={translate('workspace.editor.currencyInputLabel')}
                                shouldShowRightIcon={!readOnly}
                                disabled={hasVBA ?? readOnly}
                                onPress={onPressCurrency}
                                shouldGreyOutWhenDisabled={false}
                                shouldUseDefaultCursorWhenDisabled
                            />
                            <Text style={[styles.textLabel, styles.colorMuted, styles.mt1, styles.mh5]}>
                                {hasVBA ? translate('workspace.editor.currencyInputDisabledText') : translate('workspace.editor.currencyInputHelpText')}
                            </Text>
                        </View>
                    </OfflineWithFeedback>
                </>
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
