import type {ReactElement} from 'react';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getStyledTextArray from '@libs/GetStyledTextArray';
import type {ComposerCommand} from '@src/CONST';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import type {MeasureParentContainerAndCursorCallback} from './AutoCompleteSuggestions/types';
import Icon from './Icon';
import Text from './Text';

type CommandSuggestionsProps = {
    /** The index of the highlighted command */
    highlightedCommandIndex?: number;

    /** Array of suggested command */
    commands: ComposerCommand[];

    /** Current composer value */
    value: string;

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
const keyExtractor = (item: ComposerCommand, index: number): string => `${item.command}+${index}`;

function CommandSuggestions({commands, onSelect, value, highlightedCommandIndex = 0, measureParentContainerAndReportCursor = () => {}, resetSuggestions}: CommandSuggestionsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();

    /**
     * Render an command suggestion menu item component.
     */
    const renderSuggestionMenuItem = useCallback(
        (item: ComposerCommand): ReactElement => {
            const styledTextArray = getStyledTextArray(item.command, value);

            return (
                <View style={styles.autoCompleteCommandSuggestionContainer}>
                    <Icon
                        src={item.icon}
                        fill={theme.iconSuccessFill}
                        height={16}
                        width={16}
                    />
                    <Text
                        numberOfLines={1}
                        style={styles.emojiCommandSuggestionsText}
                    >
                        {styledTextArray.map(({text, isColored}) => (
                            <Text
                                key={`${text}+${isColored}`}
                                style={StyleUtils.getColoredBackgroundStyle(isColored)}
                            >
                                {text}
                            </Text>
                        ))}
                    </Text>
                    <Text style={styles.commandSuggestions}>{translate(item.descriptionKey)}</Text>
                </View>
            );
        },
        [value, styles.autoCompleteCommandSuggestionContainer, styles.emojiCommandSuggestionsText, styles.commandSuggestions, theme.iconSuccessFill, translate, StyleUtils],
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
