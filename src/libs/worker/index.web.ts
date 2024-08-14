/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useRef, useState} from 'react';

function expose<Args extends any[], Return>(callback: (...args: Args) => Return) {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (event: MessageEvent<Args>) => {
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

    const workerRef = useRef<Worker>();
    // Listen for messages from the worker
    useEffect(() => {
        workerRef.current = workerFactory();
        console.log('[Hanno] Worker created');

        // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
        workerRef.current.onmessage = ({data}: MessageEvent<{result: TResult} | {error: unknown}>) => {
            if ('error' in data) {
                setValue({state: 'error', error: data.error});
            } else {
                setValue({state: 'data', result: data.result});
            }
        };

        return () => {
            workerRef.current?.terminate();
            workerRef.current = undefined;
            console.log('[Hanno] Worker terminated');
        };
    }, [workerFactory]);

    // Send the worker the input arguments
    useEffect(
        function myLovelyEffect() {
            const worker = workerRef.current;
            if (!worker) {
                return;
            }

            try {
                console.log('sending message to worker', inputArs);
                worker.postMessage(inputArs);
            } catch (error) {
                setValue({state: 'error', error});
            }
        },
        [inputArs],
    );

    return value;
}

export {expose, useWorkerMemo, createWorkerFactory};
