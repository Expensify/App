import React, {useCallback, useMemo} from 'react';
import type {TupleToUnion, ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import TabSelector from '@components/TabSelector/TabSelector';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearUberEmployeeError, inviteWorkspaceEmployeesToUber} from '@libs/actions/Policy/Policy';
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
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type EditInviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT>;

const TAB_NAMES = [CONST.TAB.RECEIPT_PARTNERS.ALL, CONST.TAB.RECEIPT_PARTNERS.LINKED, CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING] as const;
type ReceiptPartnersTab = TupleToUnion<typeof TAB_NAMES>;
type UberEmployeeStatus = ValueOf<typeof CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS>;
function EditInviteReceiptPartnerPolicyPage({route}: EditInviteReceiptPartnerPolicyPageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const illustrations = useMemoizedLazyIllustrations(['SewerDino']);
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    const inviteOrResend = useCallback(
        (email: string) => {
            if (!policyID) {
                return;
            }
            inviteWorkspaceEmployeesToUber(policyID, [email]);
        },
        [policyID],
    );

    const dismissError = useCallback(
        (item: MemberForList) => {
            if (!policyID || !item.login) {
                return;
            }
            clearUberEmployeeError(policyID, item.login);
        },
        [policyID],
    );

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

    const uberEmployeesByEmail = useMemo<Record<string, {status?: string; pendingAction?: PendingAction; errors?: Record<string, string | null>}>>(() => {
        const policyWithEmployees = policy as typeof policy & {
            receiptPartners?: {
                uber?: {
                    employees?: Record<string, {status?: string; pendingAction?: PendingAction; errors?: Record<string, string | null>}>;
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

        const buttonStyles = [
            styles.button,
            StyleUtils.getButtonStyleWithIcon(styles, true, false, false, false, true, false),
            styles.ml3,
            {minWidth: variables.uberEmployeeInviteButtonWidth},
        ];
        const buttonTextStyles = [styles.buttonText, styles.buttonSmallText];

        for (const [email, policyEmployee] of Object.entries(employees)) {
            // Skip deleted policy employees
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }
            const personalDetail = getPersonalDetailByEmail(email);
            const status = deriveStatus(email);

            let rightElement;
            const isResend = status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.CREATED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.INVITED;
            const isInvite = status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.DELETED || status === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.NONE;
            if (isResend || isInvite) {
                const text = isResend ? translate('workspace.receiptPartners.uber.status.resend') : translate('workspace.receiptPartners.uber.status.invite');
                const textChecked = translate('workspace.receiptPartners.uber.status.resend');
                rightElement = (
                    <PressableWithDelayToggle
                        text={text}
                        textChecked={textChecked}
                        tooltipText=""
                        tooltipTextChecked=""
                        onPress={() => inviteOrResend(email)}
                        styles={[...buttonStyles, isInvite ? styles.buttonSuccess : undefined]}
                        textStyles={[...buttonTextStyles, isInvite ? styles.buttonSuccessText : undefined]}
                        iconChecked={Expensicons.Checkmark}
                        inline={false}
                        accessible={false}
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
                        source: personalDetail?.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(email),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: personalDetail?.accountID,
                    },
                ],
                keyForList: email,
                reportID: '',
                isDisabled: true,
                pendingAction: uberEmployeesByEmail[email]?.pendingAction,
            });

            const optionWithErrorsAndRightElement = {
                ...option,
                rightElement,
                errors: uberEmployeesByEmail[email]?.errors,
            };

            list.push(optionWithErrorsAndRightElement as MemberForList & ListItem);
        }
        return sortAlphabetically(list, 'text', localeCompare);
    }, [policy?.employeeList, styles, StyleUtils, localeCompare, isOffline, deriveStatus, uberEmployeesByEmail, translate, inviteOrResend, icons.FallbackAvatar]);

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

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.SewerDino}
                iconWidth={variables.uberEmptyListIconWidth}
                iconHeight={variables.uberEmptyListIconHeight}
                title={translate('workspace.receiptPartners.uber.emptyContent.title')}
                subtitle={translate('workspace.receiptPartners.uber.emptyContent.subtitle')}
                subtitleStyle={styles.textSupporting}
                titleStyles={styles.mb2}
                containerStyle={[styles.pb5, styles.ph5]}
                contentFitImage="contain"
            />
        ),
        [translate, styles.textSupporting, styles.mb2, styles.pb5, styles.ph5, illustrations.SewerDino],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
            <ScreenWrapper testID="EditInviteReceiptPartnerPolicyPage">
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
                                let currentHeaderMessage = getHeaderMessage(members.length !== 0, false, searchValue, countryCode, false);

                                if (filteredMembers.length === 0 && searchValue) {
                                    currentHeaderMessage = translate('common.noResultsFound');
                                }

                                return (
                                    <TabScreenWithFocusTrapWrapper>
                                        <SelectionList
                                            data={filteredMembers}
                                            ListItem={UserListItem}
                                            onSelectRow={() => {}}
                                            onDismissError={dismissError}
                                            style={{listItemWrapperStyle: styles.cursorDefault, listStyle: styles.mt3}}
                                            addBottomSafeAreaPadding
                                            shouldShowTextInput={shouldShowTextInput}
                                            textInputOptions={{
                                                label: shouldShowTextInput ? translate('common.search') : undefined,
                                                value: searchTerm,
                                                onChangeText: setSearchTerm,
                                                headerMessage: currentHeaderMessage,
                                            }}
                                            listEmptyContent={listEmptyContent}
                                            showListEmptyContent={shouldShowListEmptyContent}
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

export default EditInviteReceiptPartnerPolicyPage;
