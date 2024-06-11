import type {StepIdentifier as ActStepIdentifier} from '@kie/act-js';

declare module '@kie/act-js' {
    type StepIdentifierWithoutOmit = {
        id?: string;
        name: string;
        run?: string;
        mockWith?: string;
        with?: string;
        envs?: string[];
        inputs?: string[];
    };

    type StepIdentifier = StepIdentifierWithoutOmit & Omit<ActStepIdentifier, 'name' | 'id' | 'run' | 'mockWith'>;

    export type {StepIdentifier, StepIdentifierWithoutOmit};
}
