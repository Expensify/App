import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import {parseMessage} from '@libs/NextStepUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ReportNextStepDeprecated from '@src/types/onyx/ReportNextStepDeprecated';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report (deprecated old format) */
    nextStep: ReportNextStepDeprecated | undefined;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStep}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Stopwatch'] as const);
    const iconMap: IconMap = useMemo(
        () => ({
            [CONST.NEXT_STEP.ICONS.HOURGLASS]: expensifyIcons.Hourglass,
            [CONST.NEXT_STEP.ICONS.CHECKMARK]: Expensicons.Checkmark,
            [CONST.NEXT_STEP.ICONS.STOPWATCH]: expensifyIcons.Stopwatch,
        }),
        [expensifyIcons],
    );
    const messageContent = useMemo(() => {
        const messageArray = nextStep?.message;
        return parseMessage(messageArray);
    }, [nextStep?.message]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? expensifyIcons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={messageContent} />
            </View>
        </View>
    );
}

MoneyReportHeaderStatusBar.displayName = 'MoneyReportHeaderStatusBar';

export default MoneyReportHeaderStatusBar;
