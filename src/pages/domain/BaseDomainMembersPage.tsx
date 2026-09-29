import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import DomainMembersTable from '@components/Tables/DomainMembersTable';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

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
}: BaseDomainMembersPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="BaseDomainMembersPage"
            >
                <HeaderWithBackButton
                    title={useSelectionModeHeader ? translate('common.selectMultiple') : headerTitle}
                    onBackButtonPress={onBackButtonPress ?? Navigation.goBack}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader={!useSelectionModeHeader}
                    shouldDisplayHelpButton
                >
                    {!shouldDisplayButtonsInSeparateLine && !!headerContent && <View style={[styles.flexRow, styles.gap2]}>{headerContent}</View>}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && !!headerContent && <View style={[styles.ph5, styles.flexRow, styles.gap2]}>{headerContent}</View>}
                <DomainMembersTable
                    domainAccountID={domainAccountID}
                    members={members}
                    selectionEnabled
                    selectedKeys={selectedMembers}
                    onRowSelectionChange={setSelectedMembers ?? (() => undefined)}
                    shouldShowGroupColumn={shouldShowGroupColumn}
                    filterConfig={shouldShowGroupFilter ? filterConfig : undefined}
                    isItemInFilter={shouldShowGroupFilter ? isItemInFilter : undefined}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainMembersPage;
