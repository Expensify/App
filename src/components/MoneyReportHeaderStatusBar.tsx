import React, {useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NextStepUtils from '@libs/NextStepUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ReportNextStep from '@src/types/onyx/ReportNextStep';
import Badge from './Badge';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report */
    nextStep: ReportNextStep;
};

function MoneyReportHeaderStatusBar({nextStep}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    const messageContent = useMemo(() => {
        const messageArray = nextStep.message;
        return NextStepUtils.parseMessage(messageArray);
    }, [nextStep.message]);

    const iconComponent = useMemo(() => {
        if (!nextStep.icon) return null;

        const iconMap = {
            hourglass: Expensicons.Hourglass,
            checkmark: Expensicons.Checkmark,
            stopwatch: Expensicons.Stopwatch,
        };

        const IconSrc = iconMap[nextStep.icon];
        return IconSrc ? (
            <Icon
                src={IconSrc}
                height={variables.iconSizeSmall}
                width={variables.iconSizeSmall}
                fill={theme.icon}
            />
        ) : null;
    }, [nextStep.icon, theme.icon]);    

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
            {iconComponent || (
                <Badge
                    text={translate(nextStep.title === CONST.NEXT_STEP.FINISHED ? 'iou.finished' : 'iou.nextStep')}
                    badgeStyles={styles.ml0}
                />
            )}
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={messageContent} />
            </View>
        </View>
    );
}

MoneyReportHeaderStatusBar.displayName = 'MoneyReportHeaderStatusBar';

export default MoneyReportHeaderStatusBar;
