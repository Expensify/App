import {domainNameSelector, groupsSelector, selectSecurityGroupForAccount} from '@selectors/Domain';
import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
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
import {changeDomainSecurityGroup} from '@libs/actions/Domain';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {Domain} from '@src/types/onyx';

type SecurityGroupItem = ListItem & {
    value: string;
};

type MoveUserBetweenGroupsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_MOVE_TO_GROUP>;

function MoveUserBetweenGroupsPage({route}: MoveUserBetweenGroupsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [securityGroups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});

    const securityGroupSelector = (domain: OnyxEntry<Domain>) => selectSecurityGroupForAccount(accountID)(domain);
    const [userSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: securityGroupSelector,
    });
    const [memberLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(accountID)});

    const currentGroupId = userSecurityGroup?.key.replace(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, '');

    const data: SecurityGroupItem[] = (securityGroups ?? []).map(({id, details}) => ({
        text: details.name ?? '',
        keyForList: id,
        value: id,
        isSelected: id === (selectedGroupId ?? currentGroupId),
    }));

    const handleSelectRow = (item: SecurityGroupItem) => {
        setSelectedGroupId(item.value);
    };

    const handleSave = () => {
        if (!selectedGroupId || !domainName || !userSecurityGroup || !memberLogin) {
            return;
        }

        if (selectedGroupId === currentGroupId) {
            Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
            return;
        }

        const newSecurityGroupKey: `${typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${string}` = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${selectedGroupId}`;
        changeDomainSecurityGroup(domainAccountID, domainName, memberLogin, accountID, userSecurityGroup.key, userSecurityGroup.securityGroup, newSecurityGroupKey);
        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="MoveUserBetweenGroupsPage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.members.moveToGroup')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
                    }}
                />
                <Text style={[styles.ph5, styles.pb3, styles.textSupporting]}>{translate('domain.members.chooseWhereToMoveName', {name: memberLogin ?? ''})}</Text>

                <SelectionList<SecurityGroupItem>
                    data={data}
                    onSelectRow={handleSelectRow}
                    ListItem={SingleSelectListItem}
                    initiallyFocusedItemKey={currentGroupId}
                />
                <FixedFooter>
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={handleSave}
                        isDisabled={!selectedGroupId || selectedGroupId === currentGroupId || !memberLogin}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default MoveUserBetweenGroupsPage;
