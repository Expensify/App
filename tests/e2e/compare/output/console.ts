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
export default (data: Data, skippedTests: string[]) => {
    // No need to log errors or warnings as these were be logged on the fly
    console.debug('');
    console.debug('❇️  Performance comparison results:');

    console.debug('\n➡️  Significant changes to duration');
    for (const significance of data.significance) {
        printRegularLine(significance);
    }

    console.debug('\n➡️  Meaningless changes to duration');
    for (const meaningless of data.meaningless) {
        printRegularLine(meaningless);
    }

    console.debug('');

    if (skippedTests.length > 0) {
        console.debug(`⚠️ Some tests did not pass successfully, so some results are omitted from final report: ${skippedTests.join(', ')}`);
    }
};

export type {Data, Entry};
