import type {StepIdentifier as ActStepIdentifier} from '@kie/act-js/build/src/step-mocker/step-mocker.types';

declare module '@kie/act-js' {
    // eslint-disable-next-line rulesdir/no-inline-named-export
    export declare type StepIdentifier = {
        id?: string;
        name: string;
        run?: string;
        mockWith?: string;
        with?: string;
        envs?: string[];
        inputs?: string[];
    } & Omit<ActStepIdentifier, 'name' | 'id' | 'run' | 'mockWith'>;
}
