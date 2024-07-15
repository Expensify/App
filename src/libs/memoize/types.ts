import type {Cache} from './cache/types';
import type {MemoizeStats} from './stats';

type KeyComparator = <K>(key1: K[], key2: K[]) => boolean;

type InternalOptions = {
    cache: 'array';
};

type Options = {
    maxSize: number;
    equality: 'deep' | 'shallow' | KeyComparator;
    monitor: boolean;
    maxArgs?: number;
    monitoringName?: string;
} & InternalOptions;

type ClientOptions = Partial<Omit<Options, keyof InternalOptions>>;

type Stats = Pick<MemoizeStats, 'startMonitoring' | 'stopMonitoring'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFnPredicate = (...args: any[]) => any;

type MemoizedFn<Fn extends MemoizeFnPredicate> = Fn & {cache: Cache<Parameters<Fn>, ReturnType<Fn>>} & Stats;

export type {Options, ClientOptions, MemoizedFn, KeyComparator, MemoizeFnPredicate, Stats};
