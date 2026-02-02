import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
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
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import PlanTypeSelector from './PlanTypeSelector';
import ScrollView from './ScrollView';
import Switch from './Switch';
import Text from './Text';
import TextInput from './TextInput';

type PolicyType = typeof CONST.POLICY.TYPE.TEAM | typeof CONST.POLICY.TYPE.CORPORATE;

type WorkspaceConfirmationSubmitFunctionParams = {
    name: string;
    currency: string;
    planType?: PolicyType;
    owner?: string;
    makeMeAdmin: boolean;
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
    const icons = useMemoizedLazyExpensifyIcons(['Camera', 'ImageCropSquareMask']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const scrollViewRef = useRef<RNScrollView>(null);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isApprovedAccountant = !!account?.isApprovedAccountant || true;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM> = {};
            const name = values.name.trim();

            if (!isRequiredFulfilled(name)) {
                errors.name = translate('workspace.editor.nameIsRequiredError');
            } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
                // code units.
                addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', [...name].length, CONST.TITLE_CHARACTER_LIMIT));
            }

            if (!isRequiredFulfilled(values[INPUT_IDS.CURRENCY])) {
                errors[INPUT_IDS.CURRENCY] = translate('common.error.fieldRequired');
            }

            // Only validate plan type and owner for approved accountants
            if (isApprovedAccountant) {
                if (!isRequiredFulfilled(values[INPUT_IDS.PLAN_TYPE])) {
                    errors[INPUT_IDS.PLAN_TYPE] = translate('common.error.fieldRequired');
                }

                if (!isRequiredFulfilled(values[INPUT_IDS.OWNER])) {
                    errors[INPUT_IDS.OWNER] = translate('common.error.fieldRequired');
                }
            }

            return errors;
        },
        [translate, isApprovedAccountant],
    );

    const policyID = useMemo(() => generatePolicyID(), []);
    const [session, metadata] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT, {canBeMissing: true});

    const defaultWorkspaceName = generateDefaultWorkspaceName(policyOwnerEmail || session?.email);
    const [workspaceNameFirstCharacter, setWorkspaceNameFirstCharacter] = useState(defaultWorkspaceName ?? '');

    const userCurrency = draftValues?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    const isMemberOfControlWorkspace = useMemo(() => {
        if (!policies) {
            return false;
        }
        return Object.values(policies).some((policy) => policy && policy.type === CONST.POLICY.TYPE.CORPORATE);
    }, [policies]);

    const defaultPlanType = isMemberOfControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
    const userPlanType = draftValues?.planType ?? defaultPlanType;
    const defaultOwner = session?.email ?? policyOwnerEmail ?? '';
    const userOwner = draftValues?.owner ?? defaultOwner;
    const ownerDisplayName = userOwner;

    const [makeMeAdmin, setMakeMeAdmin] = useState(true);
    const currentUserEmail = session?.email ?? '';
    const isOwnerDifferentFromCurrentUser = userOwner !== currentUserEmail && currentUserEmail !== '';

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
                ref={scrollViewRef}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
                onContentSizeChange={() => {
                    if (!isApprovedAccountant) {
                        return;
                    }
                    scrollViewRef.current?.scrollToEnd({animated: true});
                }}
            >
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.emptyWorkspace.subtitle')}</Text>
                </View>
                <AvatarWithImagePicker
                    isUsingDefaultAvatar={!stashedLocalAvatarImage}
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
                    editIcon={icons.Camera}
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
                    onSubmit={(val) => {
                        onSubmit({
                            name: val[INPUT_IDS.NAME],
                            currency: val[INPUT_IDS.CURRENCY],
                            planType: isApprovedAccountant ? (val[INPUT_IDS.PLAN_TYPE] as PolicyType) : undefined,
                            owner: isApprovedAccountant ? val[INPUT_IDS.OWNER] : '',
                            makeMeAdmin: isApprovedAccountant && isOwnerDifferentFromCurrentUser ? makeMeAdmin : false,
                            avatarFile,
                            policyID,
                        });
                    }}
                    enabledWhenOffline
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                    shouldScrollToEnd={isApprovedAccountant}
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
                        {isApprovedAccountant && (
                            <>
                                <View style={[styles.mhn5]}>
                                    <InputWrapper
                                        InputComponent={PlanTypeSelector}
                                        inputID={INPUT_IDS.PLAN_TYPE}
                                        label={translate('workspace.common.planType')}
                                        defaultValue={userPlanType}
                                    />
                                </View>

                                <View style={[styles.mhn5]}>
                                    <InputWrapper
                                        InputComponent={MenuItemWithTopDescription}
                                        inputID={INPUT_IDS.OWNER}
                                        description={translate('workspace.common.workspaceOwner')}
                                        title={ownerDisplayName}
                                        interactive
                                        shouldShowRightIcon
                                        onPress={() => {
                                            Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION_OWNER_SELECTOR.route as never);
                                        }}
                                        value={userOwner}
                                    />
                                </View>

                                {isOwnerDifferentFromCurrentUser && (
                                    <View style={[styles.mhn5]}>
                                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph5, styles.pv3]}>
                                            <View style={styles.flex1}>
                                                <Text style={[styles.textNormal]}>{translate('workspace.common.keepMeAsAdmin')}</Text>
                                            </View>
                                            <Switch
                                                accessibilityLabel={translate('workspace.common.keepMeAsAdmin')}
                                                isOn={makeMeAdmin}
                                                onToggle={setMakeMeAdmin}
                                            />
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </FormProvider>
            </ScrollView>
        </>
    );
}

export default WorkspaceConfirmationForm;

export type {WorkspaceConfirmationSubmitFunctionParams};
