import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function BulletItemRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={styles.flexRow}>
            <Text style={{color: theme.text, fontSize: variables.fontSizeNormal, lineHeight: variables.fontSizeNormalHeight, paddingHorizontal: 8}}>{CONST.DOT_SEPARATOR}</Text>
            <View style={styles.flex1}>
                <TNodeChildrenRenderer tnode={tnode} />
            </View>
        </View>
    );
}

export default BulletItemRenderer;
