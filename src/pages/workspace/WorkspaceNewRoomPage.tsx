import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
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

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRoomIDToHighlightOnRoomsPage, setRoomIDToHighlightOnRoomsPage} from '@libs/actions/Policy/Room';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePolicies} from '@libs/PolicyUtils';
import {buildOptimisticChatReport, getCommentLength, getParsedComment, isPolicyAdmin} from '@libs/ReportUtils';
import {isExistingRoomName, isReservedRoomName, isValidRoomNameWithoutLimits} from '@libs/ValidationUtils';

import variables from '@styles/variables';

import {addPolicyReport, clearNewRoomFormError, setNewRoomFormLoading} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewRoomForm';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {Ref} from 'react';
import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

function EmptyWorkspaceView() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, additionalPaddingBottom: styles.mb5.marginBottom, styleProperty: 'marginBottom'});
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    return (
        <>
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.emptyWorkspace.notFound')}
                subtitle={translate('workspace.emptyWorkspace.description')}
                addBottomSafeAreaPadding
            />
            <Button
                success
                large
                text={translate('footer.learnMore')}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute(Navigation.getActiveRoute()))}
                style={[styles.mh5, bottomSafeAreaPaddingStyle]}
            />
        </>
    );
}

type WorkspaceNewRoomPageRef = {
    focus?: () => void;
    isValidInput?: () => boolean;
};

type WorkspaceNewRoomPageProps = {
    /** Forwarded ref to pass to the room name input */
    ref?: Ref<WorkspaceNewRoomPageRef>;

    /** When provided, the workspace picker is hidden and the room is created under this policy */
    policyID?: string;
};

function WorkspaceNewRoomPage({ref, policyID: lockedPolicyID}: WorkspaceNewRoomPageProps) {
    const isLocked = !!lockedPolicyID;
    const lockedPolicy = usePolicy(lockedPolicyID);
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {translate, localeCompare} = useLocalize();
    const [shouldEnableValidation, setShouldEnableValidation] = useState(false);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    const {top} = useSafeAreaInsets();
    const [visibility, setVisibility] = useState<ValueOf<typeof CONST.REPORT.VISIBILITY>>(CONST.REPORT.VISIBILITY.RESTRICTED);
    const [writeCapability, setWriteCapability] = useState<ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>>(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const visibilityDescription = useMemo(() => translate(`newRoomPage.${visibility}Description`), [translate, visibility]);
    const roomPageInputRef = useRef<AnimatedTextInputRef | null>(null);

    useImperativeHandle(ref, () => ({
        focus: () => roomPageInputRef.current?.focus(),
        isValidInput: () => !!roomPageInputRef.current,
    }));

    const workspaceOptions = useMemo(
        () =>
            getActivePolicies(policies, session?.email)
                ?.filter((policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL)
                .map((policy) => ({
                    label: policy.name,
                    value: policy.id,
                }))
                .sort((a, b) => localeCompare(a.label, b.label)) ?? [],
        [policies, session?.email, localeCompare],
    );
    const [policyID, setPolicyID] = useState<string>(() => {
        if (lockedPolicyID) {
            return lockedPolicyID;
        }
        if (!!activePolicyID && workspaceOptions.some((option) => option.value === activePolicyID)) {
            return activePolicyID;
        }
        return '';
    });
    const isAdminPolicy = useMemo(() => {
        if (!policyID) {
            return false;
        }

        return isPolicyAdmin(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]);
    }, [policyID, policies]);

    /**
     * @param values - form input values passed by the Form component
     */
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

        if (isLocked) {
            addPolicyReport(policyReport);
            // Mark the new room so its row highlights on the rooms page, then clear it once the back transition ends so it doesn't replay later.
            setRoomIDToHighlightOnRoomsPage(policyReport.reportID);
            Navigation.goBack(ROUTES.WORKSPACE_ROOMS.getRoute(policyID), {
                afterTransition: () => clearRoomIDToHighlightOnRoomsPage(),
                waitForTransition: true,
            });
            return;
        }

        setNewRoomFormLoading();
        addPolicyReport(policyReport);
        Navigation.dismissModalWithReport({reportID: policyReport.reportID});
    };

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        setShouldEnableValidation(false);
        clearNewRoomFormError().then(() => setShouldEnableValidation(true));
    }, [isFocused]);

    useEffect(() => {
        if (isLocked) {
            return;
        }
        if (policyID) {
            if (!workspaceOptions.some((opt) => opt.value === policyID)) {
                setPolicyID('');
            }
            return;
        }
        if (!!activePolicyID && workspaceOptions.some((opt) => opt.value === activePolicyID)) {
            setPolicyID(activePolicyID);
        } else {
            setPolicyID('');
        }
    }, [activePolicyID, isLocked, policyID, workspaceOptions]);

    useEffect(() => {
        if (isAdminPolicy) {
            return;
        }

        setWriteCapability(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    }, [isAdminPolicy]);

    /**
     * @param values - form input values passed by the Form component
     * @returns an object containing validation errors, if any were found during validation
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM>): OnyxCommon.Errors => {
            if (!shouldEnableValidation) {
                return {};
            }

            const errors: {policyID?: string; roomName?: string} = {};
            const validationPolicyID = isLocked ? policyID : values.policyID;

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                addErrorMessage(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
            } else if (values.roomName !== CONST.POLICY.ROOM_PREFIX && !isValidRoomNameWithoutLimits(values.roomName)) {
                // We error if the room name has invalid characters
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
            } else if (isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomNameReservedError', values.roomName));
            } else if (isExistingRoomName(values.roomName, reports, validationPolicyID)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                addErrorMessage(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
            } else if (values.roomName.length > CONST.TITLE_CHARACTER_LIMIT) {
                addErrorMessage(errors, 'roomName', translate('common.error.characterLimitExceedCounter', values.roomName.length, CONST.TITLE_CHARACTER_LIMIT));
            }

            const descriptionLength = getCommentLength(values.reportDescription, {policyID});
            if (descriptionLength > CONST.REPORT_DESCRIPTION.MAX_LENGTH) {
                addErrorMessage(errors, 'reportDescription', translate('common.error.characterLimitExceedCounter', descriptionLength, CONST.REPORT_DESCRIPTION.MAX_LENGTH));
            }

            if (!isLocked && !values.policyID) {
                errors.policyID = translate('newRoomPage.pleaseSelectWorkspace');
            }

            return errors;
        },
        [reports, policyID, translate, shouldEnableValidation, isLocked],
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

    return (
        <ScreenWrapper
            {...(isLocked
                ? {
                      onEntryTransitionEnd: () => roomPageInputRef.current?.focus(),
                      shouldEnableMaxHeight: true,
                      shouldEnableKeyboardAvoidingView: true,
                      enableEdgeToEdgeBottomSafeAreaPadding: true,
                      shouldShowOfflineIndicator: true,
                  }
                : {
                      enableEdgeToEdgeBottomSafeAreaPadding: true,
                      includePaddingTop: false,
                      shouldShowOfflineIndicator: true,
                      shouldEnablePickerAvoiding: false,
                      shouldEnableKeyboardAvoidingView: workspaceOptions.length !== 0,
                      keyboardVerticalOffset: variables.contentHeaderHeight + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding + top,
                      // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
                      focusTrapSettings: {active: false},
                  })}
            testID="WorkspaceNewRoomPage"
        >
            {isLocked && (
                <HeaderWithBackButton
                    title={translate('newRoomPage.createRoom')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ROOMS.getRoute(policyID))}
                />
            )}
            {workspaceOptions.length === 0 && !isLocked ? (
                <EmptyWorkspaceView />
            ) : (
                <FormProvider
                    formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                    submitButtonText={translate('newRoomPage.createRoom')}
                    style={[!isLocked && styles.h100, styles.mh5, styles.flexGrow1]}
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb5}>
                        <InputWrapper
                            ref={roomPageInputRef}
                            InputComponent={RoomNameInput}
                            inputID={INPUT_IDS.ROOM_NAME}
                            isFocused={isFocused}
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
                            autoCapitalize="none"
                            shouldInterceptSwipe
                            type="markdown"
                        />
                    </View>
                    {isLocked ? (
                        <View style={[styles.mhn5]}>
                            <MenuItemWithTopDescription
                                description={translate('workspace.common.workspace')}
                                title={lockedPolicy?.name}
                                interactive={false}
                            />
                        </View>
                    ) : (
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
                    )}
                    {isAdminPolicy && (
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
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceNewRoomPage;
export type {WorkspaceNewRoomPageRef};
