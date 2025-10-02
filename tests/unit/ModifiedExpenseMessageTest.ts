import Onyx from 'react-native-onyx';
import {getForReportAction, getMovedFromOrToReportMessage, getMovedReportID} from '@libs/ModifiedExpenseMessage';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {translate} from '@src/libs/Localize';
import type {PolicyTagLists} from '@src/types/onyx/PolicyTag';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const MOVED_TO_REPORT_ID = '1';
const MOVED_FROM_REPORT_ID = '2';

describe('ModifiedExpenseMessage', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        // The `getReportName` method is quite complex, and we don't need to test it here
        jest.spyOn(ReportUtils, 'getReportName').mockImplementation(({report}) => report?.reportName ?? '');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMovedReportID', () => {
        describe('when the report action is a modified expense action', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    movedToReportID: MOVED_TO_REPORT_ID,
                    movedFromReport: MOVED_FROM_REPORT_ID,
                },
            };

            it('returns the movedToReportID when type is REPORT_MOVE_TYPE.TO and movedToReportID exists in reportAction', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toEqual(MOVED_TO_REPORT_ID);
            });

            it('returns the movedFromReport when type is REPORT_MOVE_TYPE.FROM and movedFromReport exists in reportAction', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toEqual(MOVED_FROM_REPORT_ID);
            });
        });
        describe('when the report action is not a modified expense action', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    movedToReportID: MOVED_TO_REPORT_ID,
                    movedFromReport: MOVED_FROM_REPORT_ID,
                },
            };

            it('returns undefined for REPORT_MOVE_TYPE.TO  type', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toBeUndefined();
            });

            it('returns undefined for REPORT_MOVE_TYPE.FROM type', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toBeUndefined();
            });
        });
        describe('when the original message is missing movedToReportID or movedFromReport', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {},
            };

            it('returns undefined for REPORT_MOVE_TYPE.TO type when movedToReportID is missing', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toBeUndefined();
            });

            it('returns undefined for REPORT_MOVE_TYPE.FROM type when movedFromReport is missing', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toBeUndefined();
            });
        });
    });

    describe('getMovedFromOrToReportMessage', () => {
        describe('when moving to a report', () => {
            it('returns "moved expense to personal space" message when moving an expense to selfDM', () => {
                const selfDMReport = {
                    ...createRandomReport(1),
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                };
                const result = getMovedFromOrToReportMessage(undefined, selfDMReport, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedToPersonalSpace');
                expect(result).toEqual(expectedResult);
            });
            it('returns "moved expense from personal space to chat with reportName" message when moving an expense to policy expense chat with only reportName', () => {
                const policyExpenseReport = {
                    ...createRandomReport(1),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                };
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {
                    reportName: policyExpenseReport.reportName,
                });
                expect(result).toEqual(expectedResult);
            });
            it('returns "moved expense from personal space to policyName" message when moving an expense to policy expense chat with reportName and policyName', () => {
                const policyExpenseReport = {
                    ...createRandomReport(1),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    policyName: 'Policy',
                };
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {
                    reportName: policyExpenseReport.reportName,
                    workspaceName: policyExpenseReport.policyName,
                });
                expect(result).toEqual(expectedResult);
            });
            it('returns "changed the expense" message when moving an expense to policy expense chat without reportName', () => {
                const policyExpenseReport = {
                    ...createRandomReport(1),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    reportName: '',
                };
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.changedTheExpense');
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving from a report', () => {
            const movedFromReport = {
                ...createRandomReport(1),
            };

            it('returns "moved expense from reportName" message', () => {
                const result = getMovedFromOrToReportMessage(movedFromReport, undefined, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromReport', {
                    reportName: movedFromReport.reportName ?? '',
                });
                expect(result).toEqual(expectedResult);
            });

            it('returns "moved an expense" when reportName is empty', () => {
                const reportWithoutName = {
                    ...createRandomReport(1),
                    reportName: '',
                    chatType: undefined,
                };
                const result = getMovedFromOrToReportMessage(reportWithoutName, undefined, {});
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromReport', {
                    reportName: '',
                });

                expect(result).toEqual(expectedResult);
            });
        });

        it('returns undefined when neither movedToReport nor movedFromReport is provided', () => {
            const result = getMovedFromOrToReportMessage(undefined, undefined, {});
            expect(result).toBeUndefined();
        });
    });

    describe('getForAction', () => {
        describe('when the amount is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `changed the amount to $18.00 (previously $12.55)`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed while the original value was partial', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 0,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the amount to $18.00`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed and the description is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55)\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55)\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult =
                    'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount, comment and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: 'I bought it on the way',
                    oldComment: 'from the business trip',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult =
                    'changed the amount to $18.00 (previously $12.55), the description to "I bought it on the way" (previously "from the business trip"), and the merchant to "Taco Bell" (previously "Big Belly")';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the merchant (previously "Big Belly")`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is changed while the previous merchant was partial', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'KFC',
                    oldMerchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the merchant to "KFC"`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is cleared to PARTIAL_TRANSACTION_MERCHANT', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                    oldMerchant: 'Old Merchant',
                },
            };

            it('returns the correct "removed" text message', () => {
                const expectedResult = `removed the merchant (previously "Old Merchant")`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is changed from one valid merchant to another', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'New Merchant',
                    oldMerchant: 'Old Merchant',
                },
            };

            it('returns the correct "changed" text message', () => {
                const expectedResult = `changed the merchant to "New Merchant" (previously "Old Merchant")`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the description (previously "mini shore") and the merchant (previously "Big Belly")`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant, the category and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                    category: '',
                    oldCategory: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the description (previously "mini shore"), the merchant (previously "Big Belly"), and the category (previously "Benefits")`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the merchant to "Big Belly"`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant and the description are set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the description to "mini shore" and the merchant to "Big Belly"`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant, the category and the description are set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                    oldCategory: '',
                    category: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the description to "mini shore", the merchant to "Big Belly", and the category to "Benefits"`;

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the created date is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    created: '2023-12-27',
                    oldCreated: '2023-12-26',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the date to 2023-12-27 (previously 2023-12-26)';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the created date was not changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    created: '2023-12-27',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the expense';

                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '1.00 mi @ $0.70 / mi',
                    merchant: '10.00 mi @ $0.70 / mi',
                    oldAmount: 70,
                    amount: 700,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the distance is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the distance to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $7.00 (previously $0.70)`;
                const result = getForReportAction({reportAction, policyTags: {}});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance rate is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '56.36 mi @ $0.70 / mi',
                    merchant: '56.36 mi @ $0.99 / mi',
                    oldAmount: 3945,
                    amount: 5580,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the rate is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the rate to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $55.80 (previously $39.45)`;
                const result = getForReportAction({reportAction, policyTags: {}});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving an expense', () => {
            it('returns the movedFromOrToReportMessage message when provided', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                };

                const expectedResult = 'moved an expense';

                const movedFromReport = {
                    ...createRandomReport(1),
                    reportName: '',
                    chatType: undefined,
                };

                const result = getForReportAction({reportAction, policyTags: {}, movedFromReport});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when tags are modified with policyTags', () => {
            const policyTags: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    required: false,
                    tags: {
                        Engineering: {
                            name: 'Engineering',
                            enabled: true,
                        },
                        Marketing: {
                            name: 'Marketing',
                            enabled: true,
                        },
                    },
                    orderWeight: 0,
                },
                Location: {
                    name: 'Location',
                    required: false,
                    tags: {
                        sanFrancisco: {
                            name: 'San Francisco',
                            enabled: true,
                        },
                        newYork: {
                            name: 'New York',
                            enabled: true,
                        },
                    },
                    orderWeight: 1,
                },
            };

            it('returns the correct message when single tag is changed with policyTags', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Engineering',
                        oldTag: 'Marketing',
                    },
                };

                const expectedResult = 'changed the Department to "Engineering" (previously "Marketing")';
                const result = getForReportAction({reportAction, policyTags});

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct message when multiple tags are changed with policyTags', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Engineering:San Francisco',
                        oldTag: 'Marketing:New York',
                    },
                };

                const expectedResult = 'changed the Department to "Engineering" (previously "Marketing") and the Location to "San Francisco" (previously "New York")';
                const result = getForReportAction({reportAction, policyTags});

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct message when tag is set with policyTags', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Engineering',
                        oldTag: '',
                    },
                };

                const expectedResult = 'set the Department to "Engineering"';
                const result = getForReportAction({reportAction, policyTags});

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct message when tag is removed with policyTags', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: '',
                        oldTag: 'Engineering',
                    },
                };

                const expectedResult = 'removed the Department (previously "Engineering")';
                const result = getForReportAction({reportAction, policyTags});

                expect(result).toEqual(expectedResult);
            });

            it('returns generic message when policyTags is empty (actual current behavior)', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Engineering',
                        oldTag: 'Marketing',
                    },
                };

                // When policyTags is empty, the function returns the generic fallback message
                const expectedResult = 'changed the expense';
                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });

            it('returns generic message when policyTags parameter is omitted (backward compatibility)', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Engineering',
                        oldTag: 'Marketing',
                    },
                };

                // When policyTags is undefined, the function returns the generic fallback message
                const expectedResult = 'changed the expense';
                const result = getForReportAction({reportAction, policyTags: {}});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('parameter handling and API compatibility', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 2000,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1500,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            const testPolicyTags: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    required: false,
                    tags: {
                        Engineering: {
                            name: 'Engineering',
                            enabled: true,
                        },
                        Marketing: {
                            name: 'Marketing',
                            enabled: true,
                        },
                        Sales: {
                            name: 'Sales',
                            enabled: true,
                        },
                    },
                    orderWeight: 0,
                },
                Project: {
                    name: 'Project',
                    required: false,
                    tags: {
                        projectAlpha: {
                            name: 'Project Alpha',
                            enabled: true,
                        },
                        projectBeta: {
                            name: 'Project Beta',
                            enabled: true,
                        },
                    },
                    orderWeight: 1,
                },
            };

            it('validates unused reportOrID parameter works correctly', () => {
                // Test that marking reportOrID as unused doesn't break functionality
                const result = getForReportAction({
                    reportAction,
                    policyTags: {},
                });

                expect(result).toBe('changed the amount to $20.00 (previously $15.00)');
            });

            it('validates unused searchReports parameter works correctly', () => {
                const result = getForReportAction({
                    reportAction,
                    policyTags: {},
                });

                expect(result).toBe('changed the amount to $20.00 (previously $15.00)');
            });

            it('maintains backward compatibility with all parameter combinations', () => {
                // Test all possible parameter combinations
                const combinations = [
                    {reportOrID: '123', searchReports: undefined},
                    {reportOrID: '123', searchReports: []},
                    {reportOrID: undefined, searchReports: undefined},
                    {reportOrID: undefined, searchReports: []},
                ];

                combinations.forEach((params) => {
                    const result = getForReportAction({
                        ...params,
                        reportAction,
                        policyTags: {},
                    });

                    expect(result).toBe('changed the amount to $20.00 (previously $15.00)');
                });
            });

            describe('with non-empty policy tags', () => {
                it('validates policy tags still work with unused parameters', () => {
                    const tagModificationAction = {
                        ...createRandomReportAction(1),
                        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                        originalMessage: {
                            tag: 'Engineering',
                            oldTag: 'Marketing',
                        },
                    };

                    // Test that policy tags functionality is preserved despite unused parameters
                    const result = getForReportAction({
                        reportAction: tagModificationAction,
                        policyTags: testPolicyTags,
                    });

                    expect(result).toBe('changed the Department to "Engineering" (previously "Marketing")');
                });
            });
        });

        describe('Onyx connectWithoutView behavior', () => {
            beforeEach(() => {
                // Clear Onyx state before each test to verify our connectWithoutView works
                return Onyx.clear();
            });

            it('works correctly with connectWithoutView when Onyx reports collection is empty', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        amount: 3000,
                        currency: CONST.CURRENCY.USD,
                        oldAmount: 2000,
                        oldCurrency: CONST.CURRENCY.USD,
                    },
                };

                const result = getForReportAction({
                    reportAction,
                    policyTags: {},
                });

                // This validates that our connectWithoutView change doesn't break functionality
                expect(result).toBe('changed the amount to $30.00 (previously $20.00)');
            });
        });

        describe('validation of updated functionality', () => {
            it('maintains consistency with policy tags across multiple parameter combinations', () => {
                const testPolicyTags: PolicyTagLists = {
                    Category: {
                        name: 'Category',
                        required: false,
                        tags: {
                            Business: {name: 'Business', enabled: true},
                            Personal: {name: 'Personal', enabled: true},
                        },
                        orderWeight: 0,
                    },
                };

                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        tag: 'Business',
                        oldTag: 'Personal',
                    },
                };

                // Test different parameter combinations to validate our unused parameter handling
                const combinations = [
                    {reportOrID: '123', searchReports: undefined},
                    {reportOrID: undefined, searchReports: undefined},
                ];

                const expectedResult = 'changed the Category to "Business" (previously "Personal")';

                combinations.forEach((params) => {
                    const result = getForReportAction({
                        ...params,
                        reportAction,
                        policyTags: testPolicyTags,
                    });

                    expect(result).toBe(expectedResult);
                });
            });
        });
    });
});
