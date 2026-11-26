/** A search nested under a group of the flat navigation bar's subnav, composed from a row, its link and the link's optional badge. */
import Badge from '@components/Badge';
import Hoverable from '@components/Hoverable';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ComponentRef} from 'react';
import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';

import React, {createContext, useContext, useRef, useState} from 'react';
import {View} from 'react-native';

import hasKeyboardFocusIn from './hasKeyboardFocusIn';
import isFocusMovingWithin from './isFocusMovingWithin';

// Outside a row nothing is active, so the link and anything drawn over the row's end stay at rest.
const RowActiveContext = createContext(false);

/** Whether the pointer or keyboard focus is on the row, for content drawn over the row's end that animates in while the row is active */
function useIsFlatNavSubnavRowActive() {
    return useContext(RowActiveContext);
}

type FlatNavSubnavItemProps = {
    /** The row's link, and optionally content drawn over the row's end */
    children: React.ReactNode;
};

function FlatNavSubnavItemRow({children}: FlatNavSubnavItemProps) {
    const styles = useThemeStyles();
    const rowRef = useRef<ComponentRef<typeof View>>(null);
    // Keyboard focus activates the row like hover does, so content drawn over its end is never focused while hidden.
    const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);

    const updateKeyboardFocus = () => setHasKeyboardFocus(hasKeyboardFocusIn(rowRef.current));

    const clearKeyboardFocus = (event: NativeSyntheticEvent<TargetedEvent>) => {
        // Tabbing from the link to the content drawn over the row's end keeps the row active.
        if (isFocusMovingWithin(event)) {
            return;
        }
        setHasKeyboardFocus(false);
    };

    // The row is not a pressable itself, because content drawn over its end can have its own pressable, which cannot sit inside one.
    return (
        <Hoverable shouldUseNativeHoverEvents>
            {(isHovered) => (
                <View
                    ref={rowRef}
                    style={[styles.flatNavigationBarSubnavItem, isHovered && styles.highlightBG]}
                    onFocus={updateKeyboardFocus}
                    onBlur={clearKeyboardFocus}
                >
                    <RowActiveContext.Provider value={isHovered || hasKeyboardFocus}>{children}</RowActiveContext.Provider>
                </View>
            )}
        </Hoverable>
    );
}

type FlatNavSubnavItemLinkProps = {
    /** Translated row label */
    label: string;

    isSelected: boolean;

    /** The row cannot be opened, as a saved search that is pending delete */
    isDisabled?: boolean;

    sentryLabel: SentryLabel;

    onPress: () => void;

    /** Drawn after the label, inside the pressable area, as a badge */
    children?: React.ReactNode;
};

function FlatNavSubnavItemLink({label, isSelected, isDisabled = false, sentryLabel, onPress, children}: FlatNavSubnavItemLinkProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const isRowActive = useIsFlatNavSubnavRowActive();

    return (
        <PressableWithFeedback
            onPress={onPress}
            disabled={isDisabled}
            role={CONST.ROLE.TAB}
            accessibilityLabel={label}
            accessibilityState={{selected: isSelected, disabled: isDisabled}}
            sentryLabel={sentryLabel}
            wrapperStyle={[styles.flex1, styles.h100]}
            // The link carries the row's padding, so it can be pressed across the whole row. Content drawn over the row's end covers the label's end.
            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.h100, styles.flatNavigationBarSubnavItemLink, styles.flatNavigationBarSubnavItemRowEnd]}
        >
            <View style={styles.flex1}>
                <Text
                    variant={isSelected ? 'textStrong' : 'text'}
                    color={isSelected || isRowActive ? theme.text : theme.textSupporting}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </View>
            {children}
        </PressableWithFeedback>
    );
}

type FlatNavSubnavItemBadgeProps = {
    text: string;
};

function FlatNavSubnavItemBadge({text}: FlatNavSubnavItemBadgeProps) {
    const styles = useThemeStyles();

    return (
        <Badge
            text={text}
            badgeStyles={[styles.searchSectionBadge, styles.ml0]}
            success
            isCondensed
        />
    );
}

const FlatNavSubnavItem = Object.assign(FlatNavSubnavItemRow, {
    Link: FlatNavSubnavItemLink,
    Badge: FlatNavSubnavItemBadge,
});

export default FlatNavSubnavItem;
export {useIsFlatNavSubnavRowActive};
