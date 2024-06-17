import type {MockStep as ActMockStep, StepIdentifier as ActStepIdentifier} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

declare module '@kie/act-js' {
    type StepIdentifier = ActStepIdentifier & {
        id?: string;
        name: string;
        run?: string;
        mockWith?: string;
        with?: string;
        envs?: string[];
        inputs?: string[];
    };

    type MockStep = ActMockStep;

    export type {StepIdentifier, MockStep};
}
