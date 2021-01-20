import _ from 'underscore';
import React from 'react';
import {View, SectionList} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import KeyboardSpacer from './KeyboardSpacer';
import ChatLinkRow from '../pages/home/sidebar/ChatLinkRow';

const propTypes = {
    /** Extra styles for the section list container */
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        indexOffset: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({})),
        shouldShow: PropTypes.bool,
    })),

    /** Index for option to focus on */
    focusedIndex: PropTypes.number,

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(PropTypes.shape({
        // Report and Personal Detail option
    })),

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions: PropTypes.bool,

    /** Whether to show headers above each section or not */
    hideSectionHeaders: PropTypes.bool,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func,
};

const defaultProps = {
    contentContainerStyles: [],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    onSelectRow: () => {},
};

const ReportList = ({
    contentContainerStyles,
    sections,
    focusedIndex,
    selectedOptions,
    canSelectMultipleOptions,
    hideSectionHeaders,
    onSelectRow,
}) => (
    <View style={[styles.flex1]}>
        <SectionList
            bounces={false}
            indicatorStyle="white"
            keyboardShouldPersistTaps="always"
            contentContainerStyle={[styles.flex1, ...contentContainerStyles]}
            showsVerticalScrollIndicator={false}
            sections={sections}
            keyExtractor={option => option.keyForList}
            renderItem={({item, index, section}) => (
                <ChatLinkRow
                    option={item}
                    optionIsFocused={focusedIndex === (index + section.indexOffset)}
                    onSelectRow={onSelectRow}
                    isSelected={_.find(selectedOptions, option => option.login === item.login)}
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
            ListFooterComponent={View}
            ListFooterComponentStyle={[styles.p1]}
        />
        <KeyboardSpacer />
    </View>
);

ReportList.propTypes = propTypes;
ReportList.displayName = 'ReportList';
ReportList.defaultProps = defaultProps;
export default ReportList;
