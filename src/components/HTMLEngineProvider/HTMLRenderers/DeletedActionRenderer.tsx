import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function DeletedActionRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.p4, styles.mt1, styles.appBG, styles.border, {borderColor: theme.border}, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap2]}>
            <Icon
                width={variables.iconSizeMedium}
                height={variables.iconSizeMedium}
                fill={theme.icon}
                src={Expensicons.Trashcan}
            />
            <TNodeChildrenRenderer
                tnode={tnode}
                renderChild={(props) => {
                    const firstChild = props?.childTnode?.children?.at(0);
                    const data = firstChild && 'data' in firstChild ? firstChild.data : null;

                    if (typeof data === 'string') {
                        return <Text style={(styles.textLabelSupporting, styles.textStrong)}>{data}</Text>;
                    }
                    return props.childElement;
                }}
            />
        </View>
    );
}

DeletedActionRenderer.displayName = 'DeletedActionRenderer';

export default DeletedActionRenderer;
