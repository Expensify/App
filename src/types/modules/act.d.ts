import type {StepIdentifier} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

declare module '@kie/act-js' {
    type StepIdentifierCustom = {
        id?: string;
        name: string;
        run?: string;
        mockWith?: string;
        with?: string;
        envs?: string[];
        inputs?: string[];
    } & Omit<StepIdentifier, 'name' | 'id' | 'run' | 'mockWith'>;

    export type {StepIdentifier, StepIdentifierCustom};
}
