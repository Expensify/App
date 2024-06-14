import type {GithubWorkflowStep, StepIdentifier} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

declare module '@kie/act-js' {
    type CustemStepIdentifier = {
        id?: string;
        name: string;
        run?: string | GithubWorkflowStep;
        mockWith?: string | GithubWorkflowStep;
        with?: string;
        envs?: string[];
        inputs?: string[];
    } & Omit<StepIdentifier, 'name' | 'id' | 'run' | 'mockWith'>;

    export type {GithubWorkflowStep, StepIdentifier, CustemStepIdentifier};
}
