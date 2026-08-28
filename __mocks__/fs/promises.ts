import type {IFs} from 'memfs';

import {fs} from 'memfs';

type PromisesMock = IFs['promises'];

const promisesMock: PromisesMock = fs.promises;

export default promisesMock;
