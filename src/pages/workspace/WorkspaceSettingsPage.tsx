import React, {useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CurrencyList} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkSpaceSettingsPageOnyxProps = {
    /** Constant, list of available currencies */
    currencyList: OnyxEntry<CurrencyList>;
};

type WorkSpaceSettingsPageProps = WithPolicyProps & WorkSpaceSettingsPageOnyxProps;

type WorkSpaceSettingsPageErrors = {name?: string};

function WorkspaceSettingsPage({policy, currencyList = {}, route}: WorkSpaceSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const formattedCurrency = !isEmptyObject(policy) && !isEmptyObject(currencyList) ? `${policy?.outputCurrency ?? ''} - ${currencyList?.[policy?.outputCurrency ?? '']?.symbol ?? ''}` : '';

    const submit = useCallback(
        (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
            Policy.updateGeneralSettings(policy?.id ?? '', values.name.trim(), policy?.outputCurrency ?? '');
            Keyboard.dismiss();
            Navigation.goBack(ROUTES.WORKSPACE_INITIAL.getRoute(policy?.id ?? ''));
        },
        [policy?.id, policy?.outputCurrency],
    );

    const validate = useCallback((values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
        const errors: WorkSpaceSettingsPageErrors = {};
        const name = values.name.trim();

        if (!ValidationUtils.isRequiredFulfilled(name)) {
            errors.name = 'workspace.editor.nameIsRequiredError';
        } else if ([...name].length > CONST.WORKSPACE_NAME_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            errors.name = 'workspace.editor.nameIsTooLongError';
        }

        return errors;
    }, []);

    const onPressCurrency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_SETTINGS_CURRENCY.getRoute(policy?.id ?? '')), [policy?.id]);

    const policyName = policy?.name ?? '';

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.settings')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_SETTINGS}
            shouldShowLoading={false}
        >
            {(hasVBA?: boolean) => (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                >
                    <AvatarWithImagePicker
                        source={policy?.avatar ?? ''}
                        size={CONST.AVATAR_SIZE.LARGE}
                        DefaultAvatar={() => (
                            <Avatar
                                containerStyles={styles.avatarLarge}
                                imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                source={policy?.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                size={CONST.AVATAR_SIZE.LARGE}
                                name={policyName}
                                type={CONST.ICON_TYPE_WORKSPACE}
                            />
                        )}
                        type={CONST.ICON_TYPE_WORKSPACE}
                        fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                        style={[styles.mb3]}
                        // @ts-expect-error TODO: Remove this once AvatarWithImagePicker (https://github.com/Expensify/App/issues/25122) is migrated to TypeScript.
                        anchorPosition={styles.createMenuPositionProfile(windowWidth)}
                        anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                        isUsingDefaultAvatar={!policy?.avatar ?? null}
                        onImageSelected={(file: File) => Policy.updateWorkspaceAvatar(policy?.id ?? '', file)}
                        onImageRemoved={() => Policy.deleteWorkspaceAvatar(policy?.id ?? '')}
                        editorMaskImage={Expensicons.ImageCropSquareMask}
                        pendingAction={policy?.pendingFields?.avatar ?? null}
                        errors={policy?.errorFields?.avatar ?? null}
                        onErrorClose={() => Policy.clearAvatarErrors(policy?.id ?? '')}
                        previewSource={UserUtils.getFullSizeAvatar(policy?.avatar ?? '')}
                        headerTitle={translate('workspace.common.workspaceAvatar')}
                        originalFileName={policy?.originalFileName ?? ''}
                        errorRowStyles={undefined}
                    />
                    <OfflineWithFeedback pendingAction={policy?.pendingFields?.generalSettings as OnyxCommon.PendingAction}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="name"
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            defaultValue={policy?.name ?? ''}
                            maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                            containerStyles={[styles.mt4]}
                            spellCheck={false}
                        />
                        <View style={[styles.mt4, styles.mhn5]}>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={translate('workspace.editor.currencyInputLabel')}
                                shouldShowRightIcon
                                disabled={hasVBA}
                                onPress={onPressCurrency}
                            />
                            <Text style={[styles.textLabel, styles.colorMuted, styles.mt2, styles.mh5]}>
                                {hasVBA ? translate('workspace.editor.currencyInputDisabledText') : translate('workspace.editor.currencyInputHelpText')}
                            </Text>
                        </View>
                    </OfflineWithFeedback>
                </FormProvider>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceSettingsPage.displayName = 'WorkspaceSettingsPage';

export default withPolicy(
    withOnyx<WorkSpaceSettingsPageProps, WorkSpaceSettingsPageOnyxProps>({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    })(WorkspaceSettingsPage),
);
