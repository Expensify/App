import React, {useMemo, useState, useCallback, useEffect} from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import compose from '../libs/compose';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';
import SelectionList from '../components/SelectionList';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../components/withCurrentUserPersonalDetails';
import * as PolicyUtils from '../libs/PolicyUtils';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as UserUtils from '../libs/UserUtils';
import * as Report from '../libs/actions/Report';
import * as ReportUtils from '../libs/ReportUtils';
import Permissions from '../libs/Permissions';
import Log from '../libs/Log';
import * as Browser from '../libs/Browser';

const propTypes = {
    /** All personal details asssociated with user */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** reportID passed via route: /workspace/:reportID/members */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    personalDetails: {},
    session: {
        accountID: 0,
    },
    report: {},
    policies: {},
    betas: [],
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function RoomMembersPage(props) {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);

    /**
     * Get members for the current room
     */
    const getRoomMembers = useCallback(() => {
        Report.openRoomMembersPage(props.report.reportID);
        setDidLoadRoomMembers(true);
    }, [props.report.reportID]);

    useEffect(() => {
        // Kick the user out if they tried to navigate to this via the URL
        if (!PolicyUtils.isPolicyMember(props.report.policyID, props.policies) || !Permissions.canUsePolicyRooms(props.betas)) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID));
            return;
        }
        getRoomMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Open the modal to invite a user
     */
    const inviteUser = () => {
        setSearchValue('');
        Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(props.report.reportID));
    };

    /**
     * Remove selected users from the room
     */
    const removeUsers = () => {
        Report.removeFromRoom(props.report.reportID, selectedMembers);
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    /**
     * Add user from the selectedMembers list
     *
     * @param {String} login
     */
    const addUser = useCallback((accountID) => {
        setSelectedMembers((prevSelected) => [...prevSelected, accountID]);
    }, []);

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    const removeUser = useCallback((accountID) => {
        setSelectedMembers((prevSelected) => _.without(prevSelected, accountID));
    }, []);

    /**
     * Toggle user from the selectedMembers list
     *
     * @param {String} accountID
     * @param {String} pendingAction
     *
     */
    const toggleUser = useCallback(
        (accountID, pendingAction) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (_.contains(selectedMembers, Number(accountID))) {
                removeUser(Number(accountID));
            } else {
                addUser(Number(accountID));
            }
        },
        [selectedMembers, addUser, removeUser],
    );

    /**
     * Add or remove all users passed from the selectedMembers list
     * @param {Object} memberList
     */
    const toggleAllUsers = (memberList) => {
        const enabledAccounts = _.filter(memberList, (member) => !member.isDisabled);
        const everyoneSelected = _.every(enabledAccounts, (member) => _.contains(selectedMembers, Number(member.keyForList)));

        if (everyoneSelected) {
            setSelectedMembers([]);
        } else {
            const everyAccountId = _.map(enabledAccounts, (member) => Number(member.keyForList));
            setSelectedMembers(everyAccountId);
        }
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        setRemoveMembersConfirmModalVisible(true);
    };

    const getMemberOptions = () => {
        let result = [];

        _.each(props.report.participantAccountIDs, (accountID) => {
            const details = props.personalDetails[accountID];

            if (!details) {
                Log.hmmm(`[RoomMembersPage] no personal details found for room member with accountID: ${accountID}`);
                return;
            }

            // If search value is provided, filter out members that don't match the search value
            if (searchValue.trim()) {
                let memberDetails = '';
                if (details.login) {
                    memberDetails += ` ${details.login.toLowerCase()}`;
                }
                if (details.firstName) {
                    memberDetails += ` ${details.firstName.toLowerCase()}`;
                }
                if (details.lastName) {
                    memberDetails += ` ${details.lastName.toLowerCase()}`;
                }
                if (details.displayName) {
                    memberDetails += ` ${details.displayName.toLowerCase()}`;
                }
                if (details.phoneNumber) {
                    memberDetails += ` ${details.phoneNumber.toLowerCase()}`;
                }

                if (!OptionsListUtils.isSearchStringMatch(searchValue.trim(), memberDetails)) {
                    return;
                }
            }

            result.push({
                keyForList: String(accountID),
                accountID: Number(accountID),
                isSelected: _.contains(selectedMembers, Number(accountID)),
                isDisabled: accountID === props.session.accountID,
                text: props.formatPhoneNumber(details.displayName),
                alternateText: props.formatPhoneNumber(details.login),
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
                        name: details.login,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
            });
        });

        result = _.sortBy(result, (value) => value.text.toLowerCase());

        return result;
    };

    const isPolicyMember = useMemo(() => PolicyUtils.isPolicyMember(props.report.policyID, props.policies), [props.report.policyID, props.policies]);
    const data = getMemberOptions();
    const headerMessage = searchValue.trim() && !data.length ? props.translate('roomMembersPage.memberNotFound') : '';
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={RoomMembersPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={_.isEmpty(props.report) || !isPolicyMember}
                subtitleKey={_.isEmpty(props.report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID))}
            >
                <HeaderWithBackButton
                    title={props.translate('workspace.common.members')}
                    subtitle={ReportUtils.getReportName(props.report)}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID));
                    }}
                />
                <ConfirmModal
                    danger
                    title={props.translate('workspace.people.removeMembersTitle')}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={props.translate('roomMembersPage.removeMembersPrompt')}
                    confirmText={props.translate('common.remove')}
                    cancelText={props.translate('common.cancel')}
                />
                <View style={[styles.w100, styles.flex1]}>
                    <View style={[styles.w100, styles.flexRow, styles.pt3, styles.ph5]}>
                        <Button
                            medium
                            success
                            text={props.translate('common.invite')}
                            onPress={inviteUser}
                        />
                        <Button
                            medium
                            danger
                            style={[styles.ml2]}
                            isDisabled={selectedMembers.length === 0}
                            text={props.translate('common.remove')}
                            onPress={askForConfirmationToRemove}
                        />
                    </View>
                    <View style={[styles.w100, styles.mt4, styles.flex1]}>
                        <SelectionList
                            canSelectMultiple
                            sections={[{data, indexOffset: 0, isDisabled: false}]}
                            textInputLabel={props.translate('optionsSelector.findMember')}
                            textInputValue={searchValue}
                            onChangeText={setSearchValue}
                            headerMessage={headerMessage}
                            onSelectRow={(item) => toggleUser(item.keyForList)}
                            onSelectAll={() => toggleAllUsers(data)}
                            showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(props.personalDetails) || !didLoadRoomMembers}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
                        />
                    </View>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomMembersPage.propTypes = propTypes;
RoomMembersPage.defaultProps = defaultProps;
RoomMembersPage.displayName = 'RoomMembersPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withReportOrNotFound(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
    withCurrentUserPersonalDetails,
)(RoomMembersPage);
