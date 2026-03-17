import {domainNameSelector, securityGroupsSelector, selectSecurityGroupForAccount} from '@selectors/Domain';
import React, {useState} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {changeDomainSecurityGroup, clearDomainMembersSelectedForMove} from '@libs/actions/Domain';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SecurityGroupKey} from '@src/types/onyx/Domain';

type SecurityGroupItem = ListItem & {
    value: SecurityGroupKey;
};

type MoveUsersBetweenGroupsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_MOVE_TO_GROUP>;

function MoveUsersBetweenGroupsPage({route}: MoveUsersBetweenGroupsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedGroupKey, setSelectedGroupKey] = useState<SecurityGroupKey | undefined>();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`);
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [securityGroups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: securityGroupsSelector});
    const [selectedMemberAccountIDs] = useOnyx(ONYXKEYS.DOMAIN_MEMBERS_SELECTED_FOR_MOVE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const memberCount = selectedMemberAccountIDs?.length ?? 0;

    const data: SecurityGroupItem[] = (securityGroups ?? []).map((group) => ({
        text: group.name,
        keyForList: group.key,
        value: group.key,
        isSelected: group.key === selectedGroupKey,
    }));

    const handleSelectRow = (item: SecurityGroupItem) => {
        setSelectedGroupKey(item.value);
    };

    const handleSave = () => {
        if (!selectedGroupKey || !selectedMemberAccountIDs?.length || !domain || !domainName) {
            return;
        }

        for (const accountIDString of selectedMemberAccountIDs) {
            const accountID = Number(accountIDString);
            const memberLogin = personalDetails?.[accountID]?.login ?? '';
            const currentGroupData = selectSecurityGroupForAccount(accountID)(domain);

            if (!currentGroupData) {
                continue;
            }

            changeDomainSecurityGroup(domainAccountID, domainName, memberLogin, accountID, currentGroupData.key, currentGroupData.securityGroup, selectedGroupKey);
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
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_MEMBERS.getRoute(domainAccountID))}
                />
                <Text style={[styles.ph5, styles.pb3, styles.textSupporting]}>{translate('domain.members.chooseWhereToMove', {count: memberCount})}</Text>
                <SelectionList<SecurityGroupItem>
                    data={data}
                    onSelectRow={handleSelectRow}
                    ListItem={SingleSelectListItem}
                    initiallyFocusedItemKey={selectedGroupKey}
                />
                <FixedFooter>
                    <Button
                        success
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={handleSave}
                        isDisabled={!selectedGroupKey}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default MoveUsersBetweenGroupsPage;
