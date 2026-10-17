import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {buildNextStepMessage} from '@libs/NextStepUtils';
import type {ReportNextStepWithContext} from '@libs/NextStepUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React, {useMemo} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    nextStepWithContext: ReportNextStepWithContext;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;

function MoneyReportHeaderStatusBar({nextStepWithContext}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Checkmark', 'Stopwatch', 'Box']);
    const iconMap: IconMap = useMemo(
        () => ({
            [CONST.NEXT_STEP.ICONS.HOURGLASS]: icons.Hourglass,
            [CONST.NEXT_STEP.ICONS.CHECKMARK]: icons.Checkmark,
            [CONST.NEXT_STEP.ICONS.STOPWATCH]: icons.Stopwatch,
            [CONST.NEXT_STEP.ICONS.BOX]: icons.Box,
        }),
        [icons],
    );
    const {nextStep, nextStepContext} = nextStepWithContext;
    const messageContent = useMemo(
        () => buildNextStepMessage(nextStep, nextStepContext, translate, dateFnsLocale, formatPhoneNumber),
        [nextStep, nextStepContext, translate, dateFnsLocale, formatPhoneNumber],
    );

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={(nextStep?.icon && iconMap?.[nextStep.icon]) ?? icons.Hourglass}
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

export default MoneyReportHeaderStatusBar;
