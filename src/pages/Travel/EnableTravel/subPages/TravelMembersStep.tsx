import CheckboxWithLabel from '@components/CheckboxWithLabel';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ConfirmButtonOptions, ListItem, TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import {setTravelProvisioningMembers} from '@libs/actions/Travel';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';
import {View} from 'react-native';

type TravelMember = {
    accountID: number;
    email: string;
    name: string;
    avatar: ListItem['icons'];
};

const filterMember = (member: TravelMember, searchInput: string) => tokenizedSearch([member], searchInput, (option) => [option.name, option.email]).length > 0;

/**
 * Asks who can book travel before travel is enabled. Everyone on the workspace is chosen by default, and an admin who
 * only wants some members unchecks it and picks them. The admin enabling travel always gets it.
 */
function TravelMembersStep({onNext, policy}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const workspaceMembers = useWorkspaceMembers(policy);

    const [shouldEnableAllTravelMembers, setShouldEnableAllTravelMembers] = useState(travelProvisioning?.shouldEnableAllTravelMembers ?? true);
    const [selectedAccountIDs, setSelectedAccountIDs] = useState<number[]>(travelProvisioning?.travelMemberAccountIDs ?? []);

    const members: TravelMember[] = workspaceMembers
        .map(({email, accountID, details}) => ({
            accountID,
            email,
            name: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
            avatar: [
                {
                    source: details.avatar ?? icons.FallbackAvatar,
                    name: formatPhoneNumber(email),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
        }))
        .sort((member1, member2) => localeCompare(member1.name, member2.name));
    const [searchInput, setSearchInput, filteredMembers] = useSearchResults(members, filterMember);
    const shouldShowSearchInput = members.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const listItems: ListItem[] = filteredMembers.map((member) => {
        const isCurrentUser = member.email === currentUserLogin;
        return {
            text: member.name,
            alternateText: formatPhoneNumber(member.email),
            keyForList: String(member.accountID),
            accountID: member.accountID,
            login: member.email,
            icons: member.avatar,
            isSelected: shouldEnableAllTravelMembers || isCurrentUser || selectedAccountIDs.includes(member.accountID),
            isDisabled: shouldEnableAllTravelMembers || isCurrentUser,
        };
    });

    const toggleMember = (item: ListItem) => {
        const accountID = item.accountID;
        if (!accountID || shouldEnableAllTravelMembers || item.login === currentUserLogin) {
            return;
        }
        setSelectedAccountIDs((previousAccountIDs) =>
            previousAccountIDs.includes(accountID) ? previousAccountIDs.filter((selectedAccountID) => selectedAccountID !== accountID) : [...previousAccountIDs, accountID],
        );
    };

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.next'),
        onConfirm: () => {
            setTravelProvisioningMembers({shouldEnableAllTravelMembers, travelMemberAccountIDs: shouldEnableAllTravelMembers ? [] : selectedAccountIDs});
            onNext();
        },
    };

    const textInputOptions: TextInputOptions = {
        label: translate('workspace.people.findMember'),
        value: searchInput,
        onChangeText: setSearchInput,
        headerMessage: filteredMembers.length === 0 && searchInput.length > 0 ? translate('common.noResultsFound') : undefined,
    };

    return (
        <View style={styles.flex1}>
            <View style={[styles.ph5, styles.pb3]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('travel.travelMembers.headline')}</Text>
                <Text style={[styles.mb5, styles.textSupporting]}>{translate('travel.travelMembers.subtitle')}</Text>
                <CheckboxWithLabel
                    label={translate('travel.travelMembers.everyone')}
                    accessibilityLabel={translate('travel.travelMembers.everyone')}
                    value={shouldEnableAllTravelMembers}
                    onInputChange={(isChecked) => setShouldEnableAllTravelMembers(!!isChecked)}
                />
            </View>
            <SelectionList
                data={listItems}
                ListItem={UserListItem}
                canSelectMultiple
                onSelectRow={toggleMember}
                selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.RIGHT}
                shouldSingleExecuteRowSelect
                addBottomSafeAreaPadding
                confirmButtonOptions={confirmButtonOptions}
                shouldShowTextInput={shouldShowSearchInput}
                textInputOptions={shouldShowSearchInput ? textInputOptions : undefined}
            />
        </View>
    );
}

export default TravelMembersStep;
