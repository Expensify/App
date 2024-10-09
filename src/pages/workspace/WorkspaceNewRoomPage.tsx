import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import * as Illustrations from '@components/Icon/Illustrations';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function WorkspaceNewRoomPage() {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [formState] = useOnyx(ONYXKEYS.FORMS.NEW_ROOM_FORM, {initWithStoredValues: false});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [visibility, setVisibility] = useState<ValueOf<typeof CONST.REPORT.VISIBILITY>>(CONST.REPORT.VISIBILITY.RESTRICTED);
    const [writeCapability, setWriteCapability] = useState<ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>>(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const wasLoading = usePrevious<boolean>(!!formState?.isLoading);
    const visibilityDescription = useMemo(() => translate(`newRoomPage.${visibility}Description`), [translate, visibility]);
    const {isLoading = false, errorFields = {}} = formState ?? {};
    const {activeWorkspaceID} = useActiveWorkspace();

    const activeWorkspaceOrDefaultID = activeWorkspaceID ?? activePolicyID;

    const workspaceOptions = useMemo(
        () =>
            PolicyUtils.getActivePolicies(policies)
                ?.filter((policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL)
                .map((policy) => ({
                    label: policy.name,
                    value: policy.id,
                }))
                .sort((a, b) => localeCompare(a.label, b.label)) ?? [],
        [policies],
    );
    const [policyID, setPolicyID] = useState<string>(() => {
        if (!!activeWorkspaceOrDefaultID && workspaceOptions.some((option) => option.value === activeWorkspaceOrDefaultID)) {
            return activeWorkspaceOrDefaultID;
        }
        return '';
    });
    const isPolicyAdmin = useMemo(() => {
        if (!policyID) {
            return false;
        }

        return ReportUtils.isPolicyAdmin(policyID, policies);
    }, [policyID, policies]);
    const [newRoomReportID, setNewRoomReportID] = useState<string>();

    /**
     * @param values - form input values passed by the Form component
     */
    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>) => {
        const participants = [session?.accountID ?? -1];
        const parsedDescription = ReportUtils.getParsedComment(values.reportDescription ?? '', {policyID});
        const policyReport = ReportUtils.buildOptimisticChatReport(
            participants,
            values.roomName,
            CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID,
            CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            visibility,
            writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            '',
            '',
            parsedDescription,
        );
        setNewRoomReportID(policyReport.reportID);
        Report.addPolicyReport(policyReport);
    };

    useEffect(() => {
        Report.clearNewRoomFormError();
    }, []);

    useEffect(() => {
        if (policyID) {
            if (!workspaceOptions.some((opt) => opt.value === policyID)) {
                setPolicyID('');
            }
            return;
        }
        if (!!activeWorkspaceOrDefaultID && workspaceOptions.some((opt) => opt.value === activeWorkspaceOrDefaultID)) {
            setPolicyID(activeWorkspaceOrDefaultID);
        } else {
            setPolicyID('');
        }
    }, [activeWorkspaceOrDefaultID, policyID, workspaceOptions]);

    useEffect(() => {
        if (!(((wasLoading && !isLoading) || (isOffline && isLoading)) && isEmptyObject(errorFields))) {
            return;
        }
        Navigation.dismissModal(newRoomReportID);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we just want this to update on changing the form State
    }, [isLoading, errorFields]);

    useEffect(() => {
        if (isPolicyAdmin) {
            return;
        }

        setWriteCapability(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    }, [isPolicyAdmin]);

    /**
     * @param values - form input values passed by the Form component
     * @returns an object containing validation errors, if any were found during validation
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>): OnyxCommon.Errors => {
            const errors: {policyID?: string; roomName?: string} = {};

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
            } else if (values.roomName !== CONST.POLICY.ROOM_PREFIX && !ValidationUtils.isValidRoomName(values.roomName)) {
                // We error if the room name has invalid characters
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
            } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameReservedError', {reservedName: values.roomName}));
            } else if (ValidationUtils.isExistingRoomName(values.roomName, reports, values.policyID)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
            } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
                ErrorUtils.addErrorMessage(errors, 'roomName', translate('common.error.characterLimitExceedCounter', {length: values.roomName.length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            const descriptionLength = ReportUtils.getCommentLength(values.reportDescription, {policyID});
            if (descriptionLength > CONST.REPORT_DESCRIPTION.MAX_LENGTH) {
                ErrorUtils.addErrorMessage(
                    errors,
                    'reportDescription',
                    translate('common.error.characterLimitExceedCounter', {length: descriptionLength, limit: CONST.REPORT_DESCRIPTION.MAX_LENGTH}),
                );
            }

            if (!values.policyID) {
                errors.policyID = translate('newRoomPage.pleaseSelectWorkspace');
            }

            return errors;
        },
        [reports, policyID, translate],
    );

    const writeCapabilityOptions = useMemo(
        () =>
            Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
                value,
                label: translate(`writeCapabilityPage.writeCapability.${value}`),
            })),
        [translate],
    );

    const visibilityOptions = useMemo(
        () =>
            Object.values(CONST.REPORT.VISIBILITY)
                .filter((visibilityOption) => visibilityOption !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE)
                .map((visibilityOption) => ({
                    label: translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
                    value: visibilityOption,
                    description: translate(`newRoomPage.${visibilityOption}Description`),
                })),
        [translate],
    );

    const {inputCallbackRef} = useAutoFocusInput();

    const renderEmptyWorkspaceView = () => (
        <>
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.emptyWorkspace.notFound')}
                subtitle={translate('workspace.emptyWorkspace.description')}
                shouldShowLink={false}
            />
            <Button
                success
                large
                text={translate('footer.learnMore')}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                style={[styles.mh5, styles.mb5]}
            />
            {isSmallScreenWidth && (
                <>
                    <OfflineIndicator />
                    <ImportedStateIndicator />
                </>
            )}
        </>
    );

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={isOffline}
            shouldShowOfflineIndicator={false}
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            testID={WorkspaceNewRoomPage.displayName}
            // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
            focusTrapSettings={{active: false}}
        >
            {({insets}) =>
                workspaceOptions.length === 0 ? (
                    renderEmptyWorkspaceView()
                ) : (
                    <KeyboardAvoidingView
                        style={styles.h100}
                        behavior="padding"
                        // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                        // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                        keyboardVerticalOffset={variables.contentHeaderHeight + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding + insets.top}
                    >
                        <FormProvider
                            formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                            submitButtonText={translate('newRoomPage.createRoom')}
                            style={[styles.mh5, styles.flexGrow1]}
                            validate={validate}
                            onSubmit={submit}
                            enabledWhenOffline
                        >
                            <View style={styles.mb5}>
                                <InputWrapper
                                    InputComponent={RoomNameInput}
                                    ref={inputCallbackRef}
                                    inputID={INPUT_IDS.ROOM_NAME}
                                    isFocused={isFocused}
                                    shouldDelayFocus
                                    autoFocus
                                />
                            </View>
                            <View style={styles.mb5}>
                                <InputWrapper
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.REPORT_DESCRIPTION}
                                    label={translate('reportDescriptionPage.roomDescriptionOptional')}
                                    accessibilityLabel={translate('reportDescriptionPage.roomDescriptionOptional')}
                                    role={CONST.ROLE.PRESENTATION}
                                    autoGrowHeight
                                    maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                                    maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                                    autoCapitalize="none"
                                    shouldInterceptSwipe
                                    isMarkdownEnabled
                                />
                            </View>
                            <View style={[styles.mhn5]}>
                                <InputWrapper
                                    InputComponent={ValuePicker}
                                    inputID={INPUT_IDS.POLICY_ID}
                                    label={translate('workspace.common.workspace')}
                                    items={workspaceOptions}
                                    value={policyID}
                                    onValueChange={(value) => setPolicyID(value as typeof policyID)}
                                />
                            </View>
                            {isPolicyAdmin && (
                                <View style={styles.mhn5}>
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
                            <View style={[styles.mb1, styles.mhn5]}>
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
                        {isSmallScreenWidth && (
                            <>
                                <OfflineIndicator />
                                <ImportedStateIndicator />
                            </>
                        )}
                    </KeyboardAvoidingView>
                )
            }
        </ScreenWrapper>
    );
}

WorkspaceNewRoomPage.displayName = 'WorkspaceNewRoomPage';

export default WorkspaceNewRoomPage;
