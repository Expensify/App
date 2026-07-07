import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import DomainMembersTable from '@components/Tables/DomainMembersTable';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainMembersPageProps = {
    /** The ID of the domain used for the not found wrapper */
    domainAccountID: number;

    /** The list of members to display in the table */
    members: DomainMemberRowData[];

    /** The title of the header */
    headerTitle: string;

    /** Content to display in the header (e.g., Add/Settings buttons) */
    headerContent?: React.ReactNode;

    /** Icon displayed in the header of the tab */
    headerIcon?: IconAsset;

    /** Stores list of selected members */
    selectedMembers?: string[];

    /** Setter for a list of selected members */
    setSelectedMembers?: React.Dispatch<React.SetStateAction<string[]>>;

    /** Whether the selection mode header should be shown (changes title and hides icon) */
    useSelectionModeHeader?: boolean;

    /** Custom back button press handler */
    onBackButtonPress?: () => void;

    /** Filter configuration for the group filter dropdown */
    filterConfig?: FilterConfig<DomainMembersTableFilterKey>;

    /** Callback to determine whether a member matches the active group filter */
    isItemInFilter?: IsItemInFilterCallback<DomainMemberRowData>;

    /** Whether the group filter should be shown */
    shouldShowGroupFilter: boolean;

    /** Whether the group column should be shown in the table */
    shouldShowGroupColumn: boolean;

    /** Title to show in the empty state when the list has no items */
    emptyStateTitle?: string;

    /** Subtitle to show in the empty state when the list has no items */
    emptyStateSubtitle?: string;
};

function BaseDomainMembersPage({
    domainAccountID,
    members,
    headerTitle,
    headerContent,
    headerIcon,
    selectedMembers = [],
    setSelectedMembers,
    useSelectionModeHeader,
    onBackButtonPress,
    filterConfig,
    isItemInFilter,
    shouldShowGroupFilter,
    shouldShowGroupColumn,
    emptyStateTitle,
    emptyStateSubtitle,
}: BaseDomainMembersPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const emptyStateComponent = (
        <GenericEmptyStateComponent
            headerMedia={illustrations.EmptyShelves}
            headerContentStyles={styles.emptyShelvesIllustration}
            title={emptyStateTitle ?? ''}
            subtitle={emptyStateSubtitle}
            headerStyles={styles.emptyStateCardIllustrationContainer}
        />
    );

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
                    icon={!useSelectionModeHeader ? headerIcon : undefined}
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
                    EmptyStateComponent={emptyStateComponent}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainMembersPage;
