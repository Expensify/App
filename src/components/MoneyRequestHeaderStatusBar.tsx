import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactElement, ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import CaretWrapper from './CaretWrapper';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Icon displayed in badge */
    icon: ReactNode;

    /** Banner Description */
    description: string | ReactElement;

    shouldStyleFlexGrow?: boolean;

    /** Opens the report history. When provided, the status bar becomes pressable and shows a chevron */
    onPress?: () => void;
};

function MoneyRequestHeaderStatusBar({icon, description, shouldStyleFlexGrow = true, onPress}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const message = (
        <View style={[styles.flexShrink1]}>
            <Text style={[styles.textLabelSupporting]}>{description}</Text>
        </View>
    );

    const content = (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <View style={styles.mr2}>{icon}</View>
            {onPress ? <CaretWrapper style={styles.flexShrink1}>{message}</CaretWrapper> : message}
        </View>
    );

    if (!onPress) {
        return content;
    }

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={translate('reportHistoryPage.title')}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REPORT_HEADER_STATUS_BAR}
        >
            {content}
        </PressableWithFeedback>
    );
}

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};
