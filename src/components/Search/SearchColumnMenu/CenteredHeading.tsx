import type {SortableHeaderLabelProps} from '@components/Search/SortableHeaderText';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type CenteredHeadingProps = {
    labelProps: SortableHeaderLabelProps;

    /** The heading, caret included, laid over the slot. */
    children: ReactNode;
};

/**
 * Keeps a centered label centered while its caret shows. A caret taking room would shift the label, so the spacer and the slot
 * split the spare room: the label rests centered and the caret takes the room after it. The slot never shrinks below the label,
 * so a label wider than its cell spills past both edges.
 */
function CenteredHeading({labelProps, children}: CenteredHeadingProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.justifyContentCenter]}>
            <View style={[styles.flexGrow1, styles.flexBasis0]} />
            <View style={[styles.flexGrow1, styles.flexShrink0]}>
                {/* Sizes the slot to the label. */}
                <View
                    aria-hidden
                    style={[styles.opacity0, styles.pointerEventsNone]}
                >
                    <SortableHeaderLabel {...labelProps} />
                </View>
                <View style={styles.searchColumnMenuLabelOverlay}>{children}</View>
            </View>
        </View>
    );
}

export default CenteredHeading;
