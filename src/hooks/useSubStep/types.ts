import {ComponentType} from 'react';

type SubStepProps = {
    isEditing: boolean;
    onNext: () => void;
    onMove: (step: number) => void;
    screenIndex?: number;
    prevScreen?: () => void;
};

type UseSubStep = {
    bodyContent: Array<ComponentType<SubStepProps>>;
    onFinished: () => void;
    startFrom?: number;
};

export type {SubStepProps, UseSubStep};
