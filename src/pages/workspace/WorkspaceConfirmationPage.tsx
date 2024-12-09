import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import CurrencyPicker from '@components/CurrencyPicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {getCurrency} from '@libs/CurrencyUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import withPolicy from './withPolicy';

function getFirstAlphaNumericCharacter(str = '') {
    return str
        .normalize('NFD')
        .replace(/[^0-9a-z]/gi, '')
        .toUpperCase()[0];
}

function WorkspaceConfirmationPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM> = {};
            const name = values.name.trim();

            if (!ValidationUtils.isRequiredFulfilled(name)) {
                errors.name = translate('workspace.editor.nameIsRequiredError');
            } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
                // code units.
                ErrorUtils.addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', {length: [...name].length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            return errors;
        },
        [translate],
    );

    const currentUrl = getCurrentUrl();
    const policyID = useMemo(() => Policy.generatePolicyID(), []);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = currentUrl ? new URL(currentUrl).searchParams.get('ownerEmail') ?? '' : '';

    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const defaultWorkspaceName = Policy.generateDefaultWorkspaceName(policyOwnerEmail);
    const [workspaceNameFirstCharacter, setWorkspaceNameFirstCharacter] = useState(defaultWorkspaceName ?? '');

    const userCurrency = allPersonalDetails?.[session?.accountID ?? 0]?.localCurrencyCode ?? CONST.CURRENCY.USD;
    const [currencyCode, setCurrencyCode] = useState(userCurrency);

    const currency = getCurrency(currencyCode);
    const [workspaceAvatar, setWorkspaceAvatar] = useState<{avatarUri: string | null; avatarFileName?: string | null; avatarFileType?: string | null}>({
        avatarUri: null,
        avatarFileName: null,
        avatarFileType: null,
    });
    const [avatarFile, setAvatarFile] = useState<File | CustomRNImageManipulatorResult | undefined>();

    const stashedLocalAvatarImage = workspaceAvatar?.avatarUri ?? undefined;

    const DefaultAvatar = useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXLarge}
                imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
                source={workspaceAvatar?.avatarUri || ReportUtils.getDefaultWorkspaceAvatar(workspaceNameFirstCharacter)}
                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.XLARGE}
                name={workspaceNameFirstCharacter}
                avatarID={policyID}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [workspaceAvatar?.avatarUri, workspaceNameFirstCharacter, styles.alignSelfCenter, styles.avatarXLarge, policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={WorkspaceConfirmationPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.new.confirmWorkspace')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
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
                    size={CONST.AVATAR_SIZE.XLARGE}
                    avatarStyle={[styles.avatarXLarge, styles.alignSelfCenter]}
                    shouldDisableViewPhoto
                    editIcon={Expensicons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    shouldUseStyleUtilityForAnchorPosition
                    type={CONST.ICON_TYPE_WORKSPACE}
                    style={[styles.w100, styles.alignItemsCenter, styles.mv4, styles.mb6, styles.alignSelfCenter]}
                    DefaultAvatar={DefaultAvatar}
                    editorMaskImage={Expensicons.ImageCropSquareMask}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM}
                    submitButtonText={translate('common.confirm')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={(val) => {
                        App.createWorkspaceWithPolicyDraftAndNavigateToIt('', val[INPUT_IDS.NAME], false, false, '', policyID, currencyCode, avatarFile as File);
                    }}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.common.workspaceName')}
                            accessibilityLabel={translate('workspace.common.workspaceName')}
                            spellCheck={false}
                            autoFocus
                            defaultValue={defaultWorkspaceName}
                            onChangeText={(str) => {
                                if (getFirstAlphaNumericCharacter(str) === getFirstAlphaNumericCharacter(workspaceNameFirstCharacter)) {
                                    return;
                                }
                                setWorkspaceNameFirstCharacter(str);
                            }}
                        />

                        <View style={[styles.mhn5, styles.mt4]}>
                            <InputWrapper
                                InputComponent={CurrencyPicker}
                                value={`${currencyCode} - ${currency?.symbol}`}
                                inputID={INPUT_IDS.CURRENCY}
                                label={translate('workspace.editor.currencyInputLabel')}
                                selectedCurrency={currency?.symbol}
                                onValueChange={(val) => {
                                    setCurrencyCode(val as string);
                                }}
                            />
                        </View>
                    </View>
                </FormProvider>
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceConfirmationPage.displayName = 'WorkspaceConfirmationPage';

export default withPolicy(WorkspaceConfirmationPage);
