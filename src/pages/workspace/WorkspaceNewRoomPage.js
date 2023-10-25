import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withNavigationFocus from '../../components/withNavigationFocus';
import * as Report from '../../libs/actions/Report';
import * as App from '../../libs/actions/App';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';
import RoomNameInput from '../../components/RoomNameInput';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import ScreenWrapper from '../../components/ScreenWrapper';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import Permissions from '../../libs/Permissions';
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as PolicyUtils from '../../libs/PolicyUtils';
import Form from '../../components/Form';
import policyMemberPropType from '../policyMemberPropType';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import compose from '../../libs/compose';
import variables from '../../styles/variables';
import useDelayedInputFocus from '../../hooks/useDelayedInputFocus';
import ValuePicker from '../../components/ValuePicker';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** The report type */
        type: PropTypes.string,

        /** ID of the policy */
        policyID: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy type */
            type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

            /** The name of the policy */
            name: PropTypes.string,

            /** The ID of the policy */
            id: PropTypes.string,
        }),
    ),

    /** A collection of objects for all policies which key policy member objects by accountIDs */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,
};
const defaultProps = {
    betas: [],
    reports: {},
    policies: {},
    allPolicyMembers: {},
};

function WorkspaceNewRoomPage(props) {
    const {translate} = useLocalize();
    const [visibility, setVisibility] = useState(CONST.REPORT.VISIBILITY.RESTRICTED);
    const [policyID, setPolicyID] = useState(null);
    const [writeCapability, setWriteCapability] = useState(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const visibilityDescription = useMemo(() => translate(`newRoomPage.${visibility}Description`), [translate, visibility]);
    const isPolicyAdmin = useMemo(() => {
        if (!policyID) {
            return false;
        }

        return ReportUtils.isPolicyAdmin(policyID, props.policies);
    }, [policyID, props.policies]);

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    const submit = (values) => {
        const policyMembers = _.map(_.keys(props.allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${values.policyID}`]), (accountID) => Number(accountID));
        Report.addPolicyReport(policyID, values.roomName, visibility, policyMembers, writeCapability, values.welcomeMessage);
    };

    useEffect(() => {
        if (isPolicyAdmin) {
            return;
        }

        setWriteCapability(CONST.REPORT.WRITE_CAPABILITIES.ALL);
    }, [isPolicyAdmin]);

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    const validate = useCallback(
        (values) => {
            const errors = {};

            if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
                // We error if the user doesn't enter a room name or left blank
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.pleaseEnterRoomName');
            } else if (values.roomName !== CONST.POLICY.ROOM_PREFIX && !ValidationUtils.isValidRoomName(values.roomName)) {
                // We error if the room name has invalid characters
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomNameInvalidError');
            } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', ['newRoomPage.roomNameReservedError', {reservedName: values.roomName}]);
            } else if (ValidationUtils.isExistingRoomName(values.roomName, props.reports, values.policyID)) {
                // Certain names are reserved for default rooms and should not be used for policy rooms.
                ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomAlreadyExistsError');
            }

            if (!values.policyID) {
                errors.policyID = 'newRoomPage.pleaseSelectWorkspace';
            }

            return errors;
        },
        [props.reports],
    );

    const workspaceOptions = useMemo(() => _.map(PolicyUtils.getActivePolicies(props.policies), (policy) => ({label: policy.name, key: policy.id, value: policy.id})), [props.policies]);

    const writeCapabilityOptions = useMemo(
        () =>
            _.map(CONST.REPORT.WRITE_CAPABILITIES, (value) => ({
                value,
                label: translate(`writeCapabilityPage.writeCapability.${value}`),
            })),
        [translate],
    );

    const visibilityOptions = useMemo(
        () =>
            _.map(
                _.filter(_.values(CONST.REPORT.VISIBILITY), (visibilityOption) => visibilityOption !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE),
                (visibilityOption) => ({
                    label: translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
                    value: visibilityOption,
                    description: translate(`newRoomPage.${visibilityOption}Description`),
                }),
            ),
        [translate],
    );

    const roomNameInputRef = useRef(null);

    // use a 600ms delay for delayed focus on the room name input field so that it works consistently on native iOS / Android
    useDelayedInputFocus(roomNameInputRef, 600);

    return (
        <FullPageNotFoundView
            shouldShow={!Permissions.canUsePolicyRooms(props.betas) || !workspaceOptions.length}
            shouldShowBackButton={false}
            linkKey="workspace.emptyWorkspace.title"
            onLinkPress={() => App.createWorkspaceAndNavigateToIt('', false, '', false, false)}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                includeSafeAreaPaddingBottom={false}
                includePaddingTop={false}
                shouldEnablePickerAvoiding={false}
                testID={WorkspaceNewRoomPage.displayName}
            >
                {({insets}) => (
                    <KeyboardAvoidingView
                        style={styles.h100}
                        behavior="padding"
                        // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                        // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                        keyboardVerticalOffset={variables.contentHeaderHeight + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding + insets.top}
                    >
                        <Form
                            formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                            submitButtonText={translate('newRoomPage.createRoom')}
                            style={[styles.mh5, styles.flexGrow1]}
                            validate={validate}
                            onSubmit={submit}
                            enabledWhenOffline
                        >
                            <View style={styles.mb5}>
                                <RoomNameInput
                                    ref={(el) => (roomNameInputRef.current = el)}
                                    inputID="roomName"
                                    isFocused={props.isFocused}
                                    shouldDelayFocus
                                    autoFocus
                                />
                            </View>
                            <View style={styles.mb5}>
                                <TextInput
                                    inputID="welcomeMessage"
                                    label={translate('welcomeMessagePage.welcomeMessageOptional')}
                                    accessibilityLabel={translate('welcomeMessagePage.welcomeMessageOptional')}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                    autoGrowHeight
                                    maxLength={CONST.MAX_COMMENT_LENGTH}
                                    autoCapitalize="none"
                                    textAlignVertical="top"
                                    containerStyles={[styles.autoGrowHeightMultilineInput]}
                                />
                            </View>
                            <View style={[styles.mhn5]}>
                                <ValuePicker
                                    inputID="policyID"
                                    label={translate('workspace.common.workspace')}
                                    placeholder={translate('newRoomPage.selectAWorkspace')}
                                    items={workspaceOptions}
                                    onValueChange={setPolicyID}
                                />
                            </View>
                            {isPolicyAdmin && (
                                <View style={styles.mhn5}>
                                    <ValuePicker
                                        inputID="writeCapability"
                                        label={translate('writeCapabilityPage.label')}
                                        items={writeCapabilityOptions}
                                        value={writeCapability}
                                        onValueChange={setWriteCapability}
                                    />
                                </View>
                            )}
                            <View style={[styles.mb1, styles.mhn5]}>
                                <ValuePicker
                                    inputID="visibility"
                                    label={translate('newRoomPage.visibility')}
                                    items={visibilityOptions}
                                    onValueChange={setVisibility}
                                    value={visibility}
                                />
                            </View>
                            <Text style={[styles.textLabel, styles.colorMuted]}>{visibilityDescription}</Text>
                        </Form>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        </FullPageNotFoundView>
    );
}

WorkspaceNewRoomPage.propTypes = propTypes;
WorkspaceNewRoomPage.defaultProps = defaultProps;
WorkspaceNewRoomPage.displayName = 'WorkspaceNewRoomPage';

export default compose(
    withNavigationFocus,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
    }),
)(WorkspaceNewRoomPage);
