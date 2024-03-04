type Selection = {
    start: number;
    end: number;
};

type FocusComposerWithDelay = (shouldDelay?: boolean, forceSetSelection?: Selection) => void;

export type {Selection, FocusComposerWithDelay};
