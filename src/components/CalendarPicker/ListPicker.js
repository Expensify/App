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

const Separator = () => <View style={styles.separator} />;

const propTypes = {
    selected: PropTypes.number,
    format: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
};

const defaultProps = {
    format: null,
    selected: null,
};

const ListPicker = (props) => {
    const ref = React.useRef(null);

    const renderItem = React.useCallback(({item}) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => props.onSelect(item)}
        >
            <Text>{props.format ? props.format(item) : item}</Text>
            {props.selected === item && <Icon src={Expensicons.Checkmark} fill={themeColors.checkBox} height={20} width={20} />}
        </TouchableOpacity>
    ), []);

    const getItemLayout = React.useCallback((_, index) => ({length: ITEM_LENGTH, offset: ITEM_LENGTH * index, index}), []);

    return (
        <FlatList
            ref={ref}
            style={styles.root}
            initialNumToRender={20}
            data={props.data}
            initialScrollIndex={props.data.indexOf(props.selected)}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            ItemSeparatorComponent={Separator}
        />
    );
};

ListPicker.displayName = 'ListPicker';
ListPicker.propTypes = propTypes;
ListPicker.defaultProps = defaultProps;

export default ListPicker;
