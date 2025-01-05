import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

function DeletedActionRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const actionTypes = Object.values(CONST.REPORT.ACTION_TYPE);
    const action = tnode.attributes.action;
    let translation = action;

    if (actionTypes.some((e) => e === action)) {
        translation = translate(`parentReportAction.${action}` as TranslationPaths);
    }

    const getIcon = () => {
        // This needs to be updated with new icons
        switch (action) {
            case CONST.REPORT.ACTION_TYPE.DELETED_MESSAGE:
                return {icon: Expensicons.ChatBubbleSlash, width: 18, height: 18};
            case CONST.REPORT.ACTION_TYPE.DELETED_EXPENSE:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
            case CONST.REPORT.ACTION_TYPE.DELETED_REPORT:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
            case CONST.REPORT.ACTION_TYPE.DELETED_TASK:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
            case CONST.REPORT.ACTION_TYPE.HIDDEN_MESSAGE:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
            case CONST.REPORT.ACTION_TYPE.REVERSED_TRANSACTION:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
            default:
                return {icon: Expensicons.ReceiptSlash, width: 18, height: 18};
        }
    };

    const icon = getIcon();
    return (
        <View style={[styles.p4, styles.mt1, styles.appBG, styles.border, {borderColor: theme.border}, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap2]}>
            <Icon
                width={icon.height}
                height={icon.width}
                fill={theme.icon}
                src={icon.icon}
            />
            <Text style={(styles.textLabelSupporting, styles.textStrong)}>{translation}</Text>
        </View>
    );
}

DeletedActionRenderer.displayName = 'DeletedActionRenderer';

export default DeletedActionRenderer;
