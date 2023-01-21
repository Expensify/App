import _ from 'underscore';
import React, {Component} from 'react';
import {FlatList} from 'react-native';
import PropTypes from 'prop-types';
import OptionRowLHN from './OptionRowLHN';
import variables from '../../styles/variables';
import CONST from '../../CONST';

const propTypes = {
    /** Extra styles for the section list container */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Sections for the section list */
    data: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Index for option to focus on */
    focusedIndex: PropTypes.number.isRequired,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)).isRequired,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func.isRequired,

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions: PropTypes.bool,
};

const defaultProps = {
    shouldDisableFocusOptions: false,
};

class LHNOptionsList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
    }

    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * @param {Array} data - This is the same as the data we pass into the component
     * @param {Number} index the current item's index in the set of data
     *
     * @returns {Object}
     */
    getItemLayout(data, index) {
        const optionHeight = this.props.optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
        return {
            length: optionHeight,
            offset: index * optionHeight,
            index,
        };
    }

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     *
     * @return {Component}
     */
    renderItem({item, index}) {
        return (
            <OptionRowLHN
                reportID={item}
                viewMode={this.props.optionMode}
                isFocused={!this.props.shouldDisableFocusOptions && this.props.focusedIndex === index}
                onSelectRow={this.props.onSelectRow}
            />
        );
    }

    render() {
        return (
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={this.props.contentContainerStyles}
                showsVerticalScrollIndicator={false}
                data={this.props.data}
                keyExtractor={item => item}
                stickySectionHeadersEnabled={false}
                renderItem={this.renderItem}
                getItemLayout={this.getItemLayout}
                extraData={this.props.focusedIndex}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                onLayout={this.props.onLayout}
            />
        );
    }
}

LHNOptionsList.propTypes = propTypes;
LHNOptionsList.defaultProps = defaultProps;

export default LHNOptionsList;
