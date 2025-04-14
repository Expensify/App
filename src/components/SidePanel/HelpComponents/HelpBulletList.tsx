import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

type HelpBulletListProps = {
    styles: ThemeStyles;
    items: ReactNode[];
};

function HelpBulletList({items, styles}: HelpBulletListProps) {
    return items.map((item, index) => (
        <View
            // eslint-disable-next-line react/no-array-index-key
            key={`bullet-list-item-${index}`}
            style={[styles.flexRow, styles.alignItemsStart, styles.mt3]}
        >
            <Text style={[styles.textNormal, styles.pr2, styles.userSelectNone]}>{CONST.DOT_SEPARATOR}</Text>
            <View style={[styles.flex1]}>{item}</View>
        </View>
    ));
}

export default HelpBulletList;
