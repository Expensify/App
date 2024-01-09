import {deepEqual} from 'fast-equals';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef} from 'react';
import _ from 'underscore';
import participantPropTypes from '@components/participantPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import SidebarUtils from '@libs/SidebarUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import OptionRowLHN, {defaultProps as baseDefaultProps, propTypes as basePropTypes} from './OptionRowLHN';

const propTypes = {
    /** Whether row should be focused */
    isFocused: PropTypes.bool,

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The preferred language for the app */
    preferredLocale: PropTypes.string,

    /** The full data of the report */
    // eslint-disable-next-line react/forbid-prop-types
    fullReport: PropTypes.object,

    /** The policy which the user has access to and which the report could be tied to */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,
        /** Name of the policy */
        name: PropTypes.string,
        /** Avatar of the policy */
        avatar: PropTypes.string,
    }),

    /** The action from the parent report */
    parentReportAction: PropTypes.shape(reportActionPropTypes),

    /** The transaction from the parent report action */
    transaction: transactionPropTypes,

    ...basePropTypes,
};

const defaultProps = {
    isFocused: false,
    personalDetails: {},
    fullReport: {},
    policy: {},
    parentReportAction: {},
    transaction: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
    ...baseDefaultProps,
};

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    isFocused,
    fullReport,
    reportActions,
    personalDetails,
    preferredLocale,
    comment,
    policy,
    receiptTransactions,
    parentReportAction,
    transaction,
    ...propsToForward
}) {
    const reportID = propsToForward.reportID;

    const optionItemRef = useRef();
    const linkedTransaction = useMemo(() => {
        const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(reportActions);
        const lastReportAction = _.first(sortedReportActions);
        return TransactionUtils.getLinkedTransaction(lastReportAction);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullReport.reportID, receiptTransactions, reportActions]);

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData(fullReport, reportActions, personalDetails, preferredLocale, policy, parentReportAction);
        if (deepEqual(item, optionItemRef.current)) {
            return optionItemRef.current;
        }
        optionItemRef.current = item;
        return item;
        // Listen parentReportAction to update title of thread report when parentReportAction changed
        // Listen to transaction to update title of transaction report when transaction changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullReport, linkedTransaction, reportActions, personalDetails, preferredLocale, policy, parentReportAction, transaction]);

    useEffect(() => {
        if (!optionItem || optionItem.hasDraftComment || !comment || comment.length <= 0 || isFocused) {
            return;
        }
        Report.setReportWithDraft(reportID, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isFocused={isFocused}
            optionItem={optionItem}
        />
    );
}

OptionRowLHNData.propTypes = propTypes;
OptionRowLHNData.defaultProps = defaultProps;
OptionRowLHNData.displayName = 'OptionRowLHNData';

/**
 * This component is rendered in a list.
 * On scroll we want to avoid that a item re-renders
 * just because the list has to re-render when adding more items.
 * Thats also why the React.memo is used on the outer component here, as we just
 * use it to prevent re-renders from parent re-renders.
 */
export default React.memo(OptionRowLHNData);
