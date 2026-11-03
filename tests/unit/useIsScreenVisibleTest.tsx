import {render} from '@testing-library/react-native';

import ScreenVisibilityProvider from '@components/ScreenWrapper/ScreenVisibilityProvider';

import useIsScreenVisible from '@hooks/useIsScreenVisible';

import React, {useEffect} from 'react';

/** What each effect run saw, as `rowCount:isVisible`, the way a container acts on visibility after a list change. */
let effectRuns: string[] = [];

function Container({rowCount}: {rowCount: number}) {
    const isVisible = useIsScreenVisible();
    useEffect(() => {
        effectRuns.push(`${rowCount}:${isVisible}`);
    }, [isVisible, rowCount]);
    return null;
}

function renderScreen(isVisible: boolean) {
    const utils = render(
        <ScreenVisibilityProvider isVisible={isVisible}>
            <Container rowCount={1} />
        </ScreenVisibilityProvider>,
    );
    effectRuns = [];
    return {
        update: (isNowVisible: boolean, rowCount: number) =>
            utils.rerender(
                <ScreenVisibilityProvider isVisible={isNowVisible}>
                    <Container rowCount={rowCount} />
                </ScreenVisibilityProvider>,
            ),
    };
}

describe('useIsScreenVisible', () => {
    it('sees a cover in the update that makes it, so a row added by that update is never acted on as visible', () => {
        // Given a screen the user can see
        const {update} = renderScreen(true);

        // When one update covers the screen and adds a row
        update(false, 2);

        // Then every effect run for the new row sees the screen covered, so nothing starts a highlight window or a sweep under the cover
        expect(effectRuns).toEqual(['2:false']);
    });

    it('sees an uncover only once it is published, so a row reused in the uncovering update has dropped its wait first', () => {
        // Given a covered screen
        const {update} = renderScreen(false);

        // When one update uncovers the screen and changes its rows
        update(true, 2);

        // Then the first effect run still sees the screen covered, and the next one sees it uncovered
        expect(effectRuns).toEqual(['2:false', '2:true']);
    });
});
