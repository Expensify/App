import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, SectionListDataType} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {createNewReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import isRHPOnSearchMoneyRequestReportPage from '@navigation/helpers/isRHPOnSearchMoneyRequestReportPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
} & ListItem;

function NewReportWorkspaceSelectionPage() {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isRHPOnReportInSearch = isRHPOnSearchMoneyRequestReportPage();

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const navigateToNewReport = useCallback(
        (optimisticReportID: string) => {
            if (isRHPOnReportInSearch) {
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.dismissModal();
                });
            }

            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: optimisticReportID}), {forceReplace: isRHPOnReportInSearch || shouldUseNarrowLayout});
            });
        },
        [isRHPOnReportInSearch, shouldUseNarrowLayout],
    );

    const selectPolicy = useCallback(
        (policyID?: string) => {
            if (!policyID) {
                return;
            }
            if (shouldRestrictUserBillableActions(policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
                return;
            }
            const optimisticReportID = createNewReport(currentUserPersonalDetails, policyID);
            navigateToNewReport(optimisticReportID);
        },
        [currentUserPersonalDetails, navigateToNewReport],
    );

    const usersWorkspaces = useMemo<WorkspaceListItem[]>(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => shouldShowPolicy(policy, !!isOffline, currentUserPersonalDetails?.login) && !policy?.isJoinRequestPending && policy?.isPolicyExpenseChatEnabled)
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id,
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: policy?.id,
                isPolicyAdmin: isPolicyAdmin(policy),
                shouldSyncFocus: true,
            }))
            .sort((a, b) => localeCompare(a.text, b.text));
    }, [policies, isOffline, currentUserPersonalDetails?.login, localeCompare]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () => usersWorkspaces.filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? '')),
        [debouncedSearchTerm, usersWorkspaces],
    );

    const sections = useMemo(() => {
        const options: Array<SectionListDataType<WorkspaceListItem>> = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
            },
        ];
        return options;
    }, [filteredAndSortedUserWorkspaces]);

    const areResultsFound = filteredAndSortedUserWorkspaces.length > 0;
    const headerMessage = getHeaderMessageForNonUserList(areResultsFound, debouncedSearchTerm);

    return (
        <ScreenWrapper
            testID={NewReportWorkspaceSelectionPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('report.newReport.createReport')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <>
                            <Text style={[styles.ph5, styles.mb3]}>{translate('report.newReport.chooseWorkspace')}</Text>
                            <SelectionList<WorkspaceListItem>
                                ListItem={UserListItem}
                                sections={sections}
                                onSelectRow={(option) => selectPolicy(option.policyID)}
                                textInputLabel={usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                                textInputValue={searchTerm}
                                onChangeText={setSearchTerm}
                                headerMessage={headerMessage}
                                showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            />
                        </>
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

NewReportWorkspaceSelectionPage.displayName = 'NewReportWorkspaceSelectionPage';

export default NewReportWorkspaceSelectionPage;
