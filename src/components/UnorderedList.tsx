import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type UnorderedListProps = {
    /** An array of strings to display as an unordered list */
    items?: string[];
};

function UnorderedList({items = []}: UnorderedListProps) {
    const styles = useThemeStyles();

    return items.map((itemText) => (
        <View
            key={itemText}
            style={[styles.flexRow, styles.alignItemsStart, styles.ml2]}
        >
            <Text style={[styles.mr2]}>{'\u2022'}</Text>
            <Text>{itemText}</Text>
        </View>
    ));
}

UnorderedList.displayName = 'UnorderedList';
export default UnorderedList;
