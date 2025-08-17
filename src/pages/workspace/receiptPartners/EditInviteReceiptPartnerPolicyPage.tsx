import React, {useCallback, useMemo} from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import TabSelector from '@components/TabSelector/TabSelector';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type EditInviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT>;

type UberEmployeeStatus = 'LINKED' | 'INVITED' | 'LINKED_PENDING_APPROVAL' | 'SUSPENDED' | 'DELETED' | 'NONE';

const TAB_NAMES = [CONST.TAB.RECEIPT_PARTNERS.ALL, CONST.TAB.RECEIPT_PARTNERS.LINKED, CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING];

function EditInviteReceiptPartnerPolicyPage({route}: EditInviteReceiptPartnerPolicyPageProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const uberEmployeesByEmail = useMemo<Record<string, {status?: string}>>(() => {
        const policyWithEmployees = policy as typeof policy & {
            receiptPartners?: {
                uber?: {
                    employees?: Record<string, {status?: string}>;
                };
            };
        };
        return policyWithEmployees?.receiptPartners?.uber?.employees ?? {};
    }, [policy]);

    const deriveStatus = useCallback(
        (email: string): UberEmployeeStatus => {
            const status = uberEmployeesByEmail[email]?.status?.toLowerCase();
            switch (status) {
                case 'accepted':
                    return 'LINKED';
                case 'invited':
                    return 'INVITED';
                case 'pending_approval':
                case 'accepted_pending_approval':
                    return 'LINKED_PENDING_APPROVAL';
                case 'suspended':
                    return 'SUSPENDED';
                case 'deleted':
                    return 'DELETED';
                default:
                    return 'NONE';
            }
        },
        [uberEmployeesByEmail],
    );

    const members = useMemo<Array<MemberForList & ListItem>>(() => {
        const list: Array<MemberForList & ListItem> = [];
        const employees = policy?.employeeList ?? {};
        Object.entries(employees).forEach(([email, policyEmployee]) => {
            // Skip deleted policy employees
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                return;
            }
            const personalDetail = getPersonalDetailByEmail(email);
            const option = formatMemberForList({
                text: personalDetail?.displayName ?? email,
                alternateText: email,
                login: email,
                accountID: personalDetail?.accountID,
                icons: [
                    {
                        source: personalDetail?.avatar ?? Expensicons.FallbackAvatar,
                        name: formatPhoneNumber(email),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: personalDetail?.accountID,
                    },
                ],
                keyForList: email,
                reportID: '',
            });
            const status = deriveStatus(email);
            let badgeText: string | undefined;
            switch (status) {
                case 'LINKED':
                    badgeText = translate('workspace.receiptPartners.uber.linked');
                    break;
                case 'LINKED_PENDING_APPROVAL':
                    badgeText = translate('workspace.receiptPartners.uber.pending');
                    break;
                case 'SUSPENDED':
                    badgeText = translate('workspace.receiptPartners.uber.suspended');
                    break;
                default:
                    break;
            }

            let rightElement: React.ReactNode | undefined;
            if (status === 'INVITED' || status === 'DELETED') {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.resend')}
                        onPress={() => {}}
                    />
                );
            } else if (status === 'NONE') {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.invite')}
                        onPress={() => {}}
                    />
                );
            } else if (badgeText) {
                rightElement = <Badge text={badgeText} />;
            }

            list.push({...option, rightElement} as MemberForList & ListItem);
        });
        return sortAlphabetically(list, 'text', localeCompare);
    }, [deriveStatus, localeCompare, policy?.employeeList, translate, isOffline]);

    const filterMembers = useCallback(
        (tab: 'ALL' | 'LINKED' | 'OUTSTANDING') => {
            const search = debouncedSearchTerm.trim().toLowerCase();
            let data = members;
            if (search) {
                data = tokenizedSearch(members, search, (m) => [m.text ?? '', m.alternateText ?? '']);
            }

            if (tab === 'ALL') {
                return data;
            }
            if (tab === 'LINKED') {
                return data.filter((m) => {
                    const status = deriveStatus(m.login ?? '');
                    return status === 'LINKED' || status === 'LINKED_PENDING_APPROVAL' || status === 'SUSPENDED';
                });
            }
            // OUTSTANDING
            return data.filter((m) => {
                const email = m.login ?? '';
                const status = deriveStatus(email);
                if (status === 'INVITED' || status === 'DELETED') {
                    return true;
                }
                // not in uber list
                return status === 'NONE';
            });
        },
        [debouncedSearchTerm, deriveStatus, members],
    );

    const buildSections = useCallback(
        (data: MemberForList[]) => [
            {
                title: undefined,
                data,
                shouldShow: true,
            },
        ],
        [],
    );

    const headerMessage = getHeaderMessage(members.length !== 0, false, debouncedSearchTerm.trim().toLowerCase());
    const shouldShowSearch = members.length > 8;

    return (
        <ScreenWrapper testID={EditInviteReceiptPartnerPolicyPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.receiptPartners.uber.manageInvites')}
                onBackButtonPress={() => window.history.back()}
            />

            <OnyxTabNavigator
                id={CONST.TAB.RECEIPT_PARTNERS.NAVIGATOR_ID}
                tabBar={TabSelector}
                equalWidth
            >
                {TAB_NAMES.map((tabName) => (
                    <TopTab.Screen
                        key={tabName}
                        name={tabName}
                    >
                        {() => (
                            <TabScreenWithFocusTrapWrapper>
                                <SelectionList
                                    ListItem={InviteMemberListItem}
                                    onSelectRow={() => {}}
                                    addBottomSafeAreaPadding
                                    textInputLabel={shouldShowSearch ? translate('common.search') : undefined}
                                    textInputValue={shouldShowSearch ? searchTerm : undefined}
                                    onChangeText={shouldShowSearch ? setSearchTerm : undefined}
                                    headerMessage={headerMessage}
                                    sections={buildSections(filterMembers(tabName as 'ALL' | 'LINKED' | 'OUTSTANDING'))}
                                />
                            </TabScreenWithFocusTrapWrapper>
                        )}
                    </TopTab.Screen>
                ))}
            </OnyxTabNavigator>
        </ScreenWrapper>
    );
}

EditInviteReceiptPartnerPolicyPage.displayName = 'EditInviteReceiptPartnerPolicyPage';

export default EditInviteReceiptPartnerPolicyPage;
