import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
// We take ScrollView from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {AutoCompleteSuggestionsPortalProps} from './AutoCompleteSuggestionsPortal';
import type {RenderSuggestionMenuItemProps} from './types';

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsPortalProps<TSuggestion>, 'left' | 'bottom'>;

function BaseAutoCompleteSuggestions<TSuggestion>({
    highlightedSuggestionIndex,
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
    const scrollRef = useRef<FlashList<TSuggestion>>(null);
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
        opacity: fadeInOpacity.value,
        ...StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight.value),
    }));

    useEffect(() => {
        if (measuredHeightOfSuggestionRows === prevRowHeightRef.current) {
            fadeInOpacity.value = withTiming(1, {
                duration: 70,
                easing: Easing.inOut(Easing.ease),
            });
            rowHeight.value = measuredHeightOfSuggestionRows;
        } else {
            fadeInOpacity.value = 1;
            rowHeight.value = withTiming(measuredHeightOfSuggestionRows, {
                duration: 100,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
        }

        prevRowHeightRef.current = measuredHeightOfSuggestionRows;
    }, [suggestions.length, rowHeight, measuredHeightOfSuggestionRows, prevRowHeightRef, fadeInOpacity]);

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({index: highlightedSuggestionIndex, animated: true});
    }, [highlightedSuggestionIndex]);

    if (suggestions.length === 0) {
        return null;
    }
    return (
        <Animated.View style={[styles.autoCompleteSuggestionsContainer, animatedStyles]}>
            <ColorSchemeWrapper>
                <FlashList
                    estimatedItemSize={CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT}
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    data={suggestions}
                    renderItem={renderItem}
                    renderScrollComponent={ScrollView}
                    keyExtractor={keyExtractor}
                    removeClippedSubviews={false}
                    showsVerticalScrollIndicator={innerHeight > rowHeight.value}
                    extraData={[highlightedSuggestionIndex, renderSuggestionMenuItem]}
                />
            </ColorSchemeWrapper>
        </Animated.View>
    );
}

BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';

export default BaseAutoCompleteSuggestions;
