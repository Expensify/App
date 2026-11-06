import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceCompanyCardBulkActionType} from './useWorkspaceCompanyCardsBulkActions';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableRow';

import useWorkspaceCompanyCardsBulkActions from './useWorkspaceCompanyCardsBulkActions';

type WorkspaceCompanyCardsTableControlsProps = {
    policyID: string;
    domainOrWorkspaceAccountID: number;
    bankName: UseCompanyCardsResult['bankName'];
    feedName: UseCompanyCardsResult['feedName'];

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Clear selected card rows */
    clearCardSelection: () => void;

    /** Whether the narrow-layout selection mode is active */
    isSelectionModeEnabled: boolean;

    /** The card rows the actions apply to */
    selectedCards: WorkspaceCompanyCardTableItemData[];
};

function WorkspaceCompanyCardsTableControls({
    policyID,
    domainOrWorkspaceAccountID,
    bankName,
    feedName,
    canWriteCompanyCards,
    clearCardSelection,
    isSelectionModeEnabled,
    selectedCards,
}: WorkspaceCompanyCardsTableControlsProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {translate} = useLocalize();
    const {shouldUseNarrowTableLayout} = useTableContext<WorkspaceCompanyCardTableItemData>();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const getBulkActionOptions = useWorkspaceCompanyCardsBulkActions({
        policyID,
        domainOrWorkspaceAccountID,
        bankName,
        feedName,
        canWriteCompanyCards,
        clearCardSelection,
        selectedCards,
    });

    const hasSelectedCards = selectedCards.length > 0;
    // The wide layout offers these actions in the floating bar over the table instead, so the filter bar stays put
    // no matter what is selected.
    const shouldShowBulkActions = shouldUseNarrowLayout && isSelectionModeEnabled;

    return (
        <>
            {shouldShowBulkActions && (
                <View style={[styles.w100, pageGutter, styles.pb3, !shouldUseNarrowTableLayout && styles.flexRow]}>
                    <ButtonWithDropdownMenu<WorkspaceCompanyCardBulkActionType>
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => {}}
                        customText={translate('workspace.common.selected', {count: selectedCards.length})}
                        options={getBulkActionOptions()}
                        isSplitButton={false}
                        shouldAlwaysShowDropdownMenu
                        isDisabled={!hasSelectedCards}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.BULK_ACTIONS_DROPDOWN}
                        wrapperStyle={[shouldUseNarrowTableLayout ? styles.w100 : styles.flexGrow0, styles.tableBulkActionsButton(shouldUseNarrowTableLayout)]}
                    />
                </View>
            )}
            {/* The filter bar must stay mounted while rows are selected: unmounting it resets the search string
                (TableSearchBar clears it on unmount), which would immediately clear the selection that was just made. */}
            <View>
                <Table.FilterBar label={translate('workspace.companyCards.findCompanyCard')} />
            </View>
        </>
    );
}

export default WorkspaceCompanyCardsTableControls;
