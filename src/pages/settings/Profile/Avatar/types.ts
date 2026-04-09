import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import type {TranslationPaths} from '@src/languages/types';

type ImageData = {
    uri: string;
    name: string;
    type: string;
    file: File | CustomRNImageManipulatorResult | null;
};

type ErrorData = {
    validationError?: TranslationPaths | null | '';
    phraseParam: Record<string, unknown>;
};

export type {ImageData, ErrorData};
