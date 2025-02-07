import type {ReactElement} from 'react';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Command} from '@pages/home/report/ReportActionCompose/SuggestionCommand';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import type {MeasureParentContainerAndCursorCallback} from './AutoCompleteSuggestions/types';
import Text from './Text';

type CommandSuggestionsProps = {
    /** The index of the highlighted command */
    highlightedCommandIndex?: number;

    /** Array of suggested command */
    commands: Command[];

    /** Fired when the user selects an command */
    onSelect: (index: number) => void;

    /** Measures the parent container's position and dimensions. Also add cursor coordinates */
    measureParentContainerAndReportCursor: (callback: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the command suggestions */
    resetSuggestions: () => void;
};

/**
 * Create unique keys for each command item
 */
const keyExtractor = (item: Command, index: number): string => `${item.name}+${index}}`;

function CommandSuggestions({commands, onSelect, highlightedCommandIndex = 0, measureParentContainerAndReportCursor = () => {}, resetSuggestions}: CommandSuggestionsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    /**
     * Render an command suggestion menu item component.
     */
    const renderSuggestionMenuItem = useCallback(
        (item: Command): ReactElement => {
            const styledTextArray = [{text: 'test', isColored: false}];

            return (
                <View style={styles.autoCompleteSuggestionContainer}>
                    <Text style={styles.emojiSuggestionsEmoji}>test</Text>
                    <Text
                        numberOfLines={2}
                        style={styles.emojiSuggestionsText}
                    >
                        :
                        {styledTextArray.map(({text, isColored}) => (
                            <Text
                                key={`${text}+${isColored}`}
                                style={StyleUtils.getColoredBackgroundStyle(isColored)}
                            >
                                {text}
                            </Text>
                        ))}
                        :
                    </Text>
                </View>
            );
        },
        [styles.autoCompleteSuggestionContainer, styles.emojiSuggestionsEmoji, styles.emojiSuggestionsText, StyleUtils],
    );

    return (
        <AutoCompleteSuggestions
            suggestions={commands}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedCommandIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={false}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

CommandSuggestions.displayName = 'CommandSuggestions';

export default CommandSuggestions;
