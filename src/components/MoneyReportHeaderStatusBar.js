import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NextStepUtils from '@libs/NextStepUtils';
import nextStepPropTypes from '@pages/nextStepPropTypes';
import CONST from '@src/CONST';
import RenderHTML from './RenderHTML';

const propTypes = {
    /** The next step for the report */
    nextStep: nextStepPropTypes,
};

const defaultProps = {
    nextStep: {},
};

function MoneyReportHeaderStatusBar({nextStep}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const messageContent = useMemo(() => {
        const messageArray = nextStep.message;
        return NextStepUtils.parseMessage(messageArray);
    }, [nextStep.message]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100]}>
            <View style={styles.moneyRequestHeaderStatusBarBadge}>
                <Text style={[styles.textLabel, styles.textMicroBold]}>{translate(nextStep.title === CONST.NEXT_STEP.FINISHED ? 'iou.finished' : 'iou.nextSteps')}</Text>
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML html={messageContent} />
            </View>
        </View>
    );
}

MoneyReportHeaderStatusBar.displayName = 'MoneyReportHeaderStatusBar';
MoneyReportHeaderStatusBar.propTypes = propTypes;
MoneyReportHeaderStatusBar.defaultProps = defaultProps;

export default MoneyReportHeaderStatusBar;
