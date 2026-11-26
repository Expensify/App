import {renderHook} from '@testing-library/react-native';

import usePermissions from '@hooks/usePermissions';
import useReceiptTranslation from '@hooks/useReceiptTranslation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/usePermissions');

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_APPROVER_ACCOUNT_ID = 2;
const EMPLOYEE_ACCOUNT_ID = 3;
const CURRENT_USER_EMAIL = 'approver@test.com';
const EMPLOYEE_EMAIL = 'employee@test.com';
const POLICY_ID = 'ABC123';
const REPORT_ID = '100';

const transaction = createMock<Transaction>({
    transactionID: '200',
    reportID: REPORT_ID,
    receipt: {source: 'https://www.expensify.com/receipts/w_123.jpg', receiptID: 300},
});

async function seedWorkspace({policyType, role, managerID}: {policyType: ValueOf<typeof CONST.POLICY.TYPE>; role: ValueOf<typeof CONST.POLICY.ROLE>; managerID: number}) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, type: policyType, role});
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, policyID: POLICY_ID, managerID});
}

describe('useReceiptTranslation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(usePermissions).mockReturnValue(createMock<ReturnType<typeof usePermissions>>({isBetaEnabled: (beta) => beta === CONST.BETAS.RECEIPT_TRANSLATION}));
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows Translate to a workspace admin on a paid workspace', async () => {
        // Given a paid workspace where the current user is an admin but not the report's approver
        await seedWorkspace({policyType: CONST.POLICY.TYPE.CORPORATE, role: CONST.POLICY.ROLE.ADMIN, managerID: OTHER_APPROVER_ACCOUNT_ID});

        // When the hook reads the expense's receipt
        const {result} = renderHook(() => useReceiptTranslation(transaction));
        await waitForBatchedUpdatesWithAct();

        // Then admins can translate, because they review receipts on the workspace
        expect(result.current.canTranslate).toBe(true);
    });

    it("shows Translate to the report's approver on a paid workspace", async () => {
        // Given a paid workspace where the current user is a plain member who approves this report
        await seedWorkspace({policyType: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER, managerID: CURRENT_USER_ACCOUNT_ID});

        // When the hook reads the expense's receipt
        const {result} = renderHook(() => useReceiptTranslation(transaction));
        await waitForBatchedUpdatesWithAct();

        // Then the approver can translate, because they review this report's receipts
        expect(result.current.canTranslate).toBe(true);
    });

    it('shows Translate to the approver the workspace routes a draft report to', async () => {
        // Given a draft report that names someone else as approver, while the workspace routes it to the current user
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[EMPLOYEE_ACCOUNT_ID]: {accountID: EMPLOYEE_ACCOUNT_ID, login: EMPLOYEE_EMAIL}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.USER,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            employeeList: {[EMPLOYEE_EMAIL]: {submitsTo: CURRENT_USER_EMAIL}},
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: OTHER_APPROVER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });

        // When the hook reads the expense's receipt
        const {result} = renderHook(() => useReceiptTranslation(transaction));
        await waitForBatchedUpdatesWithAct();

        // Then the current user can translate, because they approve the report once it's submitted
        expect(result.current.canTranslate).toBe(true);
    });

    it('hides Translate from an employee who only submits the report', async () => {
        // Given a paid workspace where the current user is a plain member and someone else approves the report
        await seedWorkspace({policyType: CONST.POLICY.TYPE.CORPORATE, role: CONST.POLICY.ROLE.USER, managerID: OTHER_APPROVER_ACCOUNT_ID});

        // When the hook reads the expense's receipt
        const {result} = renderHook(() => useReceiptTranslation(transaction));
        await waitForBatchedUpdatesWithAct();

        // Then the employee can't translate, since Translate is only for the people who review receipts
        expect(result.current.canTranslate).toBe(false);
    });

    it('hides Translate on a workspace that is not on a paid plan', async () => {
        // Given a workspace on the free Submit plan where the current user is the admin and the report's approver
        await seedWorkspace({policyType: CONST.POLICY.TYPE.SUBMIT, role: CONST.POLICY.ROLE.ADMIN, managerID: CURRENT_USER_ACCOUNT_ID});

        // When the hook reads the expense's receipt
        const {result} = renderHook(() => useReceiptTranslation(transaction));
        await waitForBatchedUpdatesWithAct();

        // Then nobody can translate, because Translate is a paid feature
        expect(result.current.canTranslate).toBe(false);
    });
});
