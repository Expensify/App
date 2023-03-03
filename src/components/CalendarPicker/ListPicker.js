import React from 'react';
import {
    View, TouchableOpacity, FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import Icon from '../Icon';
import Text from '../Text';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';

const ITEM_SEPARATOR = 1;
const ITEM_HEIGHT = 50;
const ITEM_LENGTH = ITEM_HEIGHT + ITEM_SEPARATOR;

const propTypes = {
    /** Value selected from the list */
    selected: PropTypes.number,

    /** Function allowing to pass custom names for items */
    format: PropTypes.func,

    /** Function to call when value from the list is selected */
    onSelect: PropTypes.func.isRequired,

    /** List of the elements */
    data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
};

const defaultProps = {
    format: null,
    selected: null,
};

class ListPicker extends React.Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
    }

    getItemLayout(_, index) {
        return {length: ITEM_LENGTH, offset: ITEM_LENGTH * index, index};
    }

    renderItem({item}) {
        return (
            <TouchableOpacity
                style={[styles.listPickerItem(ITEM_HEIGHT), styles.mh1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}
                onPress={() => this.props.onSelect(item)}
            >
                <Text>{this.props.format ? this.props.format(item) : item}</Text>
                {this.props.selected === item && <Icon src={Expensicons.Checkmark} fill={themeColors.checkBox} height={20} width={20} />}
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <FlatList
                style={styles.listPicker(ITEM_HEIGHT, ITEM_SEPARATOR)}
                initialNumToRender={20}
                data={this.props.data}
                initialScrollIndex={this.props.data.indexOf(this.props.selected)}
                renderItem={this.renderItem}
                getItemLayout={this.getItemLayout}
                ItemSeparatorComponent={() => <View style={styles.listPickerSeparator} />}
            />
        );
    }
}

ListPicker.propTypes = propTypes;
ListPicker.defaultProps = defaultProps;

export default ListPicker;
