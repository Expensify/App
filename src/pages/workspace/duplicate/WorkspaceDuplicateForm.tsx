import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceConfirmationAvatar from '@hooks/useWorkspaceConfirmationAvatar';
import {generatePolicyID, setDuplicateWorkspaceData} from '@libs/actions/Policy/Policy';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {addErrorMessage} from '@libs/ErrorUtils';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceDuplicateForm';

type WorkspaceDuplicateFormProps = {
    policyID?: string;
};

function WorkspaceDuplicateForm({policyID}: WorkspaceDuplicateFormProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ImageCropSquareMask'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(policyID);
    const defaultWorkspaceName = `${policy?.name} (${translate('workspace.common.duplicateWorkspacePrefix')})`;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_DUPLICATE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_DUPLICATE_FORM> = {};
            const name = values.name.trim();

            if (!isRequiredFulfilled(name)) {
                errors.name = translate('workspace.editor.nameIsRequiredError');
            } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
                // code units.
                addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', {length: [...name].length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            return errors;
        },
        [translate],
    );

    const onSubmit = useCallback(
        ({name, avatarFile}: {name?: string; avatarFile?: File | CustomRNImageManipulatorResult}) => {
            if (!policyID) {
                return;
            }
            const newPolicyID = generatePolicyID();
            setDuplicateWorkspaceData({policyID: newPolicyID, name, fileURI: avatarFile?.uri});
            Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE_SELECT_FEATURES.getRoute(policyID));
        },
        [policyID],
    );

    const [workspaceNameFirstCharacter, setWorkspaceNameFirstCharacter] = useState(defaultWorkspaceName ?? '');

    const [workspaceAvatar, setWorkspaceAvatar] = useState<{avatarUri: string | null; avatarFileName?: string | null; avatarFileType?: string | null}>({
        avatarUri: null,
        avatarFileName: null,
        avatarFileType: null,
    });
    const [avatarFile, setAvatarFile] = useState<File | CustomRNImageManipulatorResult | undefined>();

    const stashedLocalAvatarImage = workspaceAvatar?.avatarUri ?? undefined;

    const DefaultAvatar = useWorkspaceConfirmationAvatar({
        policyID,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
        source: stashedLocalAvatarImage || getDefaultWorkspaceAvatar(workspaceNameFirstCharacter),
        name: workspaceNameFirstCharacter,
    });

    return (
        <>
            <HeaderWithBackButton title={translate('workspace.common.duplicateWorkspace')} />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
            >
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.textHeadline]}>{translate('workspace.duplicateWorkspace.title')}</Text>
                </View>
                <AvatarWithImagePicker
                    isUsingDefaultAvatar={!stashedLocalAvatarImage}
                    // eslint-disable-next-line react-compiler/react-compiler
                    avatarID={policyID}
                    source={stashedLocalAvatarImage}
                    onImageSelected={(image) => {
                        setAvatarFile(image);
                        setWorkspaceAvatar({avatarUri: image.uri ?? '', avatarFileName: image.name ?? '', avatarFileType: image.type});
                    }}
                    onImageRemoved={() => {
                        setAvatarFile(undefined);
                        setWorkspaceAvatar({avatarUri: null, avatarFileName: null, avatarFileType: null});
                    }}
                    size={CONST.AVATAR_SIZE.X_LARGE}
                    avatarStyle={[styles.avatarXLarge, styles.alignSelfCenter]}
                    editIcon={Expensicons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    type={CONST.ICON_TYPE_WORKSPACE}
                    style={[styles.w100, styles.alignItemsCenter, styles.mv4, styles.mb6, styles.alignSelfCenter, styles.ph5]}
                    DefaultAvatar={DefaultAvatar}
                    editorMaskImage={icons.ImageCropSquareMask}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_DUPLICATE_FORM}
                    submitButtonText={translate('common.next')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={(val) =>
                        onSubmit({
                            name: val[INPUT_IDS.NAME],
                            avatarFile,
                        })
                    }
                    enabledWhenOffline
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.common.workspaceName')}
                            accessibilityLabel={translate('workspace.common.workspaceName')}
                            spellCheck={false}
                            defaultValue={defaultWorkspaceName}
                            onChangeText={(str) => {
                                if (getFirstAlphaNumericCharacter(str) === getFirstAlphaNumericCharacter(workspaceNameFirstCharacter)) {
                                    return;
                                }
                                setWorkspaceNameFirstCharacter(str);
                            }}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScrollView>
        </>
    );
}

WorkspaceDuplicateForm.displayName = 'WorkspaceDuplicateForm';

export default WorkspaceDuplicateForm;
