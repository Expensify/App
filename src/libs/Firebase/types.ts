import {FirebasePerformanceTypes} from '@react-native-firebase/perf';

type Trace = {
    trace: FirebasePerformanceTypes.Trace;
    start: number;
};
type TraceMap = Record<string, Trace>;
type StartTrace = (customEventName: string) => void;
type StopTrace = (customEventName: string) => void;

export type {StartTrace, StopTrace, TraceMap};
