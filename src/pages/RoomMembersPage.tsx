import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import SearchInputManager from './workspace/SearchInputManager';

type RoomMembersPageOnyxProps = {
    session: OnyxEntry<Session>;
};

type RoomMembersPageProps = WithReportOrNotFoundProps &
    WithCurrentUserPersonalDetailsProps &
    RoomMembersPageOnyxProps &
    StackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS_ROOT>;

function RoomMembersPage({report, session, policies}: RoomMembersPageProps) {
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    const isFocusedScreen = useIsFocused();

    useEffect(() => {
        setSearchValue(SearchInputManager.searchInput);
    }, [isFocusedScreen]);

    useEffect(
        () => () => {
            SearchInputManager.searchInput = '';
        },
        [],
    );

    /**
     * Get members for the current room
     */
    const getRoomMembers = useCallback(() => {
        if (!report) {
            return;
        }
        Report.openRoomMembersPage(report.reportID);
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
        if (!report) {
            return;
        }
        setSearchValue('');
        Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report.reportID));
    };

    /**
     * Remove selected users from the room
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
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
     */
    const addUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => [...prevSelected, accountID]);
    }, []);

    /**
     * Remove user from the selectedEmployees list
     */
    const removeUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => prevSelected.filter((selected) => selected !== accountID));
    }, []);

    /** Toggle user from the selectedMembers list */
    const toggleUser = useCallback(
        ({accountID, pendingAction}: ListItem) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !accountID) {
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

    /** Add or remove all users passed from the selectedMembers list */
    const toggleAllUsers = (memberList: ListItem[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled);
        const everyoneSelected = enabledAccounts.every((member) => {
            if (!member.accountID) {
                return false;
            }
            return selectedMembers.includes(member.accountID);
        });

        if (everyoneSelected) {
            setSelectedMembers([]);
        } else {
            const everyAccountId = enabledAccounts.map((member) => member.accountID).filter((accountID): accountID is number => !!accountID);
            setSelectedMembers(everyAccountId);
        }
    };

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        setRemoveMembersConfirmModalVisible(true);
    };

    const getMemberOptions = (): ListItem[] => {
        let result: ListItem[] = [];

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
            const pendingChatMember = report?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());

            result.push({
                keyForList: String(accountID),
                accountID,
                isSelected: selectedMembers.includes(accountID),
                isDisabled: accountID === session?.accountID,
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: details?.login ? formatPhoneNumber(details.login) : '',
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
                        name: details.login ?? '',
                        type: CONST.ICON_TYPE_AVATAR,
                        id: Number(accountID),
                    },
                ],
                pendingAction: pendingChatMember?.pendingAction,
            });
        });

        result = result.sort((value1, value2) => localeCompare(value1.text ?? '', value2.text ?? ''));

        return result;
    };

    const isPolicyEmployee = useMemo(() => {
        if (!report?.policyID || policies === null) {
            return false;
        }
        return PolicyUtils.isPolicyEmployee(report.policyID, policies);
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
                shouldShow={
                    isEmptyObject(report) || (!ReportUtils.isChatThread(report) && ((ReportUtils.isUserCreatedPolicyRoom(report) && !isPolicyEmployee) || ReportUtils.isDefaultRoom(report)))
                }
                subtitleKey={isEmptyObject(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
                }}
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.members')}
                    subtitle={ReportUtils.getReportName(report)}
                    onBackButtonPress={() => {
                        setSearchValue('');
                        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
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
                            canSelectMultiple
                            sections={[{data, isDisabled: false}]}
                            textInputLabel={translate('optionsSelector.findMember')}
                            disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                            textInputValue={searchValue}
                            onChangeText={(value) => {
                                SearchInputManager.searchInput = value;
                                setSearchValue(value);
                            }}
                            headerMessage={headerMessage}
                            onSelectRow={(item) => toggleUser(item)}
                            onSelectAll={() => toggleAllUsers(data)}
                            showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(personalDetails) || !didLoadRoomMembers}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            ListItem={UserListItem}
                        />
                    </View>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomMembersPage.displayName = 'RoomMembersPage';

export default withReportOrNotFound()(withCurrentUserPersonalDetails(withOnyx<RoomMembersPageProps, RoomMembersPageOnyxProps>({session: {key: ONYXKEYS.SESSION}})(RoomMembersPage)));
