import {render, screen, within} from '@testing-library/react-native';

import {InlineNumberEditCell} from '@components/EditableCell';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const TRAILING_CONTENT_TEST_ID = 'trailing-content';
const DISPLAY_TEXT = '$0.73 / mile';

type RenderOptions = {
    textAlign: 'left' | 'right';
    shouldReserveEditButtonClearance?: boolean;
};

async function renderCellWithTrailingContent({textAlign, shouldReserveEditButtonClearance}: RenderOptions) {
    render(
        <LocaleContextProvider>
            <InlineNumberEditCell
                value="0.73"
                currency={CONST.CURRENCY.USD}
                displayText={DISPLAY_TEXT}
                accessibilityLabel="Rate"
                textAlign={textAlign}
                shouldReserveEditButtonClearance={shouldReserveEditButtonClearance}
                canEdit
                onSave={jest.fn()}
            >
                <View testID={TRAILING_CONTENT_TEST_ID} />
            </InlineNumberEditCell>
        </LocaleContextProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

/** The row that lays out the display text and the content after it: the closest view holding both. */
function getTrailingContentRow() {
    let node = screen.getByTestId(TRAILING_CONTENT_TEST_ID).parent;
    while (node) {
        if (typeof node.type === 'string' && within(node).queryByText(DISPLAY_TEXT)) {
            return node;
        }
        node = node.parent;
    }
    throw new Error('Expected the trailing content to sit in a row with the display text');
}

describe('InlineNumberEditCell', () => {
    it('keeps the edit button clear of content after a left-aligned value', async () => {
        // Given a left-aligned value with an icon after it, with the clearance left at its default
        // When the cell renders
        await renderCellWithTrailingContent({textAlign: 'left'});

        // Then the edit button's width stays clear after the icon, since a left-aligned cell shows the button at its trailing edge
        expect(getTrailingContentRow()).toHaveStyle({paddingRight: variables.editableCellEditButtonClearance});
    });

    it('leaves no clearance when the cell asks not to reserve it', async () => {
        // Given a left-aligned value with an icon after it, in an editable cell told not to reserve the clearance
        // When the cell renders
        await renderCellWithTrailingContent({textAlign: 'left', shouldReserveEditButtonClearance: false});

        // Then no room is kept, which is what a table needs for members who never see the button
        expect(getTrailingContentRow()).not.toHaveStyle({paddingRight: variables.editableCellEditButtonClearance});
    });

    it('leaves no clearance after a right-aligned value, whose edit button shows on the other side', async () => {
        // Given a right-aligned value with an icon after it
        // When the cell renders
        await renderCellWithTrailingContent({textAlign: 'right'});

        // Then no room is kept after the icon, since a right-aligned cell shows its edit button at the leading edge
        expect(getTrailingContentRow()).not.toHaveStyle({paddingRight: variables.editableCellEditButtonClearance});
    });
});
