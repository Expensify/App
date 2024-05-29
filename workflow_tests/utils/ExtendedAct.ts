/* eslint-disable @typescript-eslint/dot-notation */
// This eslint-disable comment is here to allow accessing private properties in the Act class
import type {RunOpts, Step, Workflow} from '@kie/act-js';
import {Act} from '@kie/act-js';
import path from 'path';
import JobMocker from './JobMocker';
import type {MockJobs} from './JobMocker';

type ExtendedActOpts = RunOpts & {actor?: string; workflowFile?: string; mockJobs?: MockJobs};

type ActOptions = {
    cwd: string;
    actArguments: string[];
    proxy: unknown;
};

// @ts-expect-error Override shouldn't be done on private methods wait until https://github.com/kiegroup/act-js/issues/77 is resolved or try to create a params workaround
class ExtendedAct extends Act {
    async parseRunOpts(opts?: ExtendedActOpts): Promise<ActOptions> {
        const {cwd, actArguments, proxy} = await super['parseRunOpts'](opts);

        if (opts?.actor) {
            actArguments.push('--actor', opts.actor);
        }

        return {cwd, actArguments, proxy};
    }

    async runEvent(event: string, opts?: ExtendedActOpts): Promise<Step[]> {
        const {mockJobs, ...vanillaOpts} = opts ?? {};

        if (mockJobs) {
            await this.handleJobMocking((workflow) => workflow.events.includes(event), {mockJobs, workflowFile: vanillaOpts.workflowFile, cwd: vanillaOpts.cwd});
        }

        return super.runEvent(event, vanillaOpts);
    }

    async handleJobMocking(filter: (workflow: Workflow) => boolean, opts: ExtendedActOpts): Promise<void[]> {
        let workflowFiles: string[];

        if (opts.workflowFile) {
            workflowFiles = [path.basename(opts.workflowFile)];
        } else if (this['workflowFile'] !== this['cwd']) {
            workflowFiles = [path.basename(this['workflowFile'] as string)];
        } else {
            const availableWorkflows = await this.list(undefined, opts.cwd, opts.workflowFile);
            workflowFiles = availableWorkflows.filter(filter).map((workflow: Workflow) => workflow.workflowFile);
        }

        return workflowFiles.map((workflowFile) => {
            const jobMocker = new JobMocker(workflowFile, opts.cwd ?? (this['cwd'] as string));
            return jobMocker.mock(opts.mockJobs);
        });
    }
}

export default ExtendedAct;
