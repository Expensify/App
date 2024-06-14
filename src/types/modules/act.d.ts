import type {StepIdentifier as ActStepIdentifier, GithubWorkflowStep, StepIdentifierUsingId, StepIdentifierUsingName} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

declare module '@kie/act-js' {
    type CustemStepIdentifier = {
        id?: string;
        name: string;
        run?: string | GithubWorkflowStep;
        mockWith?: string | GithubWorkflowStep;
        with?: string;
        envs?: string[];
        inputs?: string[];
    };

    type StepIdentifier = ActStepIdentifier;

    export type {StepIdentifierUsingId, StepIdentifierUsingName, GithubWorkflowStep, StepIdentifier, CustemStepIdentifier};
}
