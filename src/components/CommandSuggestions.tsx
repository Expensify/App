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
import Badge from './Badge';
import Icon from './Icon';
import Text from './Text';

type CommandSuggestionsProps = {
    /** The index of the highlighted command */
    highlightedCommandIndex?: number;

    /** Array of suggested commands */
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
                <View style={[styles.autoCompleteCommandSuggestionContainer, item.disabled && styles.opacitySemiTransparent]}>
                    <Icon
                        src={item.icon}
                        fill={theme.iconSuccessFill}
                        small
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
                    <Badge
                        text={translate(item.disabled ? 'common.coming' : 'common.new')}
                        badgeStyles={item.disabled ? styles.activeItemBadge : styles.borderColorFocus}
                    />
                </View>
            );
        },
        [
            value,
            styles.autoCompleteCommandSuggestionContainer,
            styles.opacitySemiTransparent,
            styles.emojiCommandSuggestionsText,
            styles.commandSuggestions,
            styles.activeItemBadge,
            styles.borderColorFocus,
            theme.iconSuccessFill,
            translate,
            StyleUtils,
        ],
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
