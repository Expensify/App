import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../../libs/actions/Report';
import useLocalize from '../../hooks/useLocalize';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import RoomNameInput from '../../components/RoomNameInput';
import Picker from '../../components/Picker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Text from '../../components/Text';
import Permissions from '../../libs/Permissions';
import Log from '../../libs/Log';
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as PolicyUtils from '../../libs/PolicyUtils';
import Form from '../../components/Form';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import policyMemberPropType from '../policyMemberPropType';

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
    const visibilityDescription = useMemo(() => translate(`newRoomPage.${visibility}Description`), [translate, visibility]);

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    const submit = (values) => {
        const policyMembers = _.map(_.keys(props.allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${values.policyID}`]), (accountID) => Number(accountID));
        Report.addPolicyReport(values.policyID, values.roomName, values.visibility, policyMembers);
    };

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

    useEffect(() => {
        if (Permissions.canUsePolicyRooms(props.betas) && workspaceOptions.length) {
            return;
        }
        Log.info('Not showing create Policy Room page since user is not on policy rooms beta');
        Navigation.dismissModal();
    }, [props.betas, workspaceOptions]);

    if (!Permissions.canUsePolicyRooms(props.betas) || !workspaceOptions.length) {
        return null;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton title={translate('newRoomPage.newRoom')} />
            <Form
                formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                submitButtonText={translate('newRoomPage.createRoom')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
                validate={validate}
                onSubmit={submit}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <RoomNameInput
                        inputID="roomName"
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                    />
                </View>
                <View style={styles.mb5}>
                    <Picker
                        inputID="policyID"
                        label={translate('workspace.common.workspace')}
                        placeholder={{value: '', label: translate('newRoomPage.selectAWorkspace')}}
                        items={workspaceOptions}
                    />
                </View>
                <View style={styles.mb2}>
                    <Picker
                        inputID="visibility"
                        label={translate('newRoomPage.visibility')}
                        items={visibilityOptions}
                        onValueChange={setVisibility}
                        defaultValue={CONST.REPORT.VISIBILITY.RESTRICTED}
                    />
                </View>
                <Text style={[styles.textLabel, styles.colorMuted]}>{visibilityDescription}</Text>
            </Form>
        </ScreenWrapper>
    );
}

WorkspaceNewRoomPage.propTypes = propTypes;
WorkspaceNewRoomPage.defaultProps = defaultProps;
WorkspaceNewRoomPage.displayName = 'WorkspaceNewRoomPage';

export default withOnyx({
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
})(WorkspaceNewRoomPage);
