import React, {useCallback, useMemo} from 'react';
import type {TupleToUnion} from 'type-fest';
import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import TabSelector from '@components/TabSelector/TabSelector';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type EditInviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT>;

const TAB_NAMES = [CONST.TAB.RECEIPT_PARTNERS.ALL, CONST.TAB.RECEIPT_PARTNERS.LINKED, CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING] as const;
const UBER_EMPLOYEE_STATUS_VALUES = [
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.CREATED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL,
    CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED,
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

    // Maintain independent search state per tab to avoid carryover across tabs
    const [allSearchTerm, allDebouncedSearchTerm, setAllSearchTerm] = useDebouncedState('');
    const [linkedSearchTerm, linkedDebouncedSearchTerm, setLinkedSearchTerm] = useDebouncedState('');
    const [outstandingSearchTerm, outstandingDebouncedSearchTerm, setOutstandingSearchTerm] = useDebouncedState('');

    const getSearchStateForTab = useCallback(
        (tab: ReceiptPartnersTab) => {
            if (tab === CONST.TAB.RECEIPT_PARTNERS.ALL) {
                return {searchTerm: allSearchTerm, debouncedSearchTerm: allDebouncedSearchTerm, setSearchTerm: setAllSearchTerm};
            }
            if (tab === CONST.TAB.RECEIPT_PARTNERS.LINKED) {
                return {searchTerm: linkedSearchTerm, debouncedSearchTerm: linkedDebouncedSearchTerm, setSearchTerm: setLinkedSearchTerm};
            }
            return {searchTerm: outstandingSearchTerm, debouncedSearchTerm: outstandingDebouncedSearchTerm, setSearchTerm: setOutstandingSearchTerm};
        },
        [
            allSearchTerm,
            allDebouncedSearchTerm,
            linkedSearchTerm,
            linkedDebouncedSearchTerm,
            outstandingSearchTerm,
            outstandingDebouncedSearchTerm,
            setAllSearchTerm,
            setLinkedSearchTerm,
            setOutstandingSearchTerm,
        ],
    );

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
            const status = uberEmployeesByEmail[email]?.status as UberEmployeeStatus;

            return status ?? CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE;
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
            const status = deriveStatus(email);

            let rightElement;

            // Show resend button for CREATED and INVITED
            if (status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.CREATED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED) {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.status.resend')}
                        onPress={() => {}}
                        style={[styles.ml3]}
                    />
                );
            }
            // Show invite button for DELETED and NONE
            else if (status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE) {
                rightElement = (
                    <Button
                        small
                        text={translate('workspace.receiptPartners.uber.status.invite')}
                        onPress={() => {}}
                        success
                        style={[styles.ml3]}
                    />
                );
            } else {
                const badgeText = translate(`workspace.receiptPartners.uber.status.${status}`);
                const isSuccess = status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED;
                rightElement = (
                    <Badge
                        text={badgeText}
                        success={isSuccess}
                        style={[styles.ml3]}
                    />
                );
            }

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
                isDisabled: true,
            });

            list.push({...option, rightElement} as MemberForList & ListItem);
        });
        return sortAlphabetically(list, 'text', localeCompare);
    }, [deriveStatus, localeCompare, policy?.employeeList, translate, isOffline, styles.ml3]);

    const applyTabStatusFilter = useCallback(
        (tab: ReceiptPartnersTab, data: MemberForList[]) => {
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
                return (
                    status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.CREATED ||
                    status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED ||
                    status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED ||
                    status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE
                );
            });
        },
        [deriveStatus],
    );

    const getMembersForTabWithoutSearch = useCallback((tab: ReceiptPartnersTab) => applyTabStatusFilter(tab, members), [applyTabStatusFilter, members]);

    const filterMembers = useCallback(
        (tab: ReceiptPartnersTab) => {
            const {debouncedSearchTerm} = getSearchStateForTab(tab);
            const search = debouncedSearchTerm.trim().toLowerCase();
            let data = members;
            if (search) {
                data = tokenizedSearch(members, search, (m) => [m.text ?? '', m.alternateText ?? '']);
            }
            return applyTabStatusFilter(tab, data);
        },
        [applyTabStatusFilter, getSearchStateForTab, members],
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

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.ToddBehindCloud}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.receiptPartners.uber.emptyContent.title')}
                subtitle={translate('workspace.receiptPartners.uber.emptyContent.subtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
        ),
        [translate, styles.textSupporting, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
            <ScreenWrapper testID={EditInviteReceiptPartnerPolicyPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.receiptPartners.uber.manageInvites')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
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
                                const {searchTerm, debouncedSearchTerm, setSearchTerm} = getSearchStateForTab(tabName);
                                const filteredMembers = filterMembers(tabName);
                                const baseTabMembersCount = getMembersForTabWithoutSearch(tabName).length;
                                const shouldShowListEmptyContent = baseTabMembersCount < CONST.STANDARD_LIST_ITEM_LIMIT;
                                const shouldShowTextInput = !shouldShowListEmptyContent;

                                // Determine header message for search results
                                const searchValue = debouncedSearchTerm.trim().toLowerCase();
                                let currentHeaderMessage = getHeaderMessage(members.length !== 0, false, searchValue);

                                if (filteredMembers.length === 0 && searchValue) {
                                    currentHeaderMessage = translate('common.noResultsFound');
                                }

                                return (
                                    <TabScreenWithFocusTrapWrapper>
                                        <SelectionList
                                            ListItem={UserListItem}
                                            onSelectRow={() => {}}
                                            listItemWrapperStyle={styles.cursorDefault}
                                            addBottomSafeAreaPadding
                                            shouldShowTextInput={shouldShowTextInput}
                                            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
                                            textInputValue={searchTerm}
                                            onChangeText={setSearchTerm}
                                            headerMessage={currentHeaderMessage}
                                            sections={buildSections(filteredMembers)}
                                            listEmptyContent={listEmptyContent}
                                            shouldShowListEmptyContent={shouldShowListEmptyContent}
                                            sectionListStyle={styles.pt3}
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
