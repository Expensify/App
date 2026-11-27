import {render, screen} from '@testing-library/react-native';

import StackedBarChartLegend from '@components/Charts/BarChart/StackedBarChartLegend';
import {getSeriesStacks} from '@components/Charts/utils/stackedBars';

const SUBMITTED = {key: 'submitted', label: 'Submitted', stackIndex: 0};
const APPROVED = {key: 'approved', label: 'Approved', stackIndex: 0};
const PAID = {key: 'paid', label: 'Paid', stackIndex: 0};

describe('Stacked bar chart legend', () => {
    it.each([
        {stages: [SUBMITTED, APPROVED, PAID], groupLabel: 'Previous period, Submitted, Approved, and Paid'},
        {stages: [SUBMITTED, PAID], groupLabel: 'Previous period, Submitted, and Paid'},
    ])('names the current stages once and groups their comparison swatches: $groupLabel', ({stages, groupLabel}) => {
        // Given the previous period uses the same stages as the current period, which may not include approval.
        const comparison = stages.map((stage) => ({...stage, key: `previous-${stage.key}`, stackIndex: 1, stackLabel: 'Previous period'}));

        // When the legend renders both stacks.
        render(<StackedBarChartLegend stacks={getSeriesStacks([...stages, ...comparison])} />);

        // Then each stage is shown once and the comparison group announces the matching stages in order.
        for (const {label} of stages) {
            expect(screen.getByText(label)).toBeOnTheScreen();
        }
        expect(screen.getByText('Previous period', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.getByRole('group', {name: groupLabel})).toBeOnTheScreen();
        expect(screen.queryAllByText('Approved')).toHaveLength(stages.includes(APPROVED) ? 1 : 0);
    });

    it('does not show a comparison group when comparing against the average', () => {
        // Given the chart draws the current stages with an average line instead of a previous-period stack.
        const series = [SUBMITTED, APPROVED, PAID, {key: 'average', label: 'Monthly average', isAverage: true}];

        // When the legend renders the stacks.
        render(<StackedBarChartLegend stacks={getSeriesStacks(series)} />);

        // Then the stage labels stay visible without an extra set of swatches.
        expect(screen.getByText('Submitted')).toBeOnTheScreen();
        expect(screen.getByText('Approved')).toBeOnTheScreen();
        expect(screen.getByText('Paid')).toBeOnTheScreen();
        expect(screen.queryByRole('group')).not.toBeOnTheScreen();
    });
});
