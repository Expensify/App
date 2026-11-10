import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceCompanyCardBulkActionType} from './useWorkspaceCompanyCardsBulkActions';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableRow';

type WorkspaceCompanyCardsTableControlsProps = {
    /** The actions the selected cards support, built by the table so the floating bar offers the same list */
    bulkActionOptions: Array<DropdownOption<WorkspaceCompanyCardBulkActionType>>;

    /** Whether the narrow-layout selection mode is active */
    isSelectionModeEnabled: boolean;

    /** How many card rows the actions apply to */
    selectedCardsCount: number;
};

function WorkspaceCompanyCardsTableControls({bulkActionOptions, isSelectionModeEnabled, selectedCardsCount}: WorkspaceCompanyCardsTableControlsProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {translate} = useLocalize();
    const {shouldUseNarrowTableLayout} = useTableContext<WorkspaceCompanyCardTableItemData>();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // The wide layout offers these actions in the floating bar over the table instead.
    const shouldShowBulkActions = shouldUseNarrowLayout && isSelectionModeEnabled;

    return (
        <>
            {shouldShowBulkActions && (
                <View style={[styles.w100, pageGutter, styles.pb3, !shouldUseNarrowTableLayout && styles.flexRow]}>
                    <ButtonWithDropdownMenu<WorkspaceCompanyCardBulkActionType>
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => {}}
                        customText={translate('workspace.common.selected', {count: selectedCardsCount})}
                        options={bulkActionOptions}
                        isSplitButton={false}
                        shouldAlwaysShowDropdownMenu
                        isDisabled={selectedCardsCount === 0}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.BULK_ACTIONS_DROPDOWN}
                        wrapperStyle={[shouldUseNarrowTableLayout ? styles.w100 : styles.flexGrow0, styles.tableBulkActionsButton(shouldUseNarrowTableLayout)]}
                    />
                </View>
            )}
            {/* The filter bar stays mounted while rows are selected. Unmounting it resets the search string
                (TableSearchBar clears it on unmount), which would immediately clear the selection that was just made. */}
            <Table.FilterBar label={translate('workspace.companyCards.findCompanyCard')} />
        </>
    );
}

export default WorkspaceCompanyCardsTableControls;
