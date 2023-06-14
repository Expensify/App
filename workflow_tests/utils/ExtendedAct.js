const kieActJs = require('@kie/act-js');
const path = require('path');
const _ = require('underscore');
const JobMocker = require('./JobMocker');

class ExtendedAct extends kieActJs.Act {
    async parseRunOpts(opts) {
        const {cwd, actArguments, proxy} = await super.parseRunOpts(opts);
        if (opts && opts.actor) {
            actArguments.push('--actor', opts.actor);
        }
        return {cwd, actArguments, proxy};
    }

    async runEvent(event, opts) {
        const {mockJobs, ...vanillaOpts} = opts;
        if (mockJobs) {
            await this.handleJobMocking((workflow) => workflow.events.includes(event), {mockJobs, workflowFile: opts.workflowFile, cwd: opts.cwd});
        }
        return super.runEvent(event, vanillaOpts);
    }

    async handleJobMocking(filter, opts) {
        let workflowFiles;
        if (opts.workflowFile) {
            workflowFiles = [path.basename(opts.workflowFile)];
        } else if (this.workflowFile !== this.cwd) {
            workflowFiles = [path.basename(this.workflowFile)];
        } else {
            workflowFiles = _(_(await this.list(undefined, opts.cwd, opts.workflowFile)).filter(filter)).map((l) => l.workflowFile);
        }
        return Promise.all(
            _(workflowFiles).map((workflowFile) => {
                // eslint-disable-next-line es/no-nullish-coalescing-operators
                const jobMocker = new JobMocker.JobMocker(workflowFile, opts.cwd ?? this.cwd);
                return jobMocker.mock(opts.mockJobs);
            }),
        );
    }
}

module.exports = {
    ExtendedAct,
};
