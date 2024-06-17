import type {EventJSON} from '@kie/act-js/build/src/action-event/action-event.types';
import type {StepIdentifier as ActStepIdentifier, MockStep} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

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

    export type {StepIdentifier, MockStep, EventJSON};
}
