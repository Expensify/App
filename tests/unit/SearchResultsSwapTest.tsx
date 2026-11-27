import {act, render, screen} from '@testing-library/react-native';

import SearchResultsSwap, {useIsCoveredByPreviousSearchResults, useMarkSearchResultsReady} from '@components/Search/SearchResultsSwap';

import React, {useEffect} from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({opacity0: {opacity: 0}}));

const markReadyByHash = new Map<number, (hash: number) => void>();
const mountCountByHash = new Map<number, number>();
const isCoveredByHash = new Map<number, boolean>();

/** Stands in for Search: registers the callback it would call from its layout callback, and counts its mounts. */
function Results({hash}: {hash: number}) {
    const markSearchResultsReady = useMarkSearchResultsReady();
    markReadyByHash.set(hash, markSearchResultsReady);
    isCoveredByHash.set(hash, useIsCoveredByPreviousSearchResults());
    useEffect(() => {
        mountCountByHash.set(hash, (mountCountByHash.get(hash) ?? 0) + 1);
    }, [hash]);
    return <View testID={`results-${hash}`} />;
}

function Page({hash, shouldWaitForResults = true}: {hash: number; shouldWaitForResults?: boolean}) {
    return (
        <SearchResultsSwap
            hash={hash}
            shouldWaitForResults={shouldWaitForResults}
        >
            <Results
                key={hash}
                hash={hash}
            />
        </SearchResultsSwap>
    );
}

/** The results are hidden from assistive tech while covered, so they are only found among hidden elements. */
function getResults(hash: number) {
    return screen.getByTestId(`results-${hash}`, {includeHiddenElements: true});
}

function getPointerEvents(hash: number) {
    let element = getResults(hash).parent;
    while (element && element.props.pointerEvents === undefined) {
        element = element.parent;
    }
    return element?.props.pointerEvents as unknown;
}

function layOut(hash: number) {
    act(() => markReadyByHash.get(hash)?.(hash));
}

describe('SearchResultsSwap', () => {
    beforeEach(() => {
        markReadyByHash.clear();
        mountCountByHash.clear();
        isCoveredByHash.clear();
    });

    it('keeps the previous results on screen until the new results lay out', () => {
        // Given results that have laid out
        const view = render(<Page hash={1} />);
        layOut(1);

        // When the search changes
        view.rerender(<Page hash={2} />);

        // Then the previous results stay visible, and the new results mount hidden underneath them
        expect(screen.getByTestId('results-1')).toBeOnTheScreen();
        expect(getResults(2)).toBeOnTheScreen();
        expect(screen.getByTestId('results-1')).toBeVisible();
        expect(getResults(2)).not.toBeVisible();

        // When the new results lay out
        layOut(2);

        // Then they replace the previous results, so the list is never empty in between
        expect(screen.queryByTestId('results-1')).not.toBeOnTheScreen();
        expect(screen.getByTestId('results-2')).toBeVisible();
    });

    it('drops the previous results at once when the new results do not report their layout', () => {
        // Given results that have laid out
        const view = render(<Page hash={1} />);
        layOut(1);

        // When the search changes to results that show a skeleton and never report their layout
        view.rerender(
            <Page
                hash={2}
                shouldWaitForResults={false}
            />,
        );

        // Then the previous results are not kept, since nothing would ever replace them
        expect(screen.queryByTestId('results-1')).not.toBeOnTheScreen();
        expect(screen.getByTestId('results-2')).toBeOnTheScreen();
    });

    it('does not keep results that never laid out', () => {
        // Given results that mounted but have not laid out yet, so nothing of them is on screen
        const view = render(<Page hash={1} />);

        // When the search changes
        view.rerender(<Page hash={2} />);

        // Then only the new results are mounted, as there is nothing to keep on screen
        expect(screen.queryByTestId('results-1')).not.toBeOnTheScreen();
        expect(screen.getByTestId('results-2')).toBeOnTheScreen();
    });

    it('takes the held results back without remounting them on a quick return to their search', () => {
        // Given results that laid out and are held while the results of another search mount
        const view = render(<Page hash={1} />);
        layOut(1);
        view.rerender(<Page hash={2} />);

        // When the user returns to the first search before the new results lay out
        view.rerender(<Page hash={1} />);

        // Then the held results show again as the same instance, and the abandoned results unmount
        expect(screen.getByTestId('results-1')).toBeOnTheScreen();
        expect(screen.getByTestId('results-1')).toBeVisible();
        expect(screen.queryByTestId('results-2')).not.toBeOnTheScreen();
        expect(mountCountByHash.get(1)).toBe(1);
    });

    it('keeps the first held results while the user moves on to a third search', () => {
        // Given results that laid out and are held while the results of a second search mount
        const view = render(<Page hash={1} />);
        layOut(1);
        view.rerender(<Page hash={2} />);

        // When the user moves on to a third search before the second results lay out
        view.rerender(<Page hash={3} />);

        // Then the results on screen stay the first ones, until the third results lay out
        expect(screen.getByTestId('results-1')).toBeOnTheScreen();
        expect(screen.queryByTestId('results-2')).not.toBeOnTheScreen();
        layOut(3);
        expect(screen.queryByTestId('results-1')).not.toBeOnTheScreen();
        expect(screen.getByTestId('results-3')).toBeOnTheScreen();
    });

    it('releases the held results when the new results stop waiting for their layout', () => {
        // Given results that laid out and are held while the results of another search mount
        const view = render(<Page hash={1} />);
        layOut(1);
        view.rerender(<Page hash={2} />);

        // When the new search switches to a loading state that never reports its layout
        view.rerender(
            <Page
                hash={2}
                shouldWaitForResults={false}
            />,
        );

        // Then the held results go away instead of staying on screen under the new search
        expect(screen.queryByTestId('results-1')).not.toBeOnTheScreen();
        expect(screen.getByTestId('results-2')).toBeVisible();
    });

    it('tells the new results they are covered, and takes no input on the held results', () => {
        // Given results that laid out and are held while the results of another search mount
        const view = render(<Page hash={1} />);
        layOut(1);
        view.rerender(<Page hash={2} />);

        // Then only the new results know they render under the previous ones
        expect(isCoveredByHash.get(1)).toBe(false);
        expect(isCoveredByHash.get(2)).toBe(true);

        // And the held results do not respond to touches, since they show a frozen state
        expect(getPointerEvents(1)).toBe('none');

        // When the new results lay out
        layOut(2);

        // Then they are no longer covered and take input
        expect(isCoveredByHash.get(2)).toBe(false);
        expect(getPointerEvents(2)).toBe('box-none');
    });
});
