import {fs} from 'memfs';
import type {FsPromisesApi} from 'memfs/lib/node/types';

type PromisesMock = FsPromisesApi;

const promisesMock: PromisesMock = fs.promises;

export default promisesMock;
