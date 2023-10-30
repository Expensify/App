import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import * as NextStepUtils from '../libs/NextStepUtils';
import useLocalize from '../hooks/useLocalize';
import nextStepPropTypes from '../pages/nextStepPropTypes';
import RenderHTML from './RenderHTML';

const propTypes = {
    /** The next step for the report */
    nextStep: nextStepPropTypes,
};

const defaultProps = {
    nextStep: {},
};

function MoneyReportHeaderStatusBar({nextStep}) {
    const {translate} = useLocalize();

    const messageContent = useMemo(() => {
        const messageArray = _.isEmpty(nextStep.expenseMessage) ? nextStep.message : nextStep.expenseMessage;
        return NextStepUtils.parseMessage(messageArray);
    }, [nextStep.expenseMessage, nextStep.message]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100]}>
            <View style={styles.moneyRequestHeaderStatusBarBadge}>
                <Text style={[styles.textStrong, styles.textLabel]}>{translate('iou.nextSteps')}</Text>
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
