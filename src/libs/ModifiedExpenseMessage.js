
exports.__esModule = true;
const isEmpty_1 = require('lodash/isEmpty');
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const CurrencyUtils_1 = require('./CurrencyUtils');
const DateUtils_1 = require('./DateUtils');
const Localize_1 = require('./Localize');
const Log_1 = require('./Log');
const Parser_1 = require('./Parser');
const PolicyUtils_1 = require('./PolicyUtils');
const ReportActionsUtils_1 = require('./ReportActionsUtils');
// eslint-disable-next-line import/no-cycle
const ReportUtils_1 = require('./ReportUtils');
const TransactionUtils_1 = require('./TransactionUtils');

let allPolicyTags = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback (value) {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});
let allReports;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback (value) {
        return (allReports = value);
    },
});
/**
 * Utility to get message based on boolean literal value.
 */
function getBooleanLiteralMessage(value, truthyMessage, falsyMessage) {
    return value === 'true' ? truthyMessage : falsyMessage;
}
/**
 * Builds the partial message fragment for a modified field on the expense.
 */
function buildMessageFragmentForValue(newValue, oldValue, valueName, valueInQuotes, setFragments, removalFragments, changeFragments, shouldConvertToLowercase) {
    if (shouldConvertToLowercase === void 0) {
        shouldConvertToLowercase = true;
    }
    const newValueToDisplay = valueInQuotes ? `"${  newValue  }"` : newValue;
    const oldValueToDisplay = valueInQuotes ? `"${  oldValue  }"` : oldValue;
    const displayValueName = shouldConvertToLowercase ? valueName.toLowerCase() : valueName;
    const isOldValuePartialMerchant = valueName === Localize_1.translateLocal('common.merchant') && oldValue === CONST_1['default'].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    // In case of a partial merchant value, we want to avoid user seeing the "(none)" value in the message.
    if (!oldValue || isOldValuePartialMerchant) {
        var fragment = Localize_1.translateLocal('iou.setTheRequest', {valueName: displayValueName, newValueToDisplay});
        setFragments.push(fragment);
    } else if (!newValue) {
        var fragment = Localize_1.translateLocal('iou.removedTheRequest', {valueName: displayValueName, oldValueToDisplay});
        removalFragments.push(fragment);
    } else {
        var fragment = Localize_1.translateLocal('iou.updatedTheRequest', {valueName: displayValueName, newValueToDisplay, oldValueToDisplay});
        changeFragments.push(fragment);
    }
}
/**
 * Get the absolute value for a tax amount.
 */
function getTaxAmountAbsValue(taxAmount) {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    return Math.abs(taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0);
}
/**
 * Get the message line for a modified expense.
 */
function getMessageLine(prefix, messageFragments) {
    if (messageFragments.length === 0) {
        return '';
    }
    return messageFragments.reduce(function (acc, value, index) {
        if (index === messageFragments.length - 1) {
            if (messageFragments.length === 1) {
                return `${acc  } ${  value}`;
            }
            if (messageFragments.length === 2) {
                return `${acc  } ${  Localize_1.translateLocal('common.and')  } ${  value}`;
            }
            return `${acc  }, ${  Localize_1.translateLocal('common.and')  } ${  value}`;
        }
        if (index === 0) {
            return `${acc  } ${  value}`;
        }
        return `${acc  }, ${  value}`;
    }, prefix);
}
function getForDistanceRequest(newMerchant, oldMerchant, newAmount, oldAmount) {
    let _a; let _b; let _c; let _d; let _e; let _f; let _g; let _h;
    let changedField = 'distance';
    if (CONST_1['default'].REGEX.DISTANCE_MERCHANT.test(newMerchant) && CONST_1['default'].REGEX.DISTANCE_MERCHANT.test(oldMerchant)) {
        const oldValues = oldMerchant.split('@');
        const oldDistance = (_b = (_a = oldValues.at(0)) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
        const oldRate = (_d = (_c = oldValues.at(1)) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
        const newValues = newMerchant.split('@');
        const newDistance = (_f = (_e = newValues.at(0)) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '';
        const newRate = (_h = (_g = newValues.at(1)) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : '';
        if (oldDistance === newDistance && oldRate !== newRate) {
            changedField = 'rate';
        }
    } else {
        Log_1['default'].hmmm("Distance request merchant doesn't match NewDot format. Defaulting to showing as distance changed.", {newMerchant, oldMerchant});
    }
    const translatedChangedField = Localize_1.translateLocal(`common.${  changedField}`).toLowerCase();
    if (!oldMerchant.length) {
        return Localize_1.translateLocal('iou.setTheDistanceMerchant', {translatedChangedField, newMerchant, newAmountToDisplay: newAmount});
    }
    return Localize_1.translateLocal('iou.updatedTheDistanceMerchant', {
        translatedChangedField,
        newMerchant,
        oldMerchant,
        newAmountToDisplay: newAmount,
        oldAmountToDisplay: oldAmount,
    });
}
function getForExpenseMovedFromSelfDM(destinationReportID) {
    const destinationReport = allReports === null || allReports === void 0 ? void 0 : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${destinationReportID}`];
    const rootParentReport = ReportUtils_1.getRootParentReport({report: destinationReport});
    // In OldDot, expenses could be moved to a self-DM. Return the corresponding message for this case.
    if (ReportUtils_1.isSelfDM(rootParentReport)) {
        return Localize_1.translateLocal('iou.movedToPersonalSpace');
    }
    // In NewDot, the "Move report" flow only supports moving expenses from self-DM to:
    // - A policy expense chat
    // - A 1:1 DM
    const reportName = ReportUtils_1.isPolicyExpenseChat(rootParentReport)
        ? ReportUtils_1.getPolicyExpenseChatName({report: rootParentReport})
        : ReportUtils_1.buildReportNameFromParticipantNames({report: rootParentReport});
    const policyName = ReportUtils_1.getPolicyName({report: rootParentReport, returnEmptyIfNotFound: true});
    // If we can't determine either the report name or policy name, return the default message
    if (isEmpty_1['default'](policyName) && !reportName) {
        return Localize_1.translateLocal('iou.changedTheExpense');
    }
    return Localize_1.translateLocal('iou.movedFromPersonalSpace', {
        reportName,
        workspaceName: !isEmpty_1['default'](policyName) ? policyName : undefined,
    });
}
/**
 * Get the report action message when expense has been modified.
 *
 * ModifiedExpense::getNewDotComment in Web-Expensify should match this.
 * If we change this function be sure to update the backend as well.
 */
function getForReportAction(_a) {
    let _b; let _c; let _d; let _e; let _f; let _g; let _h; let _j; let _k; let _l; let _m; let _o; let _p; let _q; let _r; let _s; let _t; let _u; let _v; let _w; let _x;
    const reportOrID = _a.reportOrID;
        const reportAction = _a.reportAction;
        const searchReports = _a.searchReports;
    if (!ReportActionsUtils_1.isModifiedExpenseAction(reportAction)) {
        return '';
    }
    const reportActionOriginalMessage = ReportActionsUtils_1.getOriginalMessage(reportAction);
    let report;
    if (typeof reportOrID === 'string') {
        report = searchReports
            ? searchReports.find(function (r) {
                  return r.reportID === reportOrID;
              })
            : allReports === null || allReports === void 0
            ? void 0
            : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${reportOrID}`];
    } else {
        report = reportOrID;
    }
    if (reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.movedToReportID) {
        return getForExpenseMovedFromSelfDM(reportActionOriginalMessage.movedToReportID);
    }
    const removalFragments = [];
    const setFragments = [];
    const changeFragments = [];
    const isReportActionOriginalMessageAnObject = reportActionOriginalMessage && typeof reportActionOriginalMessage === 'object';
    const hasModifiedAmount =
        isReportActionOriginalMessageAnObject &&
        'oldAmount' in reportActionOriginalMessage &&
        'oldCurrency' in reportActionOriginalMessage &&
        'amount' in reportActionOriginalMessage &&
        'currency' in reportActionOriginalMessage;
    const hasModifiedMerchant = isReportActionOriginalMessageAnObject && 'oldMerchant' in reportActionOriginalMessage && 'merchant' in reportActionOriginalMessage;
    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCurrency;
        const oldAmountValue =
            (_b = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldAmount) !== null && _b !== void 0 ? _b : 0;
        const oldAmount =
            oldAmountValue > 0
                ? CurrencyUtils_1.convertToDisplayString(
                      (_c = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldAmount) !== null && _c !== void 0
                          ? _c
                          : 0,
                      oldCurrency,
                  )
                : '';
        var currency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.currency;
        const amount = CurrencyUtils_1.convertToDisplayString(
            (_d = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.amount) !== null && _d !== void 0 ? _d : 0,
            currency,
        );
        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (
            hasModifiedMerchant &&
            ((_e = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _e !== void 0
                ? _e
                : ''
            ).includes('@')
        ) {
            return getForDistanceRequest(
                (_f = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _f !== void 0 ? _f : '',
                (_g = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldMerchant) !== null && _g !== void 0 ? _g : '',
                amount,
                oldAmount,
            );
        }
        buildMessageFragmentForValue(amount, oldAmount, Localize_1.translateLocal('iou.amount'), false, setFragments, removalFragments, changeFragments);
    }
    const hasModifiedComment = isReportActionOriginalMessageAnObject && 'oldComment' in reportActionOriginalMessage && 'newComment' in reportActionOriginalMessage;
    if (hasModifiedComment) {
        buildMessageFragmentForValue(
            Parser_1['default'].htmlToMarkdown(
                (_h = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.newComment) !== null && _h !== void 0 ? _h : '',
            ),
            Parser_1['default'].htmlToMarkdown(
                (_j = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldComment) !== null && _j !== void 0 ? _j : '',
            ),
            Localize_1.translateLocal('common.description'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    if (
        (reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCreated) &&
        (reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.created)
    ) {
        const formattedOldCreated = DateUtils_1['default'].formatWithUTCTimeZone(reportActionOriginalMessage.oldCreated, CONST_1['default'].DATE.FNS_FORMAT_STRING);
        buildMessageFragmentForValue(
            reportActionOriginalMessage.created,
            formattedOldCreated,
            Localize_1.translateLocal('common.date'),
            false,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    if (hasModifiedMerchant) {
        buildMessageFragmentForValue(
            (_k = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _k !== void 0 ? _k : '',
            (_l = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldMerchant) !== null && _l !== void 0 ? _l : '',
            Localize_1.translateLocal('common.merchant'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    const hasModifiedCategory = isReportActionOriginalMessageAnObject && 'oldCategory' in reportActionOriginalMessage && 'category' in reportActionOriginalMessage;
    if (hasModifiedCategory) {
        buildMessageFragmentForValue(
            (_m = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.category) !== null && _m !== void 0 ? _m : '',
            (_o = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCategory) !== null && _o !== void 0 ? _o : '',
            Localize_1.translateLocal('common.category'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    const hasModifiedTag = isReportActionOriginalMessageAnObject && 'oldTag' in reportActionOriginalMessage && 'tag' in reportActionOriginalMessage;
    if (hasModifiedTag) {
        const policyTags_1 =
            (_p =
                allPolicyTags === null || allPolicyTags === void 0
                    ? void 0
                    : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${report === null || report === void 0 ? void 0 : report.policyID}`]) !== null && _p !== void 0
                ? _p
                : {};
        const transactionTag =
            (_q = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.tag) !== null && _q !== void 0 ? _q : '';
        const oldTransactionTag =
            (_r = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTag) !== null && _r !== void 0 ? _r : '';
        const splittedTag_1 = TransactionUtils_1.getTagArrayFromName(transactionTag);
        const splittedOldTag_1 = TransactionUtils_1.getTagArrayFromName(oldTransactionTag);
        const localizedTagListName_1 = Localize_1.translateLocal('common.tag');
        const sortedTagKeys = PolicyUtils_1.getSortedTagKeys(policyTags_1);
        sortedTagKeys.forEach(function (policyTagKey, index) {
            let _a; let _b;
            const policyTagListName = policyTags_1[policyTagKey].name || localizedTagListName_1;
            const newTag = (_a = splittedTag_1.at(index)) !== null && _a !== void 0 ? _a : '';
            const oldTag = (_b = splittedOldTag_1.at(index)) !== null && _b !== void 0 ? _b : '';
            if (newTag !== oldTag) {
                buildMessageFragmentForValue(
                    PolicyUtils_1.getCleanedTagName(newTag),
                    PolicyUtils_1.getCleanedTagName(oldTag),
                    policyTagListName,
                    true,
                    setFragments,
                    removalFragments,
                    changeFragments,
                    policyTagListName === localizedTagListName_1,
                );
            }
        });
    }
    const hasModifiedTaxAmount = isReportActionOriginalMessageAnObject && 'oldTaxAmount' in reportActionOriginalMessage && 'taxAmount' in reportActionOriginalMessage;
    if (hasModifiedTaxAmount) {
        var currency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.currency;
        const taxAmount = CurrencyUtils_1.convertToDisplayString(
            getTaxAmountAbsValue(
                (_s = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.taxAmount) !== null && _s !== void 0 ? _s : 0,
            ),
            currency,
        );
        const oldTaxAmountValue = getTaxAmountAbsValue(
            (_t = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTaxAmount) !== null && _t !== void 0 ? _t : 0,
        );
        const oldTaxAmount = oldTaxAmountValue > 0 ? CurrencyUtils_1.convertToDisplayString(oldTaxAmountValue, currency) : '';
        buildMessageFragmentForValue(taxAmount, oldTaxAmount, Localize_1.translateLocal('iou.taxAmount'), false, setFragments, removalFragments, changeFragments);
    }
    const hasModifiedTaxRate = isReportActionOriginalMessageAnObject && 'oldTaxRate' in reportActionOriginalMessage && 'taxRate' in reportActionOriginalMessage;
    if (hasModifiedTaxRate) {
        buildMessageFragmentForValue(
            (_u = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.taxRate) !== null && _u !== void 0 ? _u : '',
            (_v = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTaxRate) !== null && _v !== void 0 ? _v : '',
            Localize_1.translateLocal('iou.taxRate'),
            false,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    const hasModifiedBillable = isReportActionOriginalMessageAnObject && 'oldBillable' in reportActionOriginalMessage && 'billable' in reportActionOriginalMessage;
    if (hasModifiedBillable) {
        buildMessageFragmentForValue(
            (_w = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.billable) !== null && _w !== void 0 ? _w : '',
            (_x = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldBillable) !== null && _x !== void 0 ? _x : '',
            Localize_1.translateLocal('iou.expense'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    const hasModifiedReimbursable = isReportActionOriginalMessageAnObject && 'oldReimbursable' in reportActionOriginalMessage && 'reimbursable' in reportActionOriginalMessage;
    if (hasModifiedReimbursable) {
        buildMessageFragmentForValue(
            getBooleanLiteralMessage(
                reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.reimbursable,
                Localize_1.translateLocal('iou.reimbursable'),
                Localize_1.translateLocal('iou.nonReimbursable'),
            ),
            getBooleanLiteralMessage(
                reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldReimbursable,
                Localize_1.translateLocal('iou.reimbursable'),
                Localize_1.translateLocal('iou.nonReimbursable'),
            ),
            Localize_1.translateLocal('iou.expense'),
            true,
            setFragments,
            removalFragments,
            changeFragments,
        );
    }
    const hasModifiedAttendees = isReportActionOriginalMessageAnObject && 'oldAttendees' in reportActionOriginalMessage && 'newAttendees' in reportActionOriginalMessage;
    if (hasModifiedAttendees) {
        const _y = TransactionUtils_1.getFormattedAttendees(reportActionOriginalMessage.newAttendees, reportActionOriginalMessage.oldAttendees);
            const oldAttendees = _y[0];
            const attendees = _y[1];
        buildMessageFragmentForValue(oldAttendees, attendees, Localize_1.translateLocal('iou.attendees'), false, setFragments, removalFragments, changeFragments);
    }
    const message =
        getMessageLine(`\n${  Localize_1.translateLocal('iou.changed')}`, changeFragments) +
        getMessageLine(`\n${  Localize_1.translateLocal('iou.set')}`, setFragments) +
        getMessageLine(`\n${  Localize_1.translateLocal('iou.removed')}`, removalFragments);
    if (message === '') {
        return Localize_1.translateLocal('iou.changedTheExpense');
    }
    return `${  message.substring(1, message.length)}`;
}
exports['default'] = {
    getForReportAction,
};
