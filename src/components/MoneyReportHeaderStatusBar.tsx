import React, {useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@hooks/useTheme';
import * as NextStepUtils from '@libs/NextStepUtils';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import type ReportNextStep from '@src/types/onyx/ReportNextStep';
import Badge from './Badge';
import RenderHTML from './RenderHTML';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

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

    const HOURGLASS_ICON = 'hourglass';

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
            {nextStep?.icon && nextStep.icon === HOURGLASS_ICON ? (
                <Icon
                    src={Expensicons.Hourglass}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            ) : (
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
