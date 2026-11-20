import {render} from '@testing-library/react-native';

import FocusTrapExtraContainersContext from '@components/FocusTrap/FocusTrapExtraContainersContext';
import FocusTrapForScreen from '@components/FocusTrap/FocusTrapForScreen/index.web';

import type {FocusTrapProps} from 'focus-trap-react';

import React from 'react';

let capturedContainerElements: FocusTrapProps['containerElements'];

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({containerElements, children}: Pick<FocusTrapProps, 'containerElements' | 'children'>) => {
        capturedContainerElements = containerElements;
        return children;
    },
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => true,
    useRoute: () => ({name: 'Settings_Profile_Pronouns'}),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

function createElement(id: string) {
    const element = document.createElement('div');
    element.id = id;
    return element;
}

/** Ids of the trap's containers, because jsdom elements can't be deep-compared. */
const getContainerIds = () => (Array.isArray(capturedContainerElements) ? capturedContainerElements.map((element) => element.id) : capturedContainerElements);

const screenElement = createElement('screen');

/** Renders a screen the way ScreenWrapper does, with the screen's root as the trap's only child. A `div`, because the screen's root on web is one. */
function renderScreen(extraContainerElements: HTMLElement[], containerElements?: HTMLElement[]) {
    const renderTrap = (extras: HTMLElement[]) => (
        <FocusTrapExtraContainersContext.Provider value={extras}>
            <FocusTrapForScreen focusTrapSettings={containerElements ? {containerElements} : undefined}>
                <div />
            </FocusTrapForScreen>
        </FocusTrapExtraContainersContext.Provider>
    );

    // The test renderer leaves refs empty, so the screen's root gets a real element for the trap to list.
    const screen = render(renderTrap(extraContainerElements), {createNodeMock: () => screenElement});

    return {rerenderWithExtras: (extras: HTMLElement[]) => screen.rerender(renderTrap(extras))};
}

describe('FocusTrapForScreen', () => {
    beforeEach(() => {
        capturedContainerElements = undefined;
    });

    it('lets Tab reach an element mounted beside a default screen', () => {
        // Given a handle mounted beside the screen, like the RHP resize handle
        const handleParent = createElement('handleParent');

        // When a screen without custom containers renders under it
        renderScreen([handleParent]);

        // Then the trap cycles through the screen and the handle, so Tab reaches the handle and comes back to the screen
        expect(getContainerIds()).toEqual(['screen', 'handleParent']);
    });

    it('keeps a screen’s custom containers and adds the extra element after them', () => {
        // Given a screen that lists its own containers, which replace the trap's child
        const customContainer = createElement('custom');
        const handleParent = createElement('handleParent');

        // When it renders beside the handle
        renderScreen([handleParent], [customContainer]);

        // Then the trap keeps the screen's containers and still lets Tab reach the handle
        expect(getContainerIds()).toEqual(['custom', 'handleParent']);
    });

    it('keeps trapping the screen after the extra element unmounts', () => {
        // Given a default screen whose trap lists the handle
        const handleParent = createElement('handleParent');
        const {rerenderWithExtras} = renderScreen([handleParent]);

        // When the handle unmounts, e.g. the RHP narrows below the resizable layout
        rerenderWithExtras([]);

        // Then the trap still lists the screen, because the trap reads its child only on creation and would otherwise be left with no container for Tab to cycle in
        expect(getContainerIds()).toEqual(['screen']);
    });
});
