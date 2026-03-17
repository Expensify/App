import type {Connections, NetSuiteConnectionConfig} from '@src/types/onyx/Policy';

const syncOptions: NetSuiteConnectionConfig['syncOptions'] = {
    crossSubsidiaryCustomers: false,
    enableNewCategories: true,
    exportJournalsTo: 'JOURNALS_APPROVED_NONE',
    exportReportsTo: 'REPORTS_APPROVED_NONE',
    exportVendorBillsTo: 'VENDOR_BILLS_APPROVED_NONE',
    finalApprover: 'owner@gmail.com',
    mapping: {
        classes: 'NETSUITE_DEFAULT',
        customers: 'NETSUITE_DEFAULT',
        departments: 'NETSUITE_DEFAULT',
        jobs: 'NETSUITE_DEFAULT',
        locations: 'NETSUITE_DEFAULT',
    },
    setFinalApprover: true,
    syncApprovalWorkflow: true,
    syncPeople: false,
    syncReimbursedReports: true,
    hasChosenAutoSyncOption: true,
    hasChosenSyncReimbursedReportsOption: false,
    syncCategories: true,
};

const netSuiteConnection: Pick<Connections, 'netsuite'> = {
    netsuite: {
        // cspell:disable-next-line
        accountID: 'TESTACC68486',
        config: {
            autoSync: {
                enabled: true,
                jobID: '1592',
            },
        },
        lastErrorSyncDate: '',
        lastSync: {
            errorDate: '',
            errorMessage: '',
            isAuthenticationError: false,
            isConnected: true,
            isSuccessful: true,
            source: 'EXPENSIFYWEB',
            successfulDate: '2025-04-17T09:01:50+0000',
        },
        lastSyncDate: '2025-04-17T09:01:50+0000',
        options: {
            config: {
                accountingMethod: 'ACCRUAL',
                approvalAccount: 'APPROVAL_ACCOUNT_DEFAULT',
                autoCreateEntities: true,
                exportToNextOpenPeriod: false,
                exporter: 'owner@gmail.com',
                nonreimbursableExpensesExportDestination: 'VENDOR_BILL',
                payableAcct: '',
                reimbursableExpensesExportDestination: 'EXPENSE_REPORT',
                subsidiary: 'Honeycomb Mfg.',
                syncOptions,
                reimbursablePayableAccount: '44492',
            },
            data: {
                customLists: [
                    {
                        id: '1',
                        name: 'Week of Month',
                    },
                    {
                        id: '2',
                        name: 'Wine Type',
                    },
                    {
                        id: '3',
                        name: 'YesMaybeNo',
                    },
                ],
                items: [
                    {
                        id: '1',
                        name: 'EST99999',
                    },
                    {
                        id: '22',
                        name: 'Expensify Invoice Expense',
                    },
                    {
                        id: '3',
                        name: 'Expensify Invoice Line Item',
                    },
                ],
                payableList: [
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': '155',
                        id: '1',
                        name: '4321 Accounts Payable UK',
                        type: '_accountsPayable',
                    },
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': '156',
                        id: '2',
                        name: '450 Bank Test UK',
                        type: '_bank',
                    },
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': '157',
                        id: '3',
                        name: '4564545 Test',
                        type: '_bank',
                    },
                ],
                receivableList: [
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': '158',
                        id: '1',
                        name: '1100 Accounts Receivable',
                        type: '_accountsReceivable',
                    },
                ],
                subsidiaryList: [
                    {
                        country: '_unitedStates',
                        internalID: '1',
                        isElimination: false,
                        name: 'Honeycomb Mfg.',
                    },
                    {
                        country: '_unitedKingdom',
                        internalID: '2',
                        isElimination: false,
                        name: 'Honeycomb UK',
                    },
                    {
                        country: '_canada',
                        internalID: '3',
                        isElimination: false,
                        name: 'Honeycomb Canada',
                    },
                ],
                taxAccountsList: [
                    {
                        country: '_canada',
                        externalID: '',
                        name: 'PST Expenses BC',
                    },
                    {
                        country: '_canada',
                        externalID: '2',
                        name: 'PST Expenses AB',
                    },
                    {
                        country: '_canada',
                        externalID: '3',
                        name: 'GST/HST on Purchases',
                    },
                ],
                vendors: [
                    {
                        email: 'fakeemail@gmail.com',
                        id: '1',
                        name: 'Walter White',
                    },
                    {
                        email: 'fakeemail+1@gmail.com',
                        id: '2',
                        name: 'Martin Mfg.',
                    },
                    {
                        email: 'fakeemail+2@gmail.com',
                        id: '3',
                        name: 'Jesse Pink Man, Inc.',
                    },
                ],
            },
        },
        tokenID: Buffer.from('FAKE_TOKEN_ID').toString('base64'),
        tokenSecret: Buffer.from('FAKE_TOKEN_SECRET').toString('base64'),
        verified: true,
    },
};

const connections = netSuiteConnection as Connections;

export default connections;
