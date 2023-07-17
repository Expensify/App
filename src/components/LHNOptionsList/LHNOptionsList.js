import PropTypes from 'prop-types';
import React from 'react';
import {FlatList, View} from 'react-native';
import _ from 'underscore';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import OptionRowLHNData from './OptionRowLHNData';
import variables from '../../styles/variables';

const propTypes = {
    /** Extra styles for the section list container */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Sections for the section list */
    data: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)).isRequired,

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions: PropTypes.bool,
};

const defaultProps = {
    shouldDisableFocusOptions: false,
};

function LHNOptionsList({contentContainerStyles, data, onSelectRow, optionMode, shouldDisableFocusOptions}) {
    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * @param {Array} itemData - This is the same as the data we pass into the component
     * @param {Number} index the current item's index in the set of data
     *
     * @returns {Object}
     */
    const getItemLayout = (itemData, index) => {
        const optionHeight = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
        return {
            length: optionHeight,
            offset: index * optionHeight,
            index,
        };
    };

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {Component}
     */
    const renderItem = ({item}) => (
        <OptionRowLHNData
            reportID={item}
            viewMode={optionMode}
            shouldDisableFocusOptions={shouldDisableFocusOptions}
            onSelectRow={onSelectRow}
        />
    );

    return (
        <View style={[styles.flex1]}>
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                showsVerticalScrollIndicator={false}
                data={data}
                keyExtractor={(item) => item}
                stickySectionHeadersEnabled={false}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </View>
    );
}

LHNOptionsList.propTypes = propTypes;
LHNOptionsList.defaultProps = defaultProps;

export default LHNOptionsList;
