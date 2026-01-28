import type {ReactElement} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasHoverSupport} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import type {AutoCompleteSuggestionsPortalProps} from './AutoCompleteSuggestionsPortal';
import type {RenderSuggestionMenuItemProps} from './types';

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsPortalProps<TSuggestion>, 'left' | 'bottom'>;

function BaseAutoCompleteSuggestions<TSuggestion>({
    highlightedSuggestionIndex = 0,
    onSelect,
    accessibilityLabelExtractor,
    renderSuggestionMenuItem,
    suggestions,
    keyExtractor,
    measuredHeightOfSuggestionRows,
}: ExternalProps<TSuggestion>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const rowHeight = useSharedValue(0);
    const prevRowHeightRef = useRef<number>(measuredHeightOfSuggestionRows);
    const fadeInOpacity = useSharedValue(0);
    const scrollRef = useRef<FlatList<TSuggestion>>(null);
    /**
     * Render a suggestion menu item component.
     */
    const renderItem = useCallback(
        ({item, index}: RenderSuggestionMenuItemProps<TSuggestion>): ReactElement => (
            <PressableWithFeedback
                style={({hovered}) => StyleUtils.getAutoCompleteSuggestionItemStyle(highlightedSuggestionIndex, CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT, hovered, index)}
                hoverDimmingValue={1}
                onMouseDown={(e) => e.preventDefault()}
                onPress={() => onSelect(index)}
                onLongPress={() => {}}
                accessibilityLabel={accessibilityLabelExtractor(item, index)}
            >
                {renderSuggestionMenuItem(item, index)}
            </PressableWithFeedback>
        ),
        [accessibilityLabelExtractor, renderSuggestionMenuItem, StyleUtils, highlightedSuggestionIndex, onSelect],
    );

    const innerHeight = CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT * suggestions.length;

    const animatedStyles = useAnimatedStyle(() => ({
        opacity: fadeInOpacity.get(),
        ...StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight.get()),
    }));

    useEffect(() => {
        if (measuredHeightOfSuggestionRows === prevRowHeightRef.current) {
            fadeInOpacity.set(
                withTiming(1, {
                    duration: 70,
                    easing: Easing.inOut(Easing.ease),
                }),
            );
            rowHeight.set(measuredHeightOfSuggestionRows);
        } else {
            fadeInOpacity.set(1);
            rowHeight.set(
                withTiming(measuredHeightOfSuggestionRows, {
                    duration: 100,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
            );
        }

        prevRowHeightRef.current = measuredHeightOfSuggestionRows;
    }, [suggestions.length, rowHeight, measuredHeightOfSuggestionRows, prevRowHeightRef, fadeInOpacity]);

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }
        // When using cursor control (moving the cursor with the space bar on the keyboard) on Android, moving the cursor too fast may cause an error.
        try {
            scrollRef.current.scrollToIndex({index: highlightedSuggestionIndex, animated: true});
        } catch (e) {
            // eslint-disable-next-line no-console
        }
    }, [highlightedSuggestionIndex]);

    return (
        <Animated.View
            style={[styles.autoCompleteSuggestionsContainer, animatedStyles]}
            onPointerDown={(e) => {
                if (hasHoverSupport()) {
                    return;
                }
                e.preventDefault();
            }}
        >
            <ColorSchemeWrapper>
                <FlatList
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    data={suggestions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    removeClippedSubviews={false}
                    showsVerticalScrollIndicator={innerHeight > rowHeight.get()}
                    extraData={[highlightedSuggestionIndex, renderSuggestionMenuItem]}
                    style={styles.overscrollBehaviorContain}
                />
            </ColorSchemeWrapper>
        </Animated.View>
    );
}

export default BaseAutoCompleteSuggestions;
