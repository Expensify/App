import type {FsPromisesApi} from 'memfs/lib/node/types';

import {fs} from 'memfs';

type PromisesMock = FsPromisesApi;

const promisesMock: PromisesMock = fs.promises;

export default promisesMock;
