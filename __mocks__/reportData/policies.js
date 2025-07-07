"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policy420A = void 0;
var connections_1 = require("./connections");
var mccGroup = {
    airlines: {
        category: 'Uncategorized',
        groupID: 'airlines',
    },
    gas: {
        category: 'Uncategorized',
        groupID: 'gas',
    },
    goods: {
        category: 'Materials',
        groupID: 'goods',
    },
};
var customUnits = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '6XD9': {
        attributes: {
            taxEnabled: false,
            unit: 'mi',
        },
        customUnitID: '6XD9',
        defaultCategory: '',
        enabled: true,
        name: 'Distance',
        rates: {
            EB9E28C619B9E: {
                attributes: {},
                currency: 'USD',
                customUnitRateID: 'EB93',
                enabled: true,
                name: 'Default Rate',
                rate: 70,
                subRates: [],
            },
        },
    },
};
var fieldList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    text_title: {
        defaultValue: '{report:type} {report:startdate}',
        deletable: true,
        disabledOptions: [],
        externalIDs: [],
        fieldID: 'text_title',
        isTax: false,
        keys: [],
        name: 'title',
        orderWeight: 0,
        target: 'expense',
        type: 'formula',
        values: [],
    },
};
var policy420A = {
    isFromFullPolicy: false,
    id: '420A',
    name: 'Workspace with expensify checking card',
    role: 'admin',
    type: 'corporate',
    owner: 'owner@gmail.com',
    ownerAccountID: 123,
    outputCurrency: 'USD',
    avatarURL: '',
    employeeList: {},
    isPolicyExpenseChatEnabled: true,
    lastModified: '1744880511066991',
    chatReportIDAnnounce: 0,
    chatReportIDAdmins: 1552825053855260,
    autoReimbursement: {
        limit: 0,
    },
    areCategoriesEnabled: true,
    areTagsEnabled: true,
    areDistanceRatesEnabled: false,
    arePerDiemRatesEnabled: false,
    areWorkflowsEnabled: true,
    areConnectionsEnabled: true,
    areInvoicesEnabled: true,
    areExpensifyCardsEnabled: true,
    areCompanyCardsEnabled: true,
    tax: {
        trackingEnabled: false,
    },
    areRulesEnabled: false,
    eReceipts: true,
    shouldShowAutoApprovalOptions: false,
    shouldShowAutoReimbursementLimitOption: false,
    maxExpenseAmountNoReceipt: 100000,
    maxExpenseAmount: 200000,
    maxExpenseAge: 90,
    approvalMode: 'BASIC',
    invoice: {
        companyName: 'Company',
        markUp: 0,
    },
    workspaceAccountID: 93521943,
    address: {
        addressStreet: 'Street',
        city: 'City',
        state: 'State',
        zipCode: '123-45',
        country: 'US',
    },
    approver: 'owner@gmail.com',
    areReportFieldsEnabled: true,
    autoReimbursementLimit: 0,
    autoReporting: true,
    autoReportingFrequency: 'immediate',
    autoReportingOffset: 1,
    connections: connections_1.default,
    customUnits: customUnits,
    defaultBillable: false,
    disabledFields: {
        defaultBillable: true,
        reimbursable: false,
    },
    fieldList: fieldList,
    harvesting: {
        enabled: false,
    },
    hasMultipleTagLists: false,
    mccGroup: mccGroup,
    preventSelfApproval: false,
    reimbursementChoice: 'reimburseManual',
    requiresCategory: true,
    requiresTag: false,
    rules: {
        approvalRules: [],
        expenseRules: [],
    },
};
exports.policy420A = policy420A;
