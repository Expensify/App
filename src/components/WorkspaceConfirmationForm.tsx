import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceConfirmationAvatar from '@hooks/useWorkspaceConfirmationAvatar';
import {clearDraftValues} from '@libs/actions/FormActions';
import {generateDefaultWorkspaceName, generatePolicyID} from '@libs/actions/Policy/Policy';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {addErrorMessage} from '@libs/ErrorUtils';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AvatarWithImagePicker from './AvatarWithImagePicker';
import CurrencySelector from './CurrencySelector';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from './Form/types';
import HeaderWithBackButton from './HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from './Icon/Expensicons';
import ScrollView from './ScrollView';
import Text from './Text';
import TextInput from './TextInput';

type WorkspaceConfirmationSubmitFunctionParams = {
    name: string;
    currency: string;
    avatarFile: File | CustomRNImageManipulatorResult | undefined;
    policyID: string;
};

type WorkspaceConfirmationFormProps = {
    /** The email of the workspace owner
     * @summary Approved Accountants and Guides can enter a flow where they make a workspace for other users,
     * and those are passed as a search parameter when using transition links
     */
    policyOwnerEmail?: string;

    /** Submit function */
    onSubmit: (params: WorkspaceConfirmationSubmitFunctionParams) => void;

    /** Go back function */
    onBackButtonPress?: () => void;

    /** Whether bottom safe area padding should be added */
    addBottomSafeAreaPadding?: boolean;
};

function WorkspaceConfirmationForm({onSubmit, policyOwnerEmail = '', onBackButtonPress = () => Navigation.goBack(), addBottomSafeAreaPadding = true}: WorkspaceConfirmationFormProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ImageCropSquareMask'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM> = {};
            const name = values.name.trim();

            if (!isRequiredFulfilled(name)) {
                errors.name = translate('workspace.editor.nameIsRequiredError');
            } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
                // code units.
                addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', {length: [...name].length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            if (!isRequiredFulfilled(values[INPUT_IDS.CURRENCY])) {
                errors[INPUT_IDS.CURRENCY] = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const policyID = useMemo(() => generatePolicyID(), []);
    const [session, metadata] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT, {canBeMissing: true});

    const defaultWorkspaceName = generateDefaultWorkspaceName(policyOwnerEmail || session?.email);
    const [workspaceNameFirstCharacter, setWorkspaceNameFirstCharacter] = useState(defaultWorkspaceName ?? '');

    const userCurrency = draftValues?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    useEffect(() => {
        return () => {
            clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM);
        };
    }, []);

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
            <HeaderWithBackButton
                title={translate('workspace.new.confirmWorkspace')}
                onBackButtonPress={onBackButtonPress}
            />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
            >
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.emptyWorkspace.subtitle')}</Text>
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
                    formID={ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM}
                    submitButtonText={translate('common.confirm')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={(val) =>
                        onSubmit({
                            name: val[INPUT_IDS.NAME],
                            currency: val[INPUT_IDS.CURRENCY],
                            avatarFile,
                            policyID,
                        })
                    }
                    enabledWhenOffline
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                >
                    <View style={styles.mb4}>
                        {!isLoadingOnyxValue(metadata) && (
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
                        )}

                        <View style={[styles.mhn5, styles.mt4]}>
                            <InputWrapper
                                InputComponent={CurrencySelector}
                                inputID={INPUT_IDS.CURRENCY}
                                label={translate('workspace.editor.currencyInputLabel')}
                                value={userCurrency}
                                shouldShowCurrencySymbol
                                currencySelectorRoute={ROUTES.CURRENCY_SELECTION}
                            />
                        </View>
                    </View>
                </FormProvider>
            </ScrollView>
        </>
    );
}

WorkspaceConfirmationForm.displayName = 'WorkspaceConfirmationForm';

export default WorkspaceConfirmationForm;

export type {WorkspaceConfirmationSubmitFunctionParams};
