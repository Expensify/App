import {domainNameSelector, groupsSelector} from '@selectors/Domain';
import React, {useState} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {changeDomainSecurityGroup, clearDomainMembersSelectedForMove} from '@libs/actions/Domain';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SecurityGroupItem = ListItem & {
    value: string;
};

type MoveUsersBetweenGroupsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_MOVE_TO_GROUP>;

function MoveUsersBetweenGroupsPage({route}: MoveUsersBetweenGroupsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [securityGroups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});
    const [selectedMemberAccountIDs] = useOnyx(ONYXKEYS.DOMAIN_MEMBERS_SELECTED_FOR_MOVE);

    const memberCount = selectedMemberAccountIDs?.length ?? 0;

    const data: SecurityGroupItem[] = (securityGroups ?? []).map(({id, details}) => ({
        text: details.name ?? '',
        keyForList: id,
        value: id,
        isSelected: id === selectedGroupId,
    }));

    const handleSelectRow = (item: SecurityGroupItem) => {
        setSelectedGroupId(item.value);
    };

    const handleSave = () => {
        if (!selectedGroupId || !selectedMemberAccountIDs?.length || !domainName) {
            return;
        }

        for (const accountIDString of selectedMemberAccountIDs) {
            const accountID = Number(accountIDString);
            const memberLogin = getLoginByAccountID(accountID);
            const currentGroup = securityGroups?.find((g) => !!g.details.shared?.[accountIDString]);
            const currentGroupData = currentGroup ? {key: `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${currentGroup.id}` as const, securityGroup: currentGroup.details} : undefined;
            const newSecurityGroupKey: `${typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${string}` = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${selectedGroupId}`;

            if (!memberLogin || !currentGroupData || newSecurityGroupKey === currentGroupData.key) {
                continue;
            }

            changeDomainSecurityGroup(domainAccountID, domainName, memberLogin, accountID, currentGroupData.key, currentGroupData.securityGroup, newSecurityGroupKey);
        }

        clearDomainMembersSelectedForMove();
        Navigation.goBack(ROUTES.DOMAIN_MEMBERS.getRoute(domainAccountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="MoveUsersBetweenGroupsPage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.members.moveToGroup')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBERS.getRoute(domainAccountID));
                    }}
                />
                <Text style={[styles.ph5, styles.pb3, styles.textSupporting]}>{translate('domain.members.chooseWhereToMove', {count: memberCount})}</Text>
                <SelectionList<SecurityGroupItem>
                    data={data}
                    onSelectRow={handleSelectRow}
                    ListItem={SingleSelectListItem}
                    initiallyFocusedItemKey={selectedGroupId}
                />
                <FixedFooter>
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={handleSave}
                        isDisabled={!selectedGroupId}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default MoveUsersBetweenGroupsPage;
