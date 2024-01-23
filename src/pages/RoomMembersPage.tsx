import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithLocalizeProps} from '@components/withLocalize';
import withLocalize from '@components/withLocalize';
import withWindowDimensions from '@components/withWindowDimensions';
import type {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomMembersPageProps = WithReportOrNotFoundProps & WithLocalizeProps & WindowDimensionsProps & WithCurrentUserPersonalDetailsProps;

function RoomMembersPage({report, session, formatPhoneNumber, policies, translate}: RoomMembersPageProps) {
    const styles = useThemeStyles();
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    /**
     * Get members for the current room
     */
    const getRoomMembers = useCallback(() => {
        if (report) {
            Report.openRoomMembersPage(report.reportID);
        }
        setDidLoadRoomMembers(true);
    }, [report]);

    useEffect(() => {
        getRoomMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Open the modal to invite a user
     */
    const inviteUser = () => {
        setSearchValue('');
        if (report) {
            Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report.reportID));
        }
    };

    /**
     * Remove selected users from the room
     */
    const removeUsers = () => {
        if (report) {
            Report.removeFromRoom(report.reportID, selectedMembers);
        }
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    /**
     * Add user from the selectedMembers list
     *
     * @param {String} login
     */
    const addUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => [...prevSelected, accountID]);
    }, []);

    /**
     * Remove user from the selectedEmployees list
     *
     * @param {String} login
     */
    const removeUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => prevSelected.filter((selected) => selected !== accountID));
    }, []);

    /**
     * Toggle user from the selectedMembers list
     *
     * @param {String} accountID
     * @param {String} pendingAction
     *
     */
    const toggleUser = useCallback(
        (accountID: number, pendingAction: PendingAction) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (selectedMembers.includes(accountID)) {
                removeUser(accountID);
            } else {
                addUser(accountID);
            }
        },
        [selectedMembers, addUser, removeUser],
    );

    /**
     * Add or remove all users passed from the selectedMembers list
     * @param memberList
     */
    const toggleAllUsers = (memberList: any[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled);
        const everyoneSelected = enabledAccounts.every((member) => selectedMembers.includes(member.keyForList));

        if (everyoneSelected) {
            setSelectedMembers([]);
        } else {
            const everyAccountId = enabledAccounts.map((member) => Number(member.keyForList));
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
        let result: any[] = [];

        report?.visibleChatMemberAccountIDs?.forEach((accountID) => {
            const details = personalDetails[accountID];

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
                    memberDetails += ` ${PersonalDetailsUtils.getDisplayNameOrDefault(details).toLowerCase()}`;
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
                isSelected: selectedMembers.includes(accountID),
                isDisabled: accountID === session?.accountID,
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: details.login ? formatPhoneNumber(details.login) : '',
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
                        name: details.login,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
            });
        });

        result = result.sort((value) => value.text.toLowerCase());

        return result;
    };

    const isPolicyMember = useMemo(() => {
        if (!report?.policyID || policies === null) {
            return false;
        }
        return PolicyUtils.isPolicyMember(report.policyID, policies as Record<string, Policy>);
    }, [report?.policyID, policies]);
    const data = getMemberOptions();
    const headerMessage = searchValue.trim() && !data.length ? translate('roomMembersPage.memberNotFound') : '';
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={RoomMembersPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={_.isEmpty(report) || !isPolicyMember}
                subtitleKey={_.isEmpty(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => {
                    if (!report) {
                        return;
                    }
                    Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
                }}
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.members')}
                    subtitle={ReportUtils.getReportName(report)}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        if (report) {
                            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
                        }
                    }}
                />
                <ConfirmModal
                    danger
                    title={translate('workspace.people.removeMembersTitle')}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={translate('roomMembersPage.removeMembersPrompt')}
                    confirmText={translate('common.remove')}
                    cancelText={translate('common.cancel')}
                />
                <View style={[styles.w100, styles.flex1]}>
                    <View style={[styles.w100, styles.flexRow, styles.pt3, styles.ph5]}>
                        <Button
                            medium
                            success
                            text={translate('common.invite')}
                            onPress={inviteUser}
                        />
                        <Button
                            medium
                            danger
                            style={[styles.ml2]}
                            isDisabled={selectedMembers.length === 0}
                            text={translate('common.remove')}
                            onPress={askForConfirmationToRemove}
                        />
                    </View>
                    <View style={[styles.w100, styles.mt4, styles.flex1]}>
                        <SelectionList
                            // @ts-expect-error TODO: Remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is migrated to TypeScript.
                            canSelectMultiple
                            sections={[{data, indexOffset: 0, isDisabled: false}]}
                            textInputLabel={translate('optionsSelector.findMember')}
                            disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                            textInputValue={searchValue}
                            onChangeText={setSearchValue}
                            headerMessage={headerMessage}
                            onSelectRow={(item) => toggleUser(item.keyForList)}
                            onSelectAll={() => toggleAllUsers(data)}
                            showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(personalDetails) || !didLoadRoomMembers}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        />
                    </View>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomMembersPage.displayName = 'RoomMembersPage';

export default withLocalize(withWindowDimensions(withReportOrNotFound()(withCurrentUserPersonalDetails(RoomMembersPage))));
