/** A search nested under a group of the flat navigation bar's subnav, composed from a row, its link and the link's optional badge. */
import Badge from '@components/Badge';
import Hoverable from '@components/Hoverable';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React, {createContext, useContext} from 'react';
import {View} from 'react-native';

/** Whether the pointer is over the row, so the link can highlight its label while an accessory is hovered */
const RowHoverContext = createContext(false);

type FlatNavSubnavItemProps = {
    /** The link, followed by anything drawn at the row's end, as a three-dot menu */
    children: React.ReactNode;
};

function FlatNavSubnavItemRow({children}: FlatNavSubnavItemProps) {
    const styles = useThemeStyles();

    // The row is not a pressable itself, because an accessory with its own pressable cannot sit inside one.
    return (
        <Hoverable>
            {(isHovered) => (
                <View style={[styles.flatNavigationBarSubnavItem, isHovered && styles.highlightBG]}>
                    <RowHoverContext.Provider value={isHovered}>{children}</RowHoverContext.Provider>
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
    const isHovered = useContext(RowHoverContext);

    return (
        <PressableWithFeedback
            onPress={onPress}
            disabled={isDisabled}
            role={CONST.ROLE.TAB}
            accessibilityLabel={label}
            accessibilityState={{selected: isSelected, disabled: isDisabled}}
            sentryLabel={sentryLabel}
            wrapperStyle={[styles.flex1, styles.h100]}
            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.h100]}
        >
            <View style={styles.flex1}>
                <Text
                    variant={isSelected ? 'textStrong' : 'text'}
                    color={isSelected || isHovered ? theme.text : theme.textSupporting}
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
