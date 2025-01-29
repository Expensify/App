import {exec} from 'child_process';
import type {ChildProcess} from 'child_process';
import * as Logger from './logger';

type PromiseWithAbort = Promise<string | void> & {
    abort?: () => void;
};

/**
 * Executes a command none-blocking by wrapping it in a promise.
 * In addition to the promise it returns an abort function.
 */
export default (command: string, env: NodeJS.ProcessEnv = {} as NodeJS.ProcessEnv): PromiseWithAbort => {
    let childProcess: ChildProcess;
    const promise: PromiseWithAbort = new Promise<string | void>((resolve, reject) => {
        const finalEnv: NodeJS.ProcessEnv = {
            ...process.env,
            ...env,
        };

        Logger.note(command);

        childProcess = exec(
            command,
            {
                maxBuffer: 1024 * 1024 * 10, // Increase max buffer to 10MB, to avoid errors
                env: finalEnv,
            },
            (error, stdout) => {
                if (error) {
                    if (error?.killed) {
                        resolve();
                    } else {
                        Logger.error(`failed with error: ${error.message}`);
                        reject(error);
                    }
                } else {
                    Logger.writeToLogFile(stdout);
                    resolve(stdout);
                }
            },
        );
    });

    promise.abort = () => {
        childProcess.kill('SIGINT');
    };

    return promise;
};

export type {PromiseWithAbort};
