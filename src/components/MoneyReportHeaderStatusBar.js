import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
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
        let nextStepHTML = '';

        const messageArray = _.isEmpty(nextStep.expenseMessage) ? nextStep.message : nextStep.expenseMessage;
        _.each(messageArray, (part) => {
            const tagType = part.type || 'span';
            nextStepHTML += `<${tagType}>${Str.safeEscape(part.text)}</${tagType}>`;
        });

        return nextStepHTML
            .replace(/%expenses/g, 'this expense')
            .replace(/%Expenses/g, 'This expense')
            .replace(/%tobe/g, 'is');
    }, [nextStep.expenseMessage, nextStep.message]);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100]}>
            <View style={[styles.moneyRequestHeaderStatusBarBadge]}>
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
