/**
 * ESLint only allows a single processor per file, so this one chains together
 * all the custom processors we want to run.
 */
import seatbelt from 'eslint-seatbelt';
import reactCompilerCompatProcessor from './eslint-processor-react-compiler-compat.mjs';

const seatbeltProcessor = seatbelt.processors.seatbelt;

export default {
    meta: {name: 'expensify-eslint-processor'},
    supportsAutofix: true,

    preprocess(text, filename) {
        const [textResult] = reactCompilerCompatProcessor.preprocess(text, filename);
        return seatbeltProcessor.preprocess(textResult, filename);
    },

    postprocess(messagesPerBlock, filename) {
        const afterCompilerFilter = reactCompilerCompatProcessor.postprocess(messagesPerBlock, filename);
        return seatbeltProcessor.postprocess([afterCompilerFilter], filename);
    },
};
