import React, {useMemo} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import type {ValueOf} from 'type-fest';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {SectionListDataType, SplitListItemType} from '@components/SelectionListWithSections/types';
import useDisplayFocusedInputUnderKeyboard from '@hooks/useDisplayFocusedInputUnderKeyboard';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitListProps = {
    /** The split expense sections data. */
    sections: Array<SectionListDataType<SplitListItemType>>;
    /** The initially focused option key. */
    initiallyFocusedOptionKey: string | undefined;
    /** Callback when a row is selected. */
    onSelectRow: (item: SplitListItemType) => void;
    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;
    /** The split mode to use (amount, percentage, or date). */
    mode: ValueOf<typeof CONST.TAB.SPLIT>;
};

/**
 * Unified component for split expense tabs (Amount, Percentage, Date).
 * Renders split items with the appropriate input type based on mode,
 * managing its own scroll/height state.
 */
function SplitList({sections, initiallyFocusedOptionKey, onSelectRow, listFooterContent, mode}: SplitListProps) {
    const styles = useThemeStyles();
    const {listRef, bottomOffset, scrollToFocusedInput, SplitListItem} = useDisplayFocusedInputUnderKeyboard();

    const splitSections = useMemo(() => {
        return sections.map((section) => ({
            ...section,
            data: section.data.map((item) => ({
                ...item,
                mode,
            })),
        }));
    }, [sections, mode]);

    const isPercentageMode = mode === CONST.TAB.SPLIT.PERCENTAGE;

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
            sections={splitSections}
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
            shouldSkipContentHeaderHeightOffset={isPercentageMode}
        />
    );
}

export default SplitList;
