// import-scope: members pulled off the full lodash module instead of individual methods
import {map} from 'lodash';

// valid control: the method package import
import mapValues from 'lodash/mapValues';

export const mapped = map([1, 2, 3], (value: number) => value + 1);
export const values = mapValues({a: 1, b: 2}, (value: number) => value * 2);
