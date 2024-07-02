type HandleComposerUpdateArgs = {
    // The full new text you'd like to display in the composer
    fullNewText: string;
    // The difference between the new text and the previous text
    diffText: string;
    // The position of the end of the newly added text
    endPositionOfNewAddedText: number;
    // Whether to debounce the saving of the comment
    shouldDebounceSaveComment: boolean;
};

type HandleComposerUpdateCallback = (args: HandleComposerUpdateArgs) => void;

export type {HandleComposerUpdateArgs, HandleComposerUpdateCallback};
