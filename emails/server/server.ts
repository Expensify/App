import express from 'express';
import path from 'path';
import Onyx from 'react-native-onyx';
import 'source-map-support/register';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SSR_CONST from '../core/CONST';
import renderEmail from '../core/renderEmail';
import CONFIG from './CONFIG';
import LiveReloadServer from './LiveReloadServer';
import handleError from './utils/handleError';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

console.log('🌐 Serving static files from:', path.join(__dirname, 'static'));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.redirect('/SampleEmail');
});

app.get('/:notification', async (req, res, next) => {
    try {
        const {notification} = req.params;
        let onyxData = req.query.onyxData ? JSON.parse(req.query.onyxData) : [];
        if (notification === 'ExpenseSubmitted') {
            onyxData = [
                {
                    onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                    key: ONYXKEYS.COLLECTION.REPORT,
                    // Provide the chat report and the expense (IOU) report objects
                    value: {
                        // Chat report (e.g. policyExpenseChat linking to a workspace policy)
                        [`${ONYXKEYS.COLLECTION.REPORT}67890`]: {
                            reportID: 67890,
                            policyID: 1001,
                            // Mark this report as an invoice receiver for a policy
                            invoiceReceiver: {policyID: 1001},
                            // (Optional) type or chat type could be included if defined in CONST, e.g. type: CONST.REPORT.TYPE.POLICYEXPENSECHAT
                        },
                        // Expense report (the actual IOU/money request report)
                        [`${ONYXKEYS.COLLECTION.REPORT}12345`]: {
                            reportID: 12345,
                            policyID: 1001,
                            ownerAccountID: 111, // accountID of the user who submitted the report
                            currency: 'USD',
                            total: 4500, // total amount in cents (e.g. $45.00)
                            stateNum: CONST.REPORT.STATE_NUM.APPROVED, // e.g. approved by manager
                            statusNum: CONST.REPORT.STATUS_NUM.APPROVED, // approved but not yet reimbursed
                            // (Optional flags) e.g. isWaitingOnBankAccount: false, hasOutstandingIOU: false
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    // Provide at least one transaction for the expense report
                    value: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}TX1001`]: {
                            transactionID: 'TX1001',
                            reportID: 12345,
                            amount: 4500, // amount in cents matching the report total
                            currency: 'USD',
                            merchant: 'Subway', // merchant name for the expense
                            comment: 'Team Lunch', // description or comment for the transaction
                            // (Optional) receipt URL, category, etc., if needed
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    // An empty object for the report's actions (no archive reason since it's not archived)
                    value: {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}12345`]: {}, // expense report has no actions needed for preview (just an empty actions list)
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    // Personal detail for a user (e.g. current user or the report submitter)
                    value: {
                        111: {
                            accountID: 111,
                            displayName: 'John Doe',
                            firstName: 'John',
                            avatar: 'https://example.com/avatar111.png', // sample avatar URL
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                    key: ONYXKEYS.COLLECTION.POLICY,
                    // Minimal policy info for the workspace (used to display policy name, etc.)
                    value: {
                        [`${ONYXKEYS.COLLECTION.POLICY}1001`]: {
                            policyID: 1001,
                            name: 'My Workspace', // workspace/policy name
                            type: CONST.POLICY.TYPE.FREE, // example policy type if defined in CONST
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.USER_WALLET,
                    // User wallet info (to indicate the user has a wallet/payment method set up)
                    value: {
                        walletLinked: true,
                        // (Optional) additional fields like fundingType, balance, etc.
                    },
                },
            ];
        }
        const html = await renderEmail({env: SSR_CONST.ENV.SERVER, notificationName: notification, onyxData});
        res.send(html);
    } catch (error) {
        next(error);
    }
});

// Custom error handler works with live reload server
app.use(handleError);

app.listen(CONFIG.EXPRESS_PORT, () => {
    console.log(`💌 Email preview server is running at ${url}`);
    LiveReloadServer.trigger(url);
});
