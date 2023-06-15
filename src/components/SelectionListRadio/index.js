import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import SectionList from '../SectionList';
import Text from '../Text';
import styles from '../../styles/styles';
import Icon from '../Icon';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import TextInput from '../TextInput';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import CONST from '../../CONST';
import KeyboardShortcut from '../../libs/KeyboardShortcut';

const propTypes = {
    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,

    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    textInputLabel: PropTypes.string,
    textInputPlaceholder: PropTypes.string,
    textInputValue: PropTypes.string,
    onChangeText: PropTypes.func,
    initiallyFocusedOptionKey: PropTypes.string,
};

const defaultProps = {
    onSelectRow: () => {},
    textInputLabel: '',
    textInputPlaceholder: '',
    textInputValue: '',
    onChangeText: () => {},
    initiallyFocusedOptionKey: '',
};

const SelectionListRadio = (props) => {
    const pressableRef = useRef(null);
    const textInputRef = useRef(null);
    const shouldShowTextInput = Boolean(props.textInputLabel) && Boolean(props.textInputValue) && Boolean(props.onChangeText);

    const flattenedSections = useMemo(() => {
        const allOptions = [];
        const disabledOptionsIndexes = [];
        let index = 0;

        _.each(props.sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });

                if (section.isDisabled || option.isDisabled) {
                    disabledOptionsIndexes.push(index);
                }

                index += 1;
            });
        });

        return {
            allOptions,
            disabledOptionsIndexes,
        };
    }, [props.sections]);

    const [focusedIndex, setFocusedIndex] = React.useState(() => {
        const defaultIndex = 0;

        const indexOfInitiallyFocusedOption = _.findIndex(flattenedSections.allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    });

    const renderItem = ({item, index, section}) => {
        const isSelected = Boolean(item.customIcon);
        const isFocused = focusedIndex === index + section.indexOffset;

        return (
            <PressableWithFeedback
                ref={pressableRef}
                onPress={() => props.onSelectRow(item)}
                accessibilityLabel={item.text}
                accessibilityRole="button"
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
            >
                <View style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.optionRow, styles.borderTop, isFocused && styles.sidebarLinkActive]}>
                    <Text style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.boldStyle && styles.sidebarLinkTextBold]}>
                        {item.text}
                    </Text>

                    {isSelected && (
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessible={false}
                        >
                            <View>
                                <Icon
                                    src={lodashGet(item, 'customIcon.src', '')}
                                    fill={lodashGet(item, 'customIcon.color')}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </PressableWithFeedback>
        );
    };

    useEffect(() => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const unsubscribeEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            () => {
                const focusedOption = flattenedSections.allOptions[focusedIndex];

                if (!focusedOption) {
                    return;
                }

                props.onSelectRow(focusedOption);
            },
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !flattenedSections.allOptions[focusedIndex],
        );

        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        const unsubscribeCTRLEnter = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                const focusedOption = flattenedSections.allOptions[focusedIndex];

                if (!focusedOption) {
                    return;
                }

                props.onSelectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );

        return () => {
            if (unsubscribeEnter) {
                unsubscribeEnter();
            }

            if (unsubscribeCTRLEnter) {
                unsubscribeCTRLEnter();
            }
        };
    }, [flattenedSections.allOptions, focusedIndex, props]);

    return (
        <ArrowKeyFocusManager
            disabledIndexes={flattenedSections.disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={flattenedSections.allOptions.length - 1}
            onFocusedIndexChanged={setFocusedIndex}
        >
            <View style={[styles.flex1]}>
                {shouldShowTextInput && (
                    <View style={[styles.ph5, styles.pv5]}>
                        <TextInput
                            ref={textInputRef}
                            value={props.textInputValue}
                            label={props.textInputLabel}
                            onChangeText={props.onChangeText}
                            placeholder={props.textInputPlaceholder}
                            selectTextOnFocus
                        />
                    </View>
                )}

                <SectionList
                    sections={props.sections}
                    renderItem={renderItem}
                />
            </View>
        </ArrowKeyFocusManager>
    );
};

SelectionListRadio.displayName = 'SelectionListRadio';
SelectionListRadio.propTypes = propTypes;
SelectionListRadio.defaultProps = defaultProps;

export default SelectionListRadio;
