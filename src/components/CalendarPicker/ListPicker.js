import React from 'react';
import {
    View, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import Icon from '../Icon';
import Text from '../Text';
import colors from '../../styles/colors';
import themeColors from '../../styles/themes/default';

const ITEM_SEPARATOR = 1;
const ITEM_HEIGHT = 50;
const ITEM_LENGTH = ITEM_HEIGHT + ITEM_SEPARATOR;

const styles = StyleSheet.create({
    root: {
        height: (ITEM_LENGTH * 10) - ITEM_SEPARATOR,
    },
    item: {
        height: ITEM_HEIGHT,
        marginHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    separator: {
        backgroundColor: colors.greenDefaultButton,
        height: 1,
    },
});

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
    }

    getItemLayout(_, index) {
        return {length: ITEM_LENGTH, offset: ITEM_LENGTH * index, index};
    }

    renderItem({item}) {
        return (
            <TouchableOpacity
                style={styles.item}
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
                style={styles.root}
                initialNumToRender={20}
                data={this.props.data}
                initialScrollIndex={this.props.data.indexOf(this.props.selected)}
                renderItem={this.renderItem}
                getItemLayout={this.getItemLayout}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        );
    }
}

ListPicker.propTypes = propTypes;
ListPicker.defaultProps = defaultProps;

export default ListPicker;
