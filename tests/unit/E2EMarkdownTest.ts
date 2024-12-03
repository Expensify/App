import {compareResults} from '../e2e/compare/compare';
import {buildMarkdown} from '../e2e/compare/output/markdown';

const results = {
    main: {
        commentLinking: [100.5145680010319, 121.8861090019345, 112.0048420019448, 124.26110899820924, 135.1571460030973, 140.33837900310755, 160.7034499980509, 158.5825610011816],
    },
    delta: {
        commentLinking: [361.5145680010319, 402.8861090019345, 412.0048420019448, 414.26110899820924, 425.1571460030973, 440.33837900310755, 458.7034499980509, 459.5825610011816],
    },
};

describe('markdown formatter', () => {
    it('should format significant changes properly', () => {
        const data = compareResults(results.main, results.delta, {commentLinking: 'ms'});
        expect(buildMarkdown(data)).toMatchSnapshot();
    });
});
