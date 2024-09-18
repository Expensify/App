import type {ComponentType} from 'react';

type SubStepProps = {
    /** value indicating whether user is editing one of the sub steps */
    isEditing: boolean;

    /** continues to next sub step */
    onNext: (data?: unknown) => void;

    /** moves user to passed sub step */
    onMove: (step: number) => void;

    /** index of currently displayed sub step */
    screenIndex?: number;

    /** moves user to previous sub step */
    prevScreen?: () => void;
};

type UseSubStep<TProps extends SubStepProps> = {
    /** array of components that will become sub steps */
    bodyContent: Array<ComponentType<SubStepProps & TProps>>;

    /** called after each sub step */
    onNextSubStep?: () => void;

    /** called on last sub step */
    onFinished: (data?: unknown) => void;

    /** index of initial sub step to display */
    startFrom?: number;
};

export type {SubStepProps, UseSubStep};
