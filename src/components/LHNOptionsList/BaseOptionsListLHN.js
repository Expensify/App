import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import OptionRowLHN from './OptionRowLHN';
import variables from '../../styles/variables';
import {propTypes as optionsListPropTypes, defaultProps as optionsListDefaultPropTypes} from './optionsListPropTypesLHN';
import CONST from '../../CONST';

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
    ...optionsListDefaultPropTypes,
};

class BaseOptionsListLHN extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
        this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 95};
        this.didLayout = false;
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.focusedIndex !== this.props.focusedIndex) {
            return true;
        }

        // @TODO: remove this prop and the one below since they are not used anymore
        if (nextProps.headerMessage !== this.props.headerMessage) {
            return true;
        }

        if (!_.isEqual(nextProps.sections, this.props.data)) {
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
                    ref={this.props.innerRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={this.props.keyboardDismissMode}
                    onScrollBeginDrag={this.props.onScrollBeginDrag}
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

BaseOptionsListLHN.propTypes = propTypes;
BaseOptionsListLHN.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseOptionsListLHN {...props} innerRef={ref} />
));
