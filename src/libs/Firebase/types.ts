import type {PerformanceTrace} from '@firebase/performance';
import type {FirebasePerformanceTypes} from '@react-native-firebase/perf';

type Trace = {
    trace: FirebasePerformanceTypes.Trace | PerformanceTrace;
    start: number;
};
type TraceMap = Record<string, Trace>;
type StartTrace = (customEventName: string) => void;
type StopTrace = (customEventName: string) => void;
type Log = (action: string) => void;
type PerfAttributes = {
    accountId: string;
    personalDetailsLength: string;
    reportsLength: string;
    reportActionsLength: string;
    transactionViolationsLength: string;
    policiesLength: string;
    transactionsLength: string;
    policyType: string;
    policyRole: string;
};

// TODO confirm which attributes are required for Firebase
type FirebaseAttributes = Pick<PerfAttributes, 'accountId' | 'personalDetailsLength' | 'reportActionsLength' | 'reportsLength' | 'policiesLength'>;

export type {StartTrace, StopTrace, TraceMap, Log, PerfAttributes, FirebaseAttributes};
