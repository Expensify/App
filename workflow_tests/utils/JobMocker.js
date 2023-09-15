const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const _ = require('underscore');

class JobMocker {
    constructor(workflowFile, cwd) {
        this.workflowFile = workflowFile;
        this.cwd = cwd;
    }

    async mock(mockJobs) {
        const filePath = this.getWorkflowPath();
        const workflow = await this.readWorkflowFile(filePath);
        Object.entries(mockJobs).forEach(([jobId, mockJob]) => {
            const job = this.locateJob(workflow, jobId);
            if (job) {
                if (job.uses) {
                    delete job.uses;
                }
                if (job.secrets) {
                    delete job.secrets;
                }
                let jobWith;
                if (job.with) {
                    jobWith = job.with;
                    delete job.with;
                }
                job.steps = _(mockJob.steps).map((step) => {
                    const mockStep = {
                        name: step.name,
                        run: step.mockWith,
                    };
                    if (step.id) {
                        mockStep.id = step.id;
                    }
                    if (jobWith) {
                        mockStep.with = jobWith;
                    }
                    return mockStep;
                });
                if (mockJob.outputs) {
                    job.outputs = mockJob.outputs;
                }
                if (mockJob.runsOn) {
                    job['runs-on'] = mockJob.runsOn;
                }
            } else {
                throw new Error('Could not find job');
            }
        });
        return this.writeWorkflowFile(filePath, workflow);
    }

    locateJob(workflow, jobId) {
        return workflow.jobs[jobId];
    }

    getWorkflowPath() {
        if (fs.existsSync(path.join(this.cwd, this.workflowFile))) {
            return path.join(this.cwd, this.workflowFile);
        }
        if (this.cwd.endsWith('.github')) {
            return path.join(this.cwd, 'workflows', this.workflowFile);
        }
        if (fs.existsSync(path.join(this.cwd, '.github', 'workflows', this.workflowFile))) {
            return path.join(this.cwd, '.github', 'workflows', this.workflowFile);
        }
        throw new Error(`Could not locate ${this.workflowFile}`);
    }

    async readWorkflowFile(location) {
        return yaml.parse(fs.readFileSync(location, 'utf8'));
    }

    async writeWorkflowFile(location, data) {
        return fs.writeFileSync(location, yaml.stringify(data), 'utf8');
    }
}

module.exports = {
    JobMocker,
};
