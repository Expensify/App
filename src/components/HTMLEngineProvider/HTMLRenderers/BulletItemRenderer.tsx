import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {fontScale, lineHeightScale} from '@styles/typography';

import CONST from '@src/CONST';

import type {TNode} from 'react-native-render-html';

import React from 'react';
import {View} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';

function BulletItemRenderer({tnode}: {tnode: TNode}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.w100]}>
            <Text style={{color: theme.text, fontSize: fontScale.text, lineHeight: lineHeightScale.text, paddingHorizontal: 8}}>{CONST.DOT_SEPARATOR}</Text>
            <View style={styles.flex1}>
                <TNodeChildrenRenderer tnode={tnode} />
            </View>
        </View>
    );
}

export default BulletItemRenderer;
