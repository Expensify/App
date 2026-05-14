import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {buildOptimisticChatReport, getCommentLength, getParsedComment} from '@libs/ReportUtils';
import {isExistingRoomName, isReservedRoomName, isValidRoomNameWithoutLimits} from '@libs/ValidationUtils';
import variables from '@styles/variables';
import {addPolicyReport, clearNewRoomFormError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [visibility, setVisibility] = useState<ValueOf<typeof CONST.REPORT.VISIBILITY>>(CONST.REPORT.VISIBILITY.RESTRICTED);
    const [writeCapability, setWriteCapability] = useState<ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>>(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const isAdminPolicy = isPolicyAdmin(policy);
    const visibilityDescription = translate(`newRoomPage.${visibility}Description`);
    const inputRef = useRef<AnimatedTextInputRef | null>(null);

    // because we are reusing NEW_ROOM_FORM, used in New Chat we need to clear the form first
    useEffect(() => {
        clearNewRoomFormError();
    }, []);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>): OnyxCommon.Errors => {
        const errors: {roomName?: string; reportDescription?: string} = {};

        if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
            addErrorMessage(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
        } else if (values.roomName !== CONST.POLICY.ROOM_PREFIX && !isValidRoomNameWithoutLimits(values.roomName)) {
            addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
        } else if (isReservedRoomName(values.roomName)) {
            addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameReservedError', values.roomName));
        } else if (isExistingRoomName(values.roomName, reports, policyID)) {
            addErrorMessage(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
        } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
            addErrorMessage(errors, 'roomName', translate('common.error.characterLimitExceedCounter', values.roomName.length, CONST.TITLE_CHARACTER_LIMIT));
        }

        const descriptionLength = getCommentLength(values.reportDescription, {policyID});
        if (descriptionLength > CONST.REPORT_DESCRIPTION.MAX_LENGTH) {
            addErrorMessage(errors, 'reportDescription', translate('common.error.characterLimitExceedCounter', descriptionLength, CONST.REPORT_DESCRIPTION.MAX_LENGTH));
        }

        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>) => {
        const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const parsedDescription = getParsedComment(values.reportDescription ?? '', {policyID});
        const policyReport = buildOptimisticChatReport({
            participantList: [currentUserAccountID],
            reportName: values.roomName,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID,
            ownerAccountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
            visibility,
            writeCapability: writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL,
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
            description: parsedDescription,
            currentUserAccountID,
        });

        addPolicyReport(policyReport);
        Navigation.goBack(ROUTES.WORKSPACE_ROOMS.getRoute(policyID));
    };

    const writeCapabilityOptions = Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
        value,
        label: translate(`writeCapabilityPage.writeCapability.${value}`),
    }));

    const visibilityOptions = Object.values(CONST.REPORT.VISIBILITY)
        .filter((visibilityOption) => visibilityOption !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE)
        .map((visibilityOption) => ({
            label: translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
            description: translate(`newRoomPage.${visibilityOption}Description`),
        }));

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => inputRef.current?.focus()}
            shouldEnableMaxHeight
            shouldEnableKeyboardAvoidingView
            testID="WorkspaceRoomCreatePage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('newRoomPage.createRoom')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ROOMS.getRoute(policyID))}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                submitButtonText={translate('newRoomPage.createRoom')}
                style={[styles.flex1]}
                submitButtonStyles={[styles.ph5, styles.pb3]}
                validate={validate}
                onSubmit={submit}
                enabledWhenOffline
            >
                <View style={[styles.ph5, styles.mb5]}>
                    <InputWrapper
                        ref={inputRef}
                        InputComponent={RoomNameInput}
                        inputID={INPUT_IDS.ROOM_NAME}
                        isFocused={false}
                    />
                </View>
                <View style={[styles.ph5, styles.mb5]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.REPORT_DESCRIPTION}
                        label={translate('reportDescriptionPage.roomDescriptionOptional')}
                        accessibilityLabel={translate('reportDescriptionPage.roomDescriptionOptional')}
                        role={CONST.ROLE.PRESENTATION}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        autoCapitalize="none"
                        shouldInterceptSwipe
                        type="markdown"
                    />
                </View>
                <MenuItemWithTopDescription
                    description={translate('workspace.common.workspace')}
                    title={policy?.name}
                    interactive={false}
                />
                {isAdminPolicy && (
                    <View style={[styles.ph5, styles.mhn5]}>
                        <InputWrapper
                            InputComponent={ValuePicker}
                            inputID={INPUT_IDS.WRITE_CAPABILITY}
                            label={translate('writeCapabilityPage.label')}
                            items={writeCapabilityOptions}
                            value={writeCapability}
                            onValueChange={(value) => setWriteCapability(value as typeof writeCapability)}
                        />
                    </View>
                )}
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={ValuePicker}
                        inputID={INPUT_IDS.VISIBILITY}
                        label={translate('newRoomPage.visibility')}
                        items={visibilityOptions}
                        onValueChange={(value) => setVisibility(value as typeof visibility)}
                        value={visibility}
                        furtherDetails={visibilityDescription}
                        shouldShowTooltips={false}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default WorkspaceRoomCreatePage;
