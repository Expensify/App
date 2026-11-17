import {render, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const FIELD_NAME = 'Account number';
const FIELD_VALUE = '000111222333';
const ROW_ACCESSIBILITY_LABEL = `${FIELD_NAME}, ${FIELD_VALUE}`;

describe('MenuItem FullStory class', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('masks a composable row whose value is masked', async () => {
        // Given a composable row with a masked value, like the connected bank account summary
        render(
            <OnyxListItemProvider>
                <MenuItem.Root
                    onPress={jest.fn()}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.FieldName>{FIELD_NAME}</MenuItem.FieldName>
                            <MenuItem.FieldValue forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>{FIELD_VALUE}</MenuItem.FieldValue>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the row builds its accessibility label out of the name and the value
        const row = screen.getByLabelText(ROW_ACCESSIBILITY_LABEL);

        // Then the row itself is masked, because on the web that label is the button's aria-label and would record the value
        expect(row.props.fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('leaves a composable row without masked text unmasked', async () => {
        // Given a composable row whose name and value are both readable
        render(
            <OnyxListItemProvider>
                <MenuItem.Root
                    onPress={jest.fn()}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.FieldName>{FIELD_NAME}</MenuItem.FieldName>
                            <MenuItem.FieldValue>{FIELD_VALUE}</MenuItem.FieldValue>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the row renders
        const row = screen.getByLabelText(ROW_ACCESSIBILITY_LABEL);

        // Then it sets no class, so it keeps the class of its container
        expect(row.props.fsClass).toBeUndefined();
    });

    it('masks a MenuItemField row that passes its own accessibility label', async () => {
        // Given the field preset with a masked value, which names its row itself instead of letting the leaves do it
        render(
            <OnyxListItemProvider>
                <MenuItemField
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    onPress={jest.fn()}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the row renders with the name and the value in its label
        const row = screen.getByLabelText(ROW_ACCESSIBILITY_LABEL);

        // Then the row is masked too, since the masked leaf still reports itself to the row
        expect(row.props.fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('masks a legacy MenuItem row whose title is masked', async () => {
        // Given a legacy row with a masked title, like the rows of ConfirmationStep
        render(
            <OnyxListItemProvider>
                {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- Existing screens like ConfirmationStep still render the legacy row, so its masking needs coverage. */}
                <MenuItem
                    shouldShowDescriptionOnTop
                    description={FIELD_NAME}
                    title={FIELD_VALUE}
                    onPress={jest.fn()}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the row renders, its label repeats the title
        const row = screen.getByRole(CONST.ROLE.BUTTON);

        // Then the row is masked as well as the title
        expect(row.props.fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });
});
