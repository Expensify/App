import React, {useCallback, useMemo} from 'react';
import type {TupleToUnion} from 'type-fest';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type EditInviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT>;

const TAB_NAMES = [CONST.TAB.RECEIPT_PARTNERS.ALL, CONST.TAB.RECEIPT_PARTNERS.LINKED, CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING] as const;
const UBER_EMPLOYEE_STATUS_VALUES = [
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE,
] as const;

type ReceiptPartnersTab = TupleToUnion<typeof TAB_NAMES>;
type UberEmployeeStatus = TupleToUnion<typeof UBER_EMPLOYEE_STATUS_VALUES>;

function EditInviteReceiptPartnerPolicyPage({route}: EditInviteReceiptPartnerPolicyPageProps) {
    const styles = useThemeStyles();
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
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED;
                case 'invited':
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED;
                case 'pending_approval':
                case 'accepted_pending_approval':
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL;
                case 'suspended':
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED;
                case 'deleted':
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED;
                default:
                    return CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE;
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
                case CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED:
                    badgeText = translate('workspace.receiptPartners.uber.linked');
                    break;
                case CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL:
                    badgeText = translate('workspace.receiptPartners.uber.pending');
                    break;
                case CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED:
                    badgeText = translate('workspace.receiptPartners.uber.suspended');
                    break;
                default:
                    break;
            }

            let rightElement: React.ReactNode | undefined;
            if (status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED) {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.resend')}
                        onPress={() => {}}
                        style={[styles.ml3]}
                    />
                );
            } else if (status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE) {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.invite')}
                        onPress={() => {}}
                        success
                        style={[styles.ml3]}
                    />
                );
            } else if (badgeText) {
                rightElement = (
                    <Badge
                        text={badgeText}
                        style={[styles.ml3]}
                    />
                );
            }

            list.push({...option, rightElement, isDisabled: true} as MemberForList & ListItem);
        });
        return sortAlphabetically(list, 'text', localeCompare);
    }, [deriveStatus, localeCompare, policy?.employeeList, translate, isOffline, styles.ml3]);

    const filterMembers = useCallback(
        (tab: ReceiptPartnersTab, skipSearch = false) => {
            const search = skipSearch ? '' : debouncedSearchTerm.trim().toLowerCase();
            let data = members;
            if (search) {
                data = tokenizedSearch(members, search, (m) => [m.text ?? '', m.alternateText ?? '']);
            }

            if (tab === CONST.TAB.RECEIPT_PARTNERS.ALL) {
                return data;
            }
            if (tab === CONST.TAB.RECEIPT_PARTNERS.LINKED) {
                return data.filter((m) => {
                    const status = deriveStatus(m.login ?? '');
                    return (
                        status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED ||
                        status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL ||
                        status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED
                    );
                });
            }
            // OUTSTANDING
            return data.filter((m) => {
                const email = m.login ?? '';
                const status = deriveStatus(email);
                if (status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED) {
                    return true;
                }
                // not in uber list
                return status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE;
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

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
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
                            {() => {
                                // Get members for this tab without search filter to determine if search should show
                                const tabMembersWithoutSearch = filterMembers(tabName, true);
                                const shouldShowSearch = tabMembersWithoutSearch.length > 8;

                                // Get filtered members (with search if applicable)
                                const filteredMembers = filterMembers(tabName);

                                // Determine header message for search results
                                const searchValue = debouncedSearchTerm.trim().toLowerCase();
                                let currentHeaderMessage = headerMessage;

                                if (shouldShowSearch && searchValue && filteredMembers.length === 0) {
                                    currentHeaderMessage = translate('common.noResultsFound');
                                }

                                return (
                                    <TabScreenWithFocusTrapWrapper>
                                        <SelectionList
                                            ListItem={InviteMemberListItem}
                                            onSelectRow={() => {}}
                                            listItemWrapperStyle={[styles.cursorDefault, styles.workspaceEditInviteListItemCard, styles.mb2]}
                                            addBottomSafeAreaPadding
                                            textInputLabel={shouldShowSearch ? translate('common.search') : undefined}
                                            textInputValue={shouldShowSearch ? searchTerm : undefined}
                                            onChangeText={shouldShowSearch ? setSearchTerm : undefined}
                                            headerMessage={currentHeaderMessage}
                                            sections={buildSections(filteredMembers)}
                                            sectionListStyle={[shouldShowSearch ? styles.pt3 : styles.pt4, styles.ph5]}
                                        />
                                    </TabScreenWithFocusTrapWrapper>
                                );
                            }}
                        </TopTab.Screen>
                    ))}
                </OnyxTabNavigator>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditInviteReceiptPartnerPolicyPage.displayName = 'EditInviteReceiptPartnerPolicyPage';

export default EditInviteReceiptPartnerPolicyPage;
