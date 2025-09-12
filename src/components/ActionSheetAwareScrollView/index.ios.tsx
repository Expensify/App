import type {PropsWithChildren} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import Reanimated, {useAnimatedRef, useScrollViewOffset} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import useActionSheetKeyboardSpace from './useActionSheetKeyboardSpace';
import useThemeStyles from '@hooks/useThemeStyles';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & {
    /** Whether to add top spacing for sticky content in inverted list */
    shouldAddTopSpacing?: boolean;
    /** Data array passed from FlatList when used as renderScrollComponent */
    data?: ReadonlyArray<any>;
};

const ActionSheetAwareScrollView = forwardRef<ScrollView, ActionSheetAwareScrollViewProps>(({style, children, shouldAddTopSpacing = false, data, ...rest}, ref) => {
    const scrollViewAnimatedRef = useAnimatedRef<Reanimated.ScrollView>();
    const position = useScrollViewOffset(scrollViewAnimatedRef);
    const spacerRef = useAnimatedRef<Reanimated.View>();
    const styles = useThemeStyles();

    const onRef = useCallback(
        (assignedRef: Reanimated.ScrollView) => {
            if (typeof ref === 'function') {
                ref(assignedRef);
            } else if (ref) {
                // eslint-disable-next-line no-param-reassign
                ref.current = assignedRef;
            }

            scrollViewAnimatedRef(assignedRef);
        },
        [ref, scrollViewAnimatedRef],
    );

    const {animatedStyle} = useActionSheetKeyboardSpace({position});

    useEffect(() => {
        if (!shouldAddTopSpacing) {
            return;
        }

        spacerRef.current?.measure((_x, _y, _width, height) => {
            DeviceEventEmitter.emit('invertedListHeaderHeight', height);
        });
    }, [shouldAddTopSpacing, data?.length]);

    const topSpacingComponent = useMemo(() => {
        if (!shouldAddTopSpacing || !data || data.length <= 0) {
            return null;
        }

        return (
            <Reanimated.View
                ref={spacerRef}
                style={styles.flex1}
            />
        );
    }, [shouldAddTopSpacing, data]);

    return (
        <Reanimated.ScrollView
            ref={onRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            style={[style, animatedStyle]}
        >
            {topSpacingComponent}
            {children}
        </Reanimated.ScrollView>
    );
});

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for inverted FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView for inverted list
 */
function renderScrollComponent(props: ScrollViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

/**
 * This function should be used as renderScrollComponent prop for inverted FlatList 
 * with sticky content at the top (like in money request report with transactions)
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView with top spacing for sticky content
 */
const renderScrollComponentWithTopSpacing = (props: ScrollViewProps) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (
        <ActionSheetAwareScrollView
            {...props}
            shouldAddTopSpacing
        />
    );
};

export {renderScrollComponent, renderScrollComponentWithTopSpacing, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
