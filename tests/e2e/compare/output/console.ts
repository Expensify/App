import type {Unit} from '@libs/E2E/types';
import type {Stats} from '../../measure/math';
import * as format from './format';

type Entry = {
    name: string;
    baseline: Stats;
    current: Stats;
    diff: number;
    relativeDurationDiff: number;
    isDurationDiffOfSignificance: boolean;
    unit: Unit;
};

type Data = {
    significance: Entry[];
    meaningless: Entry[];
    errors?: string[];
    warnings?: string[];
};

const printRegularLine = (entry: Entry) => {
    console.debug(` - ${entry.name}: ${format.formatMetricDiffChange(entry)}`);
};

/**
 * Prints the result simply to console.
 */
export default (data: Data) => {
    // No need to log errors or warnings as these were be logged on the fly
    console.debug('');
    console.debug('❇️  Performance comparison results:');

    console.debug('\n➡️  Significant changes to duration');
    data.significance.forEach(printRegularLine);

    console.debug('\n➡️  Meaningless changes to duration');
    data.meaningless.forEach(printRegularLine);

    console.debug('');
};

export type {Data, Entry};
