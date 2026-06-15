import type {TNode} from '@native-html/render';
import {TNodeChildrenRenderer} from '@native-html/render';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type NumberedItemRendererProps = {tnode: TNode; index: number};

function NumberedItemRenderer({tnode, index}: NumberedItemRendererProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.w100]}>
            <Text style={styles.numberedListItemMarker}>{`${index}.`}</Text>
            <View style={styles.flex1}>
                <TNodeChildrenRenderer tnode={tnode} />
            </View>
        </View>
    );
}

export default NumberedItemRenderer;
