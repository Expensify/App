import _ from 'underscore';
import React, {forwardRef} from 'react';
import {View, SectionList, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import KeyboardSpacer from './KeyboardSpacer';
import OptionRow from '../pages/home/sidebar/OptionRow';
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

    // A flag to indicate wheter the option is on the RightDockedModal or not
    isOnRightDockedModal: PropTypes.bool,

    // Callback to fire when a row is selected
    onSelectRow: PropTypes.func,

    // Optional header title
    headerTitle: PropTypes.string,

    // Optional header message
    headerMessage: PropTypes.string,

    // Passed via forwardRef so we can access the SectionList ref
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(SectionList)}),
    ]),
};

const defaultProps = {
    contentContainerStyles: [],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    isOnRightDockedModal: false,
    onSelectRow: () => {},
    headerMessage: '',
    headerTitle: '',
    innerRef: null,
};

const OptionsList = ({
    contentContainerStyles,
    sections,
    focusedIndex,
    selectedOptions,
    canSelectMultipleOptions,
    hideSectionHeaders,
    isOnRightDockedModal,
    onSelectRow,
    headerMessage,
    headerTitle,
    innerRef,
}) => (
    <View style={[styles.flex1]}>
        {headerMessage ? (
            <View style={[styles.ph5, styles.pb5]}>
                {headerTitle ? (
                    <Text style={[styles.h4, styles.mb1]}>
                        {headerTitle}
                    </Text>
                ) : null}

                <Text style={[styles.textLabel, styles.colorMuted]}>
                    {headerMessage}
                </Text>
            </View>
        ) : null}
        <SectionList
            ref={innerRef}
            bounces={false}
            indicatorStyle="white"
            keyboardShouldPersistTaps="always"
            contentContainerStyle={[...contentContainerStyles]}
            showsVerticalScrollIndicator={false}
            sections={sections}
            keyExtractor={option => option.keyForList}
            initialNumToRender={500}
            onScrollToIndexFailed={error => console.debug(error)}
            renderItem={({item, index, section}) => (
                <OptionRow
                    option={item}
                    optionIsFocused={!isOnRightDockedModal && focusedIndex === (index + section.indexOffset)}
                    onSelectRow={onSelectRow}
                    isSelected={Boolean(_.find(selectedOptions, option => option.login === item.login))}
                    showSelectedState={canSelectMultipleOptions}
                    isOnRightDockedModal={isOnRightDockedModal}
                />
            )}
            renderSectionHeader={({section: {title, shouldShow}}) => {
                if (title && shouldShow && !hideSectionHeaders) {
                    return (
                        <View>
                            <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                                {title}
                            </Text>
                        </View>
                    );
                }

                return <View />;
            }}
            extraData={focusedIndex}
        />
        <KeyboardSpacer />
    </View>
);

OptionsList.propTypes = propTypes;
OptionsList.displayName = 'OptionsList';
OptionsList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <OptionsList {...props} innerRef={ref} />
));
