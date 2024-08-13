import {expose} from './index.web';

const worker = expose((input: string) => {
    console.log('[Hanno] hello from web worker');
    return input.length;
});

export default worker;
