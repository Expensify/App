import React, {useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NextStepUtils from '@libs/NextStepUtils';
import CONST from '@src/CONST';
import type ReportNextStep from '@src/types/onyx/ReportNextStep';
import Badge from './Badge';
import RenderHTML from './RenderHTML';

type MoneyReportHeaderStatusBarProps = {
    /** The next step for the report */
    nextStep: ReportNextStep;
};

function MoneyReportHeaderStatusBar({nextStep}: MoneyReportHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const messageContent = useMemo(() => {
        const messageArray = nextStep.message;
        return NextStepUtils.parseMessage(messageArray);
    }, [nextStep.message]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <View style={[styles.mr3]}>
                <Badge
                    text={translate(nextStep.title === CONST.NEXT_STEP.FINISHED ? 'iou.finished' : 'iou.nextStep')}
                    badgeStyles={styles.ml0}
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
