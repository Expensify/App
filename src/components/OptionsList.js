import _ from 'underscore';
import React from 'react';
import {View, SectionList, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import KeyboardSpacer from './KeyboardSpacer';
import ChatLinkRow from '../pages/home/sidebar/ChatLinkRow';
import optionPropTypes from './optionPropTypes';

const propTypes = {
    // Extra styles for the section list container
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object),

    // Sections for the section list
    sections: PropTypes.arrayOf(PropTypes.shape({
        // Title of the section
        title: PropTypes.string,

        // The initial index of this section given the total number of options in each section's data array
        indexOffset: PropTypes.number,

        // Array of options
        data: PropTypes.arrayOf(optionPropTypes),

        // Whether this section should show or not
        shouldShow: PropTypes.bool,
    })),

    // Index for option to focus on
    focusedIndex: PropTypes.number,

    // Array of already selected options
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    // Whether we can select multiple options or not
    canSelectMultipleOptions: PropTypes.bool,

    // Whether to show headers above each section or not
    hideSectionHeaders: PropTypes.bool,

    // Callback to fire when a row is selected
    onSelectRow: PropTypes.func,

    // Optional header title
    headerTitle: PropTypes.string,

    // Optional header message
    headerMessage: PropTypes.string,
};

const defaultProps = {
    contentContainerStyles: [],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    onSelectRow: () => {},
    headerMessage: '',
    headerTitle: '',
};

const OptionsList = ({
    contentContainerStyles,
    sections,
    focusedIndex,
    selectedOptions,
    canSelectMultipleOptions,
    hideSectionHeaders,
    onSelectRow,
    headerMessage,
    headerTitle,
}) => (
    <View style={[styles.flex1]}>
        {headerMessage ? (
            <View style={[styles.p3]}>
                {headerTitle ? (
                    <Text style={[styles.h4, styles.mb1]}>
                        {headerTitle}
                    </Text>
                ) : null}

                <Text style={[styles.textLabel]}>
                    {headerMessage}
                </Text>
            </View>
        ) : null}
        <SectionList
            bounces={false}
            indicatorStyle="white"
            keyboardShouldPersistTaps="always"
            contentContainerStyle={[...contentContainerStyles]}
            showsVerticalScrollIndicator={false}
            sections={sections}
            keyExtractor={option => option.keyForList}
            initialNumToRender={200}
            renderItem={({item, index, section}) => (
                <ChatLinkRow
                    option={item}
                    optionIsFocused={focusedIndex === (index + section.indexOffset)}
                    onSelectRow={onSelectRow}
                    isSelected={Boolean(_.find(selectedOptions, option => option.login === item.login))}
                    showSelectedState={canSelectMultipleOptions}
                />
            )}
            renderSectionHeader={({section: {title, shouldShow}}) => {
                if (title && shouldShow && !hideSectionHeaders) {
                    return (
                        <View>
                            <Text style={styles.subHeader}>
                                {title}
                            </Text>
                        </View>
                    );
                }

                return <View style={styles.mt1} />;
            }}
            extraData={focusedIndex}
        />
        <KeyboardSpacer />
    </View>
);

OptionsList.propTypes = propTypes;
OptionsList.displayName = 'OptionsList';
OptionsList.defaultProps = defaultProps;
export default OptionsList;
