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

const styles = StyleSheet.create({
    root: {
        height: 500,
    },
    item: {
        height: 50,
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
    ));

    const getItemLayout = React.useCallback((_, index) => ({length: 51, offset: 51 * index, index}));

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
ListPicker.propTypes = {
    selected: PropTypes.number,
    format: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
};

ListPicker.defaultProps = {
    format: null,
    selected: null,
};

export default ListPicker;
