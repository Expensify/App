import React, {useMemo} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {SectionListDataType, SplitListItemType} from '@components/SelectionListWithSections/types';
import useDisplayFocusedInputUnderKeyboard from '@hooks/useDisplayFocusedInputUnderKeyboard';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitAmountListProps = {
    /** The split expense sections data. */
    sections: Array<SectionListDataType<SplitListItemType>>;
    /** The initially focused option key. */
    initiallyFocusedOptionKey: string | undefined;
    /** Callback when a row is selected. */
    onSelectRow: (item: SplitListItemType) => void;
    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;
};

/**
 * Dedicated component for the Amount tab in Split Expense flow.
 * Renders split items with amount inputs, managing its own scroll/height state.
 */
function SplitAmountList({sections, initiallyFocusedOptionKey, onSelectRow, listFooterContent}: SplitAmountListProps) {
    const styles = useThemeStyles();
    const {listRef, bottomOffset, scrollToFocusedInput, SplitListItem} = useDisplayFocusedInputUnderKeyboard();

    const amountSections = useMemo(() => {
        return sections.map((section) => ({
            ...section,
            data: section.data.map((item) => ({
                ...item,
                mode: CONST.TAB.SPLIT.AMOUNT,
            })),
        }));
    }, [sections]);

    return (
        <SelectionList
            renderScrollComponent={(props) => (
                <KeyboardAwareScrollView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    bottomOffset={bottomOffset.current}
                    onLayout={() => scrollToFocusedInput()}
                />
            )}
            onSelectRow={onSelectRow}
            ref={listRef}
            sections={amountSections}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            ListItem={SplitListItem}
            containerStyle={[styles.flexBasisAuto]}
            listFooterContent={listFooterContent}
            disableKeyboardShortcuts
            shouldSingleExecuteRowSelect
            canSelectMultiple={false}
            shouldPreventDefaultFocusOnSelectRow
            removeClippedSubviews={false}
            shouldHideListOnInitialRender={false}
        />
    );
}

SplitAmountList.displayName = 'SplitAmountList';

export default SplitAmountList;
