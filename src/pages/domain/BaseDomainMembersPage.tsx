import type {DomainMemberBulkActionType, DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderCentralPane from '@components/Header/composed/HeaderCentralPane';
import ScreenWrapper from '@components/ScreenWrapper';
import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import DomainMembersTable from '@components/Tables/DomainMembersTable';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';

import React from 'react';
import {View} from 'react-native';

import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainMembersPageProps = {
    domainAccountID: number;

    /** The list of members to display in the table */
    members: DomainMemberRowData[];

    headerTitle: string;

    /** Content to display in the header (e.g., Add/Settings buttons) */
    headerContent?: React.ReactNode;

    selectedMembers?: string[];

    /** Setter for a list of selected members */
    setSelectedMembers?: React.Dispatch<React.SetStateAction<string[]>>;

    /** Whether the selection mode header should be shown (changes title and hides icon) */
    useSelectionModeHeader?: boolean;

    onBackButtonPress?: () => void;

    /** Filter configuration for the group filter dropdown */
    filterConfig?: FilterConfig<DomainMembersTableFilterKey>;

    /** Callback to determine whether a member matches the active group filter */
    isItemInFilter?: IsItemInFilterCallback<DomainMemberRowData>;

    shouldShowGroupFilter: boolean;

    /** Whether the group column should be shown in the table */
    shouldShowGroupColumn: boolean;

    /** The actions the selected members support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DomainMemberBulkActionType>>;
};

function BaseDomainMembersPage({
    domainAccountID,
    members,
    headerTitle,
    headerContent,
    selectedMembers = [],
    setSelectedMembers,
    useSelectionModeHeader,
    onBackButtonPress,
    filterConfig,
    isItemInFilter,
    shouldShowGroupFilter,
    shouldShowGroupColumn,
    bulkActionOptions,
}: BaseDomainMembersPageProps) {
    const {translate} = useLocalize();
    const {pageGutter} = useLayoutSpacing();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="BaseDomainMembersPage"
            >
                <HeaderCentralPane
                    title={useSelectionModeHeader ? translate('common.selectMultiple') : headerTitle}
                    onBackButtonPress={onBackButtonPress}
                    isHeadline={!useSelectionModeHeader}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerContent}
                </HeaderCentralPane>
                {shouldDisplayButtonsInSeparateLine && !!headerContent && <View style={pageGutter}>{headerContent}</View>}
                <DomainMembersTable
                    domainAccountID={domainAccountID}
                    members={members}
                    selectionEnabled
                    selectedKeys={selectedMembers}
                    onRowSelectionChange={setSelectedMembers ?? (() => undefined)}
                    shouldShowGroupColumn={shouldShowGroupColumn}
                    filterConfig={shouldShowGroupFilter ? filterConfig : undefined}
                    isItemInFilter={shouldShowGroupFilter ? isItemInFilter : undefined}
                    bulkActionOptions={bulkActionOptions}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainMembersPage;
