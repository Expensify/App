/* eslint-disable @typescript-eslint/dot-notation */
// This eslint-disable comment is here to allow accessing private properties in the Act class
import type {RunOpts, Workflow} from '@kie/act-js';
import * as kieActJs from '@kie/act-js';
import path from 'path';
import {JobMocker} from './JobMocker';
import type {MockJob} from './JobMocker';

type ExtendedActOpts = RunOpts & {actor?: string; workflowFile?: string; mockJobs?: Record<string, MockJob>};

// @ts-expect-error Override shouldn't be done on private methods - wait until the issue is resolved
class ExtendedAct extends kieActJs.Act {
    async parseRunOpts(opts?: ExtendedActOpts) {
        const {cwd, actArguments, proxy} = await super['parseRunOpts'](opts);
        if (opts?.actor) {
            actArguments.push('--actor', opts.actor);
        }
        return {cwd, actArguments, proxy};
    }

    async runEvent(event: string, opts?: ExtendedActOpts) {
        const {mockJobs, ...vanillaOpts} = opts ?? {};

        if (mockJobs) {
            await this.handleJobMocking((workflow) => workflow.events.includes(event), {mockJobs, workflowFile: opts?.workflowFile, cwd: opts?.cwd});
        }
        return super.runEvent(event, vanillaOpts);
    }

    async handleJobMocking(filter: (workflow: Workflow) => boolean, opts?: ExtendedActOpts) {
        let workflowFiles: string[];
        if (opts?.workflowFile) {
            workflowFiles = [path.basename(opts.workflowFile)];
        } else if (this['workflowFile'] !== this['cwd']) {
            workflowFiles = [path.basename(this['workflowFile'])];
        } else {
            const availableWorkflows = await this.list(undefined, opts?.cwd, opts?.workflowFile);
            workflowFiles = availableWorkflows.filter(filter).map((workflow: Workflow) => workflow.workflowFile);
        }
        return Promise.all(
            workflowFiles.map((workflowFile) => {
                const jobMocker = new JobMocker(workflowFile, opts?.cwd ?? this['cwd']);
                return jobMocker.mock(opts?.mockJobs);
            }),
        );
    }
}

// eslint-disable-next-line import/prefer-default-export
export {ExtendedAct};
