/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from 'react';

function expose<Args extends any[], Return>(callback: (...args: Args) => Return) {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (event: MessageEvent<Args>) => {
        console.log('hello from web worker', event);
        const args = event.data;

        try {
            const result = callback(...args);
            // eslint-disable-next-line no-restricted-globals
            self.postMessage({result});
        } catch (error) {
            // eslint-disable-next-line no-restricted-globals
            self.postMessage({error});
        }
    };

    return callback;
}

type SingleArgumentFunction<TArgs extends any[], TResult> = (...args: TArgs) => TResult;

type WorkerFunction<TWorker extends (...args: any[]) => any> = Worker & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __workerType?: TWorker;
};

type WorkerFunctionLoader<TWorker extends (...args: any[]) => any> = () => WorkerFunction<TWorker>;

const createWorkerFactory = <TWorker extends SingleArgumentFunction<any[], any>>(loader: WorkerFunctionLoader<TWorker>): WorkerFunctionLoader<TWorker> => loader;

type WorkerMemoResult<Result> =
    | {
          state: 'loading';
      }
    | {
          state: 'data';
          result: Result;
      }
    | {
          state: 'error';
          error: any;
      };

function useWorkerMemo<TArgs extends any[], TResult>(workerFactory: WorkerFunctionLoader<SingleArgumentFunction<TArgs, TResult>>, inputArs: TArgs): WorkerMemoResult<TResult> {
    const [value, setValue] = useState<WorkerMemoResult<TResult>>({state: 'loading'});

    const worker = useMemo(() => workerFactory(), [workerFactory]);

    // Listen for messages from the worker
    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
        worker.onmessage = ({data}: MessageEvent<{result: TResult} | {error: unknown}>) => {
            if ('error' in data) {
                setValue({state: 'error', error: data.error});
            } else {
                setValue({state: 'data', result: data.result});
            }
        };

        return () => {
            worker.terminate();
        };
    }, [worker]);

    // Send the worker the input arguments
    useEffect(() => {
        console.log('sending message to worker', inputArs);
        worker.postMessage(inputArs);
    }, [inputArs, worker]);

    return value;
}

export {expose, useWorkerMemo, createWorkerFactory};
