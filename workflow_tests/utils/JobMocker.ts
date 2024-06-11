import type {StepIdentifierWithoutOmit} from '@kie/act-js';
import type {PathOrFileDescriptor} from 'fs';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

// eslint-disable-next-line @typescript-eslint/naming-convention
type YamlMockJob = Omit<MockJob, 'runsOn'> & {'runs-on'?: string};

type YamlWorkflow = {
    jobs: Record<string, YamlMockJob>;
};

type MockJob = {
    steps: StepIdentifierWithoutOmit[];
    uses?: string;
    secrets?: string[];
    with?: string;
    outputs?: Record<string, string>;
    runsOn: string;
};

type MockJobs = Record<string, MockJob>;

class JobMocker {
    workflowFile: string;

    cwd: string;

    constructor(workflowFile: string, cwd: string) {
        this.workflowFile = workflowFile;
        this.cwd = cwd;
    }

    mock(mockJobs: MockJobs = {}) {
        const filePath = this.getWorkflowPath();
        const workflow = this.readWorkflowFile(filePath);

        Object.entries(mockJobs).forEach(([jobId, mockJob]) => {
            const job = this.locateJob(workflow, jobId);
            if (job) {
                if (job.uses) {
                    delete job.uses;
                }
                if (job.secrets) {
                    delete job.secrets;
                }
                let jobWith: string | undefined;
                if (job.with) {
                    jobWith = job.with;
                    delete job.with;
                }
                job.steps = mockJob.steps.map((step): StepIdentifierWithoutOmit => {
                    const mockStep: StepIdentifierWithoutOmit = {
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

    locateJob(workflow: YamlWorkflow, jobId: string): YamlMockJob {
        return workflow.jobs[jobId];
    }

    getWorkflowPath(): string {
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

    readWorkflowFile(location: PathOrFileDescriptor): YamlWorkflow {
        const test: YamlWorkflow = yaml.parse(fs.readFileSync(location, 'utf8'));

        return test;
    }

    writeWorkflowFile(location: PathOrFileDescriptor, data: YamlWorkflow) {
        return fs.writeFileSync(location, yaml.stringify(data), 'utf8');
    }
}

export default JobMocker;
export type {MockJob, MockJobs, YamlWorkflow, YamlMockJob};
