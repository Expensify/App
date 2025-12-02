import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpNumberedListProps = {
    styles: ThemeStyles;
    items: ReactNode[];
};

function HelpNumberedList({items, styles}: HelpNumberedListProps) {
    return items.map((item, index) => (
        <View
            // eslint-disable-next-line react/no-array-index-key
            key={`numbered-list-item-${index}`}
            style={[styles.flexRow, styles.alignItemsStart, styles.mt3]}
        >
            <Text style={[styles.textNormal, styles.pr2, styles.userSelectNone]}>{`${index + 1}.`}</Text>
            <Text style={[styles.flex1]}>{item}</Text>
        </View>
    ));
}

export default HelpNumberedList;
