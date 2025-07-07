"use strict";
// this file is for testing which methods should not be exported so it is not possible to use named imports - that's why we need to disable the no-restricted-syntax rule
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-restricted-syntax */
var IOU = require("@libs/actions/IOU");
var OptionsListUtils = require("@libs/OptionsListUtils");
var ReportUtils = require("@libs/ReportUtils");
var TransactionUtils = require("@libs/TransactionUtils");
var Policy = require("@userActions/Policy/Policy");
var Task = require("@userActions/Task");
// There are some methods that are OK to use inside an action file, but should not be exported. These are typically methods that look up and return Onyx data.
// The correct pattern to use is that every file will use it's own withOnyx or Onyx.connect() to access the Onyx data it needs. This prevents data from becoming stale
// and prevents side-effects that you may not be aware of. It also allows each file to access Onyx data in the most performant way. More context can be found in
// https://github.com/Expensify/App/issues/27262
describe('ReportUtils', function () {
    it('does not export getReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getReport).toBeUndefined();
    });
    // TODO: Re-enable this test when isOneTransactionReport is fixed https://github.com/Expensify/App/issues/64333
    // it('does not export isOneTransactionReport', () => {
    //     // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
    //     expect(ReportUtils.isOneTransactionReport).toBeUndefined();
    // });
    it('does not export getPolicy', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getPolicy).toBeUndefined();
    });
    it('does not export getIconsForChatThread', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForChatThread).toBeUndefined();
    });
    it('does not export getInvoiceReceiverIcons', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getInvoiceReceiverIcons).toBeUndefined();
    });
    it('does not export getParticipantIcon', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getParticipantIcon).toBeUndefined();
    });
    it('does not export getIconsForExpenseRequest', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForExpenseRequest).toBeUndefined();
    });
    it('does not export getIconsForTaskReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForTaskReport).toBeUndefined();
    });
    it('does not export getIconsForDomainRoom', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForDomainRoom).toBeUndefined();
    });
    it('does not export getIconsForPolicyRoom', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForPolicyRoom).toBeUndefined();
    });
    it('does not export getIconsForPolicyExpenseChat', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForPolicyExpenseChat).toBeUndefined();
    });
    it('does not export getIconsForExpenseReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForExpenseReport).toBeUndefined();
    });
    it('does not export getIconsForInvoiceReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForInvoiceReport).toBeUndefined();
    });
    it('does not export getIconsForIOUReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForIOUReport).toBeUndefined();
    });
    it('does not export getIconsForGroupChat', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getIconsForGroupChat).toBeUndefined();
    });
    it('does not export getAllReportActions', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(ReportUtils.getAllReportActions).toBeUndefined();
    });
});
describe('Policy', function () {
    it('does not export getPolicy', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Policy.getPolicy).toBeUndefined();
    });
});
describe('TransactionUtils', function () {
    it('does not export getTransaction', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(TransactionUtils.getTransaction).toBeUndefined();
    });
});
describe('IOU', function () {
    it('does not export getPolicy', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(IOU.getPolicy).toBeUndefined();
    });
    it('does not export getReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(IOU.getReportOrDraftReport).toBeUndefined();
    });
});
describe('Task', function () {
    it('does not export getParentReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Task.getParentReport).toBeUndefined();
    });
    it('does not export getParentReportAction', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(Task.getParentReportAction).toBeUndefined();
    });
});
describe('OptionsListUtils', function () {
    it('does not export getReport', function () {
        // @ts-expect-error the test is asserting that it's undefined, so the TS error is normal
        expect(OptionsListUtils.getReportOrDraftReport).toBeUndefined();
    });
});
