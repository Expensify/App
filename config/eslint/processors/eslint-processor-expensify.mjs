/**
 * ESLint only allows a single processor per file, so this one chains together
 * all the custom processors we want to run.
 */
import seatbelt from 'eslint-seatbelt';
import reactCompilerCompatProcessor from './eslint-processor-react-compiler-compat.mjs';
import stratifyNoDeprecatedProcessor from './eslint-processor-stratify-no-deprecated.mjs';

const seatbeltProcessor = seatbelt.processors.seatbelt;

export default {
    meta: {name: 'expensify-eslint-processor'},
    supportsAutofix: true,

    preprocess(text, filename) {
        const [textResult] = reactCompilerCompatProcessor.preprocess(text, filename);
        const [afterStratifyPreprocess] = stratifyNoDeprecatedProcessor.preprocess(textResult, filename);
        return seatbeltProcessor.preprocess(afterStratifyPreprocess, filename);
    },

    postprocess(messagesPerBlock, filename) {
        const afterCompilerFilter = reactCompilerCompatProcessor.postprocess(messagesPerBlock, filename);
        const afterStratify = stratifyNoDeprecatedProcessor.postprocess([afterCompilerFilter], filename);
        return seatbeltProcessor.postprocess([afterStratify], filename);
    },
};
