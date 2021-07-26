import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import OptionRow from '../pages/home/sidebar/OptionRow';
import optionPropTypes from './optionPropTypes';
import SectionList from './SectionList';
import Text from './Text';

const propTypes = {
    /** option Background Color */
    optionBackgroundColor: PropTypes.string,

    /** option flexStyle for the options list container */
    listContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    optionHoveredStyle: PropTypes.object,

    /** Extra styles for the section list container */
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({
        /** Title of the section */
        title: PropTypes.string,

        /** The initial index of this section given the total number of options in each section's data array */
        indexOffset: PropTypes.number,

        /** Array of options */
        data: PropTypes.arrayOf(optionPropTypes),

        /** Whether this section should show or not */
        shouldShow: PropTypes.bool,
    })),

    /** Index for option to focus on */
    focusedIndex: PropTypes.number,

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions: PropTypes.bool,

    /** Whether to show headers above each section or not */
    hideSectionHeaders: PropTypes.bool,

    /** Whether to allow option focus or not */
    disableFocusOptions: PropTypes.bool,

    /** A flag to indicate whether to show additional optional states, such as pin and draft icons */
    hideAdditionalOptionStates: PropTypes.bool,

    /** Force the text style to be the unread style on all rows */
    forceTextUnreadStyle: PropTypes.bool,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func,

    /** Optional header message */
    headerMessage: PropTypes.string,

    /** Passed via forwardRef so we can access the SectionList ref */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(SectionList)}),
    ]),

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(['compact', 'default']),

    /** Whether to disable the interactivity of the list's option row(s) */
    disableRowInteractivity: PropTypes.bool,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func,
};

const defaultProps = {
    optionBackgroundColor: undefined,
    optionHoveredStyle: undefined,
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    disableFocusOptions: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    onSelectRow: () => {},
    headerMessage: '',
    innerRef: null,
    showTitleTooltip: false,
    optionMode: undefined,
    disableRowInteractivity: false,
    onLayout: undefined,
};

class OptionsList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.extractKey = this.extractKey.bind(this);
        this.onScrollToIndexFailed = this.onScrollToIndexFailed.bind(this);
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

    /**
     * We must implement this method in order to use the ref.scrollToLocation() method.
     * See: https://reactnative.dev/docs/sectionlist#scrolltolocation
     *
     * @param {Object} info
     */
    onScrollToIndexFailed(info) {
        console.debug(info);
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
                disableRowInteractivity={this.props.disableRowInteractivity}
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
                <View>
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
                    bounces={false}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={[...this.props.contentContainerStyles]}
                    showsVerticalScrollIndicator={false}
                    sections={this.props.sections}
                    keyExtractor={this.extractKey}
                    onScrollToIndexFailed={this.onScrollToIndexFailed}
                    stickySectionHeadersEnabled={false}
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderSectionHeader}
                    extraData={this.props.focusedIndex}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    onLayout={this.props.onLayout}
                />
            </View>
        );
    }
}

OptionsList.propTypes = propTypes;
OptionsList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <OptionsList {...props} innerRef={ref} />
));
