import type {OnyxCollection} from 'react-native-onyx';
import openAndSubmittedReportsByPolicyIDConfig from '@libs/actions/OnyxDerived/configs/openAndSubmittedReportsByPolicyID';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Session} from '@src/types/onyx';
import {createMockReport} from '../../utils/ReportTestUtils';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;
const POLICY_ID_1 = 'policy1';
const POLICY_ID_2 = 'policy2';

function createReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return createMockReport({
        reportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        policyID: POLICY_ID_1,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        ...overrides,
    });
}

function buildReports(...reports: Report[]): OnyxCollection<Report> {
    const result: OnyxCollection<Report> = {};
    for (const report of reports) {
        result[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    return result;
}

function createSession(accountID: number = CURRENT_USER_ACCOUNT_ID): Session {
    return {accountID} as Session;
}

const {compute} = openAndSubmittedReportsByPolicyIDConfig;
const emptyContext = {} as DerivedValueContext<typeof ONYXKEYS.DERIVED.OPEN_AND_SUBMITTED_REPORTS_BY_POLICY_ID, [typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.SESSION]>;

describe('openAndSubmittedReportsByPolicyID derived value', () => {
    it('returns empty object when reports is null/undefined', () => {
        const result = compute([undefined, createSession()], emptyContext);
        expect(result).toEqual({});
    });

    it('returns empty object when reports is empty', () => {
        const result = compute([{}, createSession()], emptyContext);
        expect(result).toEqual({});
    });

    it('groups open reports owned by current user by policyID', () => {
        const report1 = createReport('1', {policyID: POLICY_ID_1});
        const report2 = createReport('2', {policyID: POLICY_ID_2});
        const reports = buildReports(report1, report2);

        const result = compute([reports, createSession()], emptyContext);

        expect(Object.keys(result)).toHaveLength(2);
        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: report1});
        expect(result[POLICY_ID_2]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}2`]: report2});
    });

    it('groups multiple reports under the same policyID', () => {
        const report1 = createReport('1', {policyID: POLICY_ID_1});
        const report2 = createReport('2', {policyID: POLICY_ID_1});
        const reports = buildReports(report1, report2);

        const result = compute([reports, createSession()], emptyContext);

        expect(Object.keys(result)).toHaveLength(1);
        expect(result[POLICY_ID_1]).toEqual({
            [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
            [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
        });
    });

    it('excludes reports not owned by current user', () => {
        const ownReport = createReport('1', {ownerAccountID: CURRENT_USER_ACCOUNT_ID});
        const otherReport = createReport('2', {ownerAccountID: OTHER_USER_ACCOUNT_ID});
        const reports = buildReports(ownReport, otherReport);

        const result = compute([reports, createSession()], emptyContext);

        expect(Object.keys(result)).toHaveLength(1);
        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: ownReport});
    });

    it('excludes reports without a policyID', () => {
        const reportWithPolicy = createReport('1', {policyID: POLICY_ID_1});
        const reportWithoutPolicy = createReport('2', {policyID: undefined});
        const reports = buildReports(reportWithPolicy, reportWithoutPolicy);

        const result = compute([reports, createSession()], emptyContext);

        expect(Object.keys(result)).toHaveLength(1);
        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: reportWithPolicy});
    });

    it('includes open reports (stateNum = 0)', () => {
        const report = createReport('1', {stateNum: CONST.REPORT.STATE_NUM.OPEN});
        const reports = buildReports(report);

        const result = compute([reports, createSession()], emptyContext);

        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: report});
    });

    it('includes submitted reports (stateNum = 1)', () => {
        const report = createReport('1', {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED});
        const reports = buildReports(report);

        const result = compute([reports, createSession()], emptyContext);

        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: report});
    });

    it('excludes approved reports (stateNum = 2)', () => {
        const report = createReport('1', {stateNum: CONST.REPORT.STATE_NUM.APPROVED});
        const reports = buildReports(report);

        const result = compute([reports, createSession()], emptyContext);

        expect(result).toEqual({});
    });

    it('treats undefined stateNum as open (defaults to 0)', () => {
        const report = createReport('1', {stateNum: undefined});
        const reports = buildReports(report);

        const result = compute([reports, createSession()], emptyContext);

        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: report});
    });

    it('skips null report entries in collection', () => {
        const report = createReport('1');
        const reports = buildReports(report);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        reports![`${ONYXKEYS.COLLECTION.REPORT}2`] = undefined;

        const result = compute([reports, createSession()], emptyContext);

        expect(Object.keys(result)).toHaveLength(1);
        expect(result[POLICY_ID_1]).toEqual({[`${ONYXKEYS.COLLECTION.REPORT}1`]: report});
    });

    it('returns empty object when session has no accountID', () => {
        const report = createReport('1');
        const reports = buildReports(report);

        const result = compute([reports, {} as Session], emptyContext);

        expect(result).toEqual({});
    });
});
