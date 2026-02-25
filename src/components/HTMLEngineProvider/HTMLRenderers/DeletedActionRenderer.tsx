import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function DeletedActionRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowsLeftRight', 'EyeDisabled', 'Trashcan'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const htmlAttribs = tnode.attributes;

    const reversedTransactionValue = htmlAttribs[CONST.REVERSED_TRANSACTION_ATTRIBUTE];
    const hiddenMessageValue = htmlAttribs[CONST.HIDDEN_MESSAGE_ATTRIBUTE];

    const getIcon = () => {
        if (reversedTransactionValue === 'true') {
            return icons.ArrowsLeftRight;
        }
        if (hiddenMessageValue === 'true') {
            return icons.EyeDisabled;
        }
        return icons.Trashcan;
    };

    return (
        <View style={[styles.p4, styles.mt1, styles.appBG, styles.border, {borderColor: theme.border}, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap2]}>
            <Icon
                width={variables.iconSizeMedium}
                height={variables.iconSizeMedium}
                fill={theme.icon}
                src={getIcon()}
            />
            <TNodeChildrenRenderer
                tnode={tnode}
                renderChild={(props) => {
                    const firstChild = props?.childTnode?.children?.at(0);
                    const data = firstChild && 'data' in firstChild ? firstChild.data : null;

                    if (typeof data === 'string') {
                        return (
                            <Text
                                key={data}
                                style={(styles.textLabelSupporting, styles.textStrong)}
                            >
                                {data}
                            </Text>
                        );
                    }
                    return props.childElement;
                }}
            />
        </View>
    );
}

export default DeletedActionRenderer;
