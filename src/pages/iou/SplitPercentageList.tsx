import React, {useMemo, useRef} from 'react';
import SelectionList from '@components/SelectionList';
import SplitListItem from '@components/SelectionList/ListItem/SplitListItem';
import {SplitListItemType} from '@components/SelectionList/ListItem/types';
import {SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitPercentageListProps = {
    /** The split expense sections data. */
    data: SplitListItemType[];
    /** The initially focused option key. */
    initiallyFocusedOptionKey: string | undefined;
    /** Callback when a row is selected. */
    onSelectRow: (item: SplitListItemType) => void;
    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;
};

/**
 * Dedicated component for the Percentage tab in Split Expense flow.
 * Renders split items with percentage inputs, managing its own scroll/height state.
 */
function SplitPercentageList({data, initiallyFocusedOptionKey, onSelectRow, listFooterContent}: SplitPercentageListProps) {
    const styles = useThemeStyles();
    const listRef = useRef<SelectionListHandle<SplitListItemType>>(null);

    const percentagesOptions = useMemo(() => {
        return data.map((item) => ({
            ...item,
            mode: CONST.TAB.SPLIT.PERCENTAGE,
        }));
    }, [data]);

    return (
        <SelectionList
            ref={listRef}
            data={percentagesOptions}
            ListItem={SplitListItem}
            onSelectRow={onSelectRow}
            listFooterContent={listFooterContent}
            initiallyFocusedItemKey={initiallyFocusedOptionKey}
            style={{containerStyle: styles.flexBasisAuto}}
            shouldPreventDefaultFocusOnSelectRow
            shouldSingleExecuteRowSelect
            canSelectMultiple={false}
            disableKeyboardShortcuts
        />
    );
}

SplitPercentageList.displayName = 'SplitPercentageList';

export default SplitPercentageList;
