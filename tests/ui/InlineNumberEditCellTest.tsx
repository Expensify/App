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

// styles.editableCellEditButtonClearance: the gap plus the edit button.
const EDIT_BUTTON_CLEARANCE = variables.spacing2 + variables.editableCellEditButtonSize;

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
        // Given a left-aligned value with an icon after it, where the edit button shows at the trailing edge on hover
        await renderCellWithTrailingContent({textAlign: 'left'});

        // When the row lays out the value and the icon
        const row = getTrailingContentRow();

        // Then it keeps the button's width clear after the icon, so the text truncates before the icon reaches the button
        expect(row).toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });

    it('leaves no clearance when the cell asks not to reserve it', async () => {
        // Given a left-aligned value with an icon after it, in a cell the user can never edit
        await renderCellWithTrailingContent({textAlign: 'left', shouldReserveEditButtonClearance: false});

        // When the row lays out the value and the icon
        const row = getTrailingContentRow();

        // Then no room is left for an edit button the user never sees
        expect(row).not.toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });

    it('leaves no clearance after a right-aligned value, whose edit button shows on the other side', async () => {
        // Given a right-aligned value with an icon after it, where the edit button shows at the leading edge instead
        await renderCellWithTrailingContent({textAlign: 'right'});

        // When the row lays out the value and the icon
        const row = getTrailingContentRow();

        // Then the trailing edge stays free, since the button never covers the icon there
        expect(row).not.toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });
});
