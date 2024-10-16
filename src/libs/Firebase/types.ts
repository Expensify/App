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
type FirebaseAttributes = {
    accountId: string;
    personalDetailsLength: string;
    reportsLength: string;
    transactionViolationsLength: string;
};

export type {StartTrace, StopTrace, TraceMap, Log, FirebaseAttributes};
