import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildNextStepMessage, parseMessage} from '@libs/NextStepUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportNextStepDeprecated from '@src/types/onyx/ReportNextStepDeprecated';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report (deprecated old format) */
    nextStepDeprecated: ReportNextStepDeprecated;

    /** The next step for the report */
    nextStep: ReportNextStep | undefined;
};

type IconName = ValueOf<typeof CONST.NEXT_STEP.ICONS>;
type IconMap = Record<IconName, IconAsset>;
const iconMap: IconMap = {
    [CONST.NEXT_STEP.ICONS.HOURGLASS]: Expensicons.Hourglass,
    [CONST.NEXT_STEP.ICONS.CHECKMARK]: Expensicons.Checkmark,
    [CONST.NEXT_STEP.ICONS.STOPWATCH]: Expensicons.Stopwatch,
};

function MoneyReportHeaderStatusBar({nextStep, nextStepDeprecated}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {message, icon} = useMemo(() => {
        if (!nextStep) {
            return {
                // This can be removed after NextStep (simplified format) is fully migrated
                // eslint-disable-next-line deprecation/deprecation
                message: parseMessage(nextStepDeprecated.message),
                icon: iconMap[nextStepDeprecated.icon] || Expensicons.Hourglass,
            };
        }

        return {
            message: buildNextStepMessage(nextStep, translate),
            icon: iconMap[nextStep.icon],
        };
    }, [nextStep, nextStepDeprecated, translate]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Icon
                    src={icon}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={message} />
            </View>
        </View>
    );
}

MoneyReportHeaderStatusBar.displayName = 'MoneyReportHeaderStatusBar';

export default MoneyReportHeaderStatusBar;
