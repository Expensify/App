import {FlashList} from '@shopify/flash-list';
import type {ForwardedRef, ReactElement} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef} from 'react';
import type {View} from 'react-native';
// We take ScrollView from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import viewForwardedRef from '@src/types/utils/viewForwardedRef';
import type {AutoCompleteSuggestionsPortalProps} from './AutoCompleteSuggestionsPortal';
import type {RenderSuggestionMenuItemProps} from './types';

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsPortalProps<TSuggestion>, 'left' | 'bottom'>;

function BaseAutoCompleteSuggestions<TSuggestion>(
    {
        highlightedSuggestionIndex,
        onSelect,
        accessibilityLabelExtractor,
        renderSuggestionMenuItem,
        suggestions,
        keyExtractor,
        measuredHeightOfSuggestionRows,
        width,
    }: ExternalProps<TSuggestion>,
    ref: ForwardedRef<View | HTMLDivElement>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const rowHeight = useSharedValue(0);
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
    }));
    const estimatedListSize = useMemo(
        () => ({
            height: measuredHeightOfSuggestionRows,
            width,
        }),
        [measuredHeightOfSuggestionRows, width],
    );
    useEffect(() => {
        fadeInOpacity.value = withTiming(1, {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
        });
    }, [suggestions.length, rowHeight, measuredHeightOfSuggestionRows, fadeInOpacity]);

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({index: highlightedSuggestionIndex, animated: true});
    }, [highlightedSuggestionIndex]);

    return (
        <Animated.View
            ref={viewForwardedRef(ref)}
            style={[styles.autoCompleteSuggestionsContainer, animatedStyles, StyleUtils.getAutoCompleteSuggestionContainerStyle(measuredHeightOfSuggestionRows)]}
        >
            <ColorSchemeWrapper>
                <FlashList
                    estimatedItemSize={CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT}
                    estimatedListSize={estimatedListSize}
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

export default forwardRef(BaseAutoCompleteSuggestions);
