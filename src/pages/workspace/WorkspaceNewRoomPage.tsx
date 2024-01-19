import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import * as Illustrations from '@components/Icon/Illustrations';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import RoomNameInput from '@components/RoomNameInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account, Form, Policy, Report as ReportType, Session} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type FormValues = {
    welcomeMessage: string;
    roomName: string;
    policyID: string | null;
    writeCapability: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;
    visibility: ValueOf<typeof CONST.REPORT.VISIBILITY>;
};

type WorkspaceNewRoomPageOnyxProps = {
    /** The list of policies the user has access to. */
    policies: OnyxCollection<Policy>;

    /** All reports shared with the user */
    reports: OnyxCollection<ReportType>;

    /** Form state for NEW_ROOM_FORM */
    formState: OnyxEntry<Form>;

    /** Session details for the user */
    session: OnyxEntry<Session>;

    /** policyID for main workspace */
    activePolicyID: OnyxEntry<Required<Account>['activePolicyID']>;
};

type WorkspaceNewRoomPageProps = WorkspaceNewRoomPageOnyxProps;

function WorkspaceNewRoomPage({policies, reports, formState, session, activePolicyID}: WorkspaceNewRoomPageProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [visibility, setVisibility] = useState<FormValues['visibility']>(CONST.REPORT.VISIBILITY.RESTRICTED);
    const [policyID, setPolicyID] = useState<FormValues['policyID']>(activePolicyID);
    const [writeCapability, setWriteCapability] = useState<FormValues['writeCapability']>(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const wasLoading = usePrevious(!!formState?.isLoading);
    const visibilityDescription = useMemo(() => translate(`newRoomPage.${visibility}Description`), [translate, visibility]);
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
    const submit = (values: FormValues) => {
        const participants = session?.accountID ? [session.accountID] : [];
        const parsedWelcomeMessage = ReportUtils.getParsedComment(values.welcomeMessage);
        const policyReport = ReportUtils.buildOptimisticChatReport(
            participants,
            values.roomName,
            CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID ?? undefined,
            CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            visibility,
            writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            '',
            '',
            parsedWelcomeMessage,
        );
        setNewRoomReportID(policyReport.reportID);
        Report.addPolicyReport(policyReport);
    };

    useEffect(() => {
        Report.clearNewRoomFormError();
    }, []);

    useEffect(() => {
        if (policyID) {
            return;
        }
        setPolicyID(activePolicyID);
    }, [activePolicyID, policyID]);

    useEffect(() => {
        if (!(((wasLoading && !formState?.isLoading) || (isOffline && formState?.isLoading)) && isEmptyObject(formState?.errorFields))) {
            return;
        }
        Navigation.dismissModal(newRoomReportID);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want this to update on changing the form State
    }, [formState]);

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
        (values: FormValues): OnyxCommon.Errors => {
            const errors: OnyxCommon.Errors = {};

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.pleaseEnterRoomName');
            } else if (values.roomName !== CONST.POLICY.ROOM_PREFIX && !ValidationUtils.isValidRoomName(values.roomName)) {
                // We error if the room name has invalid characters
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomNameInvalidError');
            } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', ['newRoomPage.roomNameReservedError', {reservedName: values.roomName}]);
            } else if (ValidationUtils.isExistingRoomName(values.roomName, reports, values.policyID ?? '')) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomAlreadyExistsError');
            }

            if (!values.policyID) {
                errors.policyID = 'newRoomPage.pleaseSelectWorkspace';
            }

            return errors;
        },
        [reports],
    );

    const workspaceOptions = useMemo(
        () =>
            PolicyUtils.getActivePolicies(policies)?.map((policy) => ({
                label: policy.name,
                key: policy.id,
                value: policy.id,
            })) ?? [],
        [policies],
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
                iconWidth={variables.emptyWorkspaceIconWidth}
                iconHeight={variables.emptyWorkspaceIconHeight}
                title={translate('workspace.emptyWorkspace.notFound')}
                subtitle={translate('workspace.emptyWorkspace.description')}
                shouldShowLink={false}
            />
            <Button
                success
                text={translate('footer.learnMore')}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                style={[styles.mh5, styles.mb5]}
            />
            {isSmallScreenWidth && <OfflineIndicator />}
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
                        {/** @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript. */}
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
                                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                                    InputComponent={RoomNameInput}
                                    ref={inputCallbackRef}
                                    inputID="roomName"
                                    isFocused={isFocused}
                                    shouldDelayFocus
                                    autoFocus
                                />
                            </View>
                            <View style={styles.mb5}>
                                <InputWrapper
                                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                                    InputComponent={TextInput}
                                    inputID="welcomeMessage"
                                    label={translate('welcomeMessagePage.welcomeMessageOptional')}
                                    accessibilityLabel={translate('welcomeMessagePage.welcomeMessageOptional')}
                                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                                    autoGrowHeight
                                    maxLength={CONST.MAX_COMMENT_LENGTH}
                                    autoCapitalize="none"
                                    containerStyles={[styles.autoGrowHeightMultilineInput]}
                                />
                            </View>
                            <View style={[styles.mhn5]}>
                                <InputWrapper
                                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                                    InputComponent={ValuePicker}
                                    inputID="policyID"
                                    label={translate('workspace.common.workspace')}
                                    items={workspaceOptions}
                                    value={policyID}
                                    onValueChange={setPolicyID}
                                />
                            </View>
                            {isPolicyAdmin && (
                                <View style={styles.mhn5}>
                                    <InputWrapper
                                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                                        InputComponent={ValuePicker}
                                        inputID="writeCapability"
                                        label={translate('writeCapabilityPage.label')}
                                        items={writeCapabilityOptions}
                                        value={writeCapability}
                                        onValueChange={setWriteCapability}
                                    />
                                </View>
                            )}
                            <View style={[styles.mb1, styles.mhn5]}>
                                <InputWrapper
                                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                                    InputComponent={ValuePicker}
                                    inputID="visibility"
                                    label={translate('newRoomPage.visibility')}
                                    items={visibilityOptions}
                                    onValueChange={setVisibility}
                                    value={visibility}
                                    furtherDetails={visibilityDescription}
                                    shouldShowTooltips={false}
                                />
                            </View>
                        </FormProvider>
                        {isSmallScreenWidth && <OfflineIndicator />}
                    </KeyboardAvoidingView>
                )
            }
        </ScreenWrapper>
    );
}

WorkspaceNewRoomPage.displayName = 'WorkspaceNewRoomPage';

export default withOnyx<WorkspaceNewRoomPageProps, WorkspaceNewRoomPageOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    formState: {
        key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    activePolicyID: {
        key: ONYXKEYS.ACCOUNT,
        selector: (account) => account?.activePolicyID ?? null,
        initialValue: null,
    },
})(WorkspaceNewRoomPage);
