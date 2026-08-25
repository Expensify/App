import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import DomainMembersTable from '@components/Tables/DomainMembersTable';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';

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

    /** Action button (e.g. create) rendered in the table filter bar, to the right of the display settings trigger */
    headerButton?: React.ReactNode;

    /** When rows are selected, replaces the entire table filter bar with this bulk-actions button */
    selectionButton?: React.ReactNode;
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
    headerButton,
    selectionButton,
}: BaseDomainMembersPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const headerTitleContent = useSelectionModeHeader ? (
        translate('common.selectMultiple')
    ) : (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text
                numberOfLines={1}
                style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, styles.textHeadlineH2]}
                accessibilityRole={CONST.ROLE.HEADER}
                accessibilityLabel={headerTitle}
            >
                {headerTitle}
            </Text>
            {headerContent}
        </View>
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
                    title={headerTitleContent}
                    onBackButtonPress={onBackButtonPress ?? Navigation.goBack}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader={!useSelectionModeHeader}
                    shouldDisplayHelpButton
                />
                <DomainMembersTable
                    domainAccountID={domainAccountID}
                    members={members}
                    selectionEnabled
                    selectedKeys={selectedMembers}
                    onRowSelectionChange={setSelectedMembers ?? (() => undefined)}
                    shouldShowGroupColumn={shouldShowGroupColumn}
                    filterConfig={shouldShowGroupFilter ? filterConfig : undefined}
                    isItemInFilter={shouldShowGroupFilter ? isItemInFilter : undefined}
                    headerButton={headerButton}
                    selectionButton={selectionButton}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainMembersPage;
