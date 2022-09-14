import _ from 'underscore';
import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
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
};

class LHNOptionsList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
        this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 95};
        this.didLayout = false;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.focusedIndex !== this.props.focusedIndex;
    }

    onViewableItemsChanged() {
        if (this.didLayout || !this.props.onLayout) {
            return;
        }

        this.didLayout = true;
        this.props.onLayout();
    }

    /**
     * This function is used to compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to items outside the virtual render window of the SectionList.
     *
     * @TODO: we can probably remove this method entirely since we don't need to scroll to items outside the virtual render window (was only used for arrow key navigation)
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
                isFocused={this.props.focusedIndex === index}
                onSelectRow={this.props.onSelectRow}
            />
        );
    }

    render() {
        return (
            <View style={[styles.flex1]}>
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
                    viewabilityConfig={this.viewabilityConfig}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                />
            </View>
        );
    }
}

LHNOptionsList.propTypes = propTypes;

export default LHNOptionsList;
