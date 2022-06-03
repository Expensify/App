import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import Log from '../../libs/Log';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import OptionRow from '../OptionRow';
import SectionList from '../SectionList';
import Text from '../Text';
import {propTypes as optionsListPropTypes, defaultProps as optionsListDefaultProps} from './optionsListPropTypes';

const propTypes = {
    /** Determines whether the keyboard gets dismissed in response to a drag */
    keyboardDismissMode: PropTypes.string,

    /** Called when the user begins to drag the scroll view */
    onScrollBeginDrag: PropTypes.func,

    ...optionsListPropTypes,
};

const defaultProps = {
    keyboardDismissMode: 'none',
    onScrollBeginDrag: () => {},
    ...optionsListDefaultProps,
};

class BaseOptionsList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.extractKey = this.extractKey.bind(this);
        this.onScrollToIndexFailed = this.onScrollToIndexFailed.bind(this);
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
        this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 95};
        this.didLayout = false;
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.focusedIndex !== this.props.focusedIndex) {
            return true;
        }

        if (nextProps.selectedOptions.length !== this.props.selectedOptions.length) {
            return true;
        }

        if (nextProps.headerMessage !== this.props.headerMessage) {
            return true;
        }

        if (!_.isEqual(nextProps.sections, this.props.sections)) {
            return true;
        }

        return false;
    }

    onViewableItemsChanged() {
        if (this.didLayout || !this.props.onLayout) {
            return;
        }

        this.didLayout = true;
        this.props.onLayout();
    }

    /**
     * We must implement this method in order to use the ref.scrollToLocation() method.
     * See: https://reactnative.dev/docs/sectionlist#scrolltolocation
     *
     * @param {Object} info
     */
    onScrollToIndexFailed(info) {
        Log.hmmm('[OptionsList] scrollToIndex failed', info);
    }

    /**
     * This function is used to deterministically compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to any item in the list.
     * If we don't, then we can only scroll to items in the virtual render window of the SectionList.
     *
     * @param {Array} data - This is the same as the data we pass into the component, i.e: all the non-empty sections
     * @param {Number} index - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     *
     * @returns {Object}
     * @note This implementation assumes that the list does not contain any headers or footers, because this component does not use those features at the time of writing.
     *       If you want to add a header or footer to the SectionList, you'll need to adjust this function accordingly.
     */
    getItemLayout(data, index) {
        const optionHeight = this.props.optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;

        let offset = 0;
        let length = 0;
        for (let i = 0; i < data.length; i++) {
            const section = data[i];
            const sectionHeaderHeight = section.title && !this.props.hideSectionHeaders ? variables.optionsListSectionHeaderHeight : 0;

            // The indexOffset of our section is the sum of the lengths of previous sections' data arrays.
            // To correct it, in the context of the flat array described above, we need to account for the section headers of all previous sections, and the list header.
            const correctedIndexOffset = section.indexOffset + i + 1;

            if (correctedIndexOffset > index) {
                break;
            }

            if (correctedIndexOffset === index) {
                // This means that the index we're looking for is a section header.
                length = sectionHeaderHeight;
            } else {
                // Otherwise, we are looking for something past this section's header, so we add its height to the offset
                offset += sectionHeaderHeight;

                // Also add to the offset the height of any other option rows in this section (leading up to the index we are looking for)
                offset += (Math.min(correctedIndexOffset + section.data.length, index - 1) - correctedIndexOffset) * optionHeight;
            }
        }

        length = length || optionHeight;

        return {
            length,
            offset,
            index,
        };
    }

    /**
     * Returns the key used by the list
     * @param {Object} option
     * @return {String}
     */
    extractKey(option) {
        return option.keyForList;
    }

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @param {Object} params.section
     *
     * @return {Component}
     */
    renderItem({item, index, section}) {
        return (
            <OptionRow
                option={item}
                mode={this.props.optionMode}
                showTitleTooltip={this.props.showTitleTooltip}
                backgroundColor={this.props.optionBackgroundColor}
                hoverStyle={this.props.optionHoveredStyle}
                optionIsFocused={!this.props.disableFocusOptions
                        && this.props.focusedIndex === (index + section.indexOffset)}
                onSelectRow={this.props.onSelectRow}
                isSelected={Boolean(_.find(this.props.selectedOptions, option => option.login === item.login))}
                showSelectedState={this.props.canSelectMultipleOptions}
                hideAdditionalOptionStates={this.props.hideAdditionalOptionStates}
                forceTextUnreadStyle={this.props.forceTextUnreadStyle}
                isDisabled={this.props.isDisabled || section.isDisabled}
            />
        );
    }

    /**
     * Function which renders a section header component
     *
     * @param {Object} params
     * @param {Object} params.section
     * @param {String} params.section.title
     * @param {Boolean} params.section.shouldShow
     *
     * @return {Component}
     */
    renderSectionHeader({section: {title, shouldShow}}) {
        if (title && shouldShow && !this.props.hideSectionHeaders) {
            return (

                // Warning: this optionsListSectionHeader style is brittle – it's computed manually from the dynamic styles in the text node below.
                // We do this only so that we can reference the height in getItemLayout
                // 11pt font + 20px padding renders to 54px height
                <View style={styles.optionsListSectionHeader}>
                    <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading, styles.textUppercase]}>
                        {title}
                    </Text>
                </View>
            );
        }

        return <View />;
    }

    render() {
        return (
            <View style={this.props.listContainerStyles}>
                {this.props.headerMessage ? (
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabel, styles.colorMuted]}>
                            {this.props.headerMessage}
                        </Text>
                    </View>
                ) : null}
                <SectionList
                    ref={this.props.innerRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={this.props.keyboardDismissMode}
                    onScrollBeginDrag={this.props.onScrollBeginDrag}
                    contentContainerStyle={this.props.contentContainerStyles}
                    showsVerticalScrollIndicator={false}
                    sections={_.filter(this.props.sections, section => section.data.length !== 0)}
                    keyExtractor={this.extractKey}
                    onScrollToIndexFailed={this.onScrollToIndexFailed}
                    stickySectionHeadersEnabled={false}
                    renderItem={this.renderItem}
                    getItemLayout={this.getItemLayout}
                    renderSectionHeader={this.renderSectionHeader}
                    extraData={this.props.focusedIndex}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    viewabilityConfig={this.viewabilityConfig}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                />
            </View>
        );
    }
}

BaseOptionsList.propTypes = propTypes;
BaseOptionsList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseOptionsList {...props} innerRef={ref} />
));
