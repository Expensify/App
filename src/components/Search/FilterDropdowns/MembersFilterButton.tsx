import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {PopoverComponentProps} from './FilterPopupButton';
import FilterPopupButton from './FilterPopupButton';
import MultiSelectPopup from './MultiSelectPopup';
import type {MultiSelectItem} from './MultiSelectPopup';

type MembersFilterButtonProps<T extends string> = WithSentryLabel & {
    /** The label to display on the filter button */
    label: string;

    /** The label to display in the multi-select popover header */
    popoverLabel: string;

    /** Whether a search bar is shown next to the filter button */
    shouldShowSearchBar: boolean;

    /** The list of all items to show in the popover */
    items: Array<MultiSelectItem<T>>;

    /** The currently selected items */
    selectedItems: Array<MultiSelectItem<T>>;

    /** Function to call when the selection changes */
    onSelectionChange: (items: Array<MultiSelectItem<T>>) => void;
};

function MembersFilterButton<T extends string>({label, popoverLabel, shouldShowSearchBar, items, selectedItems, onSelectionChange, sentryLabel}: MembersFilterButtonProps<T>) {
    const styles = useThemeStyles();

    const popoverComponent = ({closeOverlay}: PopoverComponentProps) => (
        <MultiSelectPopup
            label={popoverLabel}
            items={items}
            value={selectedItems}
            closeOverlay={closeOverlay}
            onChange={onSelectionChange}
        />
    );

    return (
        <View style={[styles.flexGrow0, styles.flexShrink0, styles.mnw0, styles.overflowHidden, shouldShowSearchBar ? styles.mw50 : styles.mw100]}>
            <FilterPopupButton
                wrapperStyle={[styles.flexGrow0, styles.flexShrink0, styles.mnw0, styles.mw100]}
                PopoverComponent={popoverComponent}
                renderButton={({onPress, ref, isExpanded}) => (
                    <Button
                        ref={ref}
                        medium
                        innerStyles={[isExpanded && styles.buttonHoveredBG, styles.gap2, styles.mw100, styles.flexShrink1, styles.mnw0]}
                        onPress={onPress}
                        sentryLabel={sentryLabel}
                    >
                        <CaretWrapper
                            style={[styles.flexShrink1, styles.mnw0, styles.mw100, styles.gap2]}
                            caretWidth={variables.iconSizeSmall}
                            caretHeight={variables.iconSizeSmall}
                            isActive={isExpanded}
                        >
                            <View style={[styles.flexShrink1, styles.mnw0, styles.overflowHidden]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.textMicroBold, styles.fontSizeLabel]}
                                >
                                    {label}
                                </Text>
                            </View>
                        </CaretWrapper>
                    </Button>
                )}
            />
        </View>
    );
}

export default MembersFilterButton;
export type {MembersFilterButtonProps};
