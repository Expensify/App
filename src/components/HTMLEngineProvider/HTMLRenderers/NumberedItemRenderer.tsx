import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {TNode} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const markerStyles = StyleSheet.create({
    marker: {
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.fontSizeNormalHeight,
        minWidth: 32,
        textAlign: 'right',
        paddingHorizontal: 8,
    },
});

function NumberedItemRenderer({tnode, index}: {tnode: TNode; index: number}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.w100]}>
            <Text style={[markerStyles.marker, {color: theme.text}]}>{`${index}.`}</Text>
            <View style={styles.flex1}>
                <TNodeChildrenRenderer tnode={tnode} />
            </View>
        </View>
    );
}

export default NumberedItemRenderer;
