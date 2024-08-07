import type {FirebasePerformanceTypes} from '@react-native-firebase/perf';

type Trace = {
    trace: FirebasePerformanceTypes.Trace;
    start: number;
};
type TraceMap = Record<string, Trace>;
type StartTrace = (customEventName: string, attributes?: FirebaseAttributes) => void;
type StopTrace = (customEventName: string) => void;
type Log = (action: string) => void;
type FirebaseAttributes = {
    personalDetailsLength: string;
    reportsLength: string;
};

export type {StartTrace, StopTrace, TraceMap, Log, FirebaseAttributes};
