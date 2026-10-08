import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemAccessibilityContext from '@components/MenuItem/MenuItemAccessibilityContext';

import CONST from '@src/CONST';

import type {ProfilerOnRenderCallback} from 'react';

import React, {Profiler, useContext} from 'react';

jest.mock('@components/ImageSVG', () => () => null);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ArrowRight: () => null,
        DotIndicator: () => null,
    })),
}));

const NAME = 'Passenger';
const VALUE = 'John';
const ROW_LABEL = 'Passenger John';
const REVIEW_REQUIRED = 'Your review is required';

type RowProps = {
    accessibilityLabel?: string;
    shouldShowBrickRoadIndicator?: boolean;
};

function Row({accessibilityLabel, shouldShowBrickRoadIndicator = false}: RowProps) {
    return (
        <MenuItem.Root accessibilityLabel={accessibilityLabel}>
            <MenuItem.Row>
                <MenuItem.Content>
                    <MenuItem.FieldName>{NAME}</MenuItem.FieldName>
                    <MenuItem.FieldValue>{VALUE}</MenuItem.FieldValue>
                </MenuItem.Content>
                {shouldShowBrickRoadIndicator && (
                    <MenuItem.Trailing>
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

/** Renders the row and counts the commits it takes after mounting, i.e. the re-renders registrations cause */
function renderCountingUpdates(props: RowProps) {
    let updates = 0;
    const onRender: ProfilerOnRenderCallback = (id, phase) => {
        if (phase !== 'update') {
            return;
        }
        updates++;
    };

    render(
        <LocaleContextProvider>
            <Profiler
                id="row"
                onRender={onRender}
            >
                <Row {...props} />
            </Profiler>
        </LocaleContextProvider>,
    );

    return () => updates;
}

describe('MenuItem accessibility', () => {
    it('derives the label from the text leaves when the row does not name itself', async () => {
        // Given a row with no explicit label
        render(
            <LocaleContextProvider>
                <Row />
            </LocaleContextProvider>,
        );

        // Then the label is built from the name and the value, top line first
        expect(await screen.findByLabelText(`${NAME}, ${VALUE}`)).toBeOnTheScreen();
    });

    it('still announces facts about a row that names itself', async () => {
        // Given a row that passes its own label, e.g. because its value is an element the text leaves can't read
        render(
            <LocaleContextProvider>
                <Row
                    accessibilityLabel={ROW_LABEL}
                    shouldShowBrickRoadIndicator
                />
            </LocaleContextProvider>,
        );

        // Then the brick road indicator's announcement is appended to that label, as legacy MenuItem does
        expect(await screen.findByLabelText(`${ROW_LABEL}. ${REVIEW_REQUIRED}`)).toBeOnTheScreen();
    });

    describe('re-renders', () => {
        it('does not re-render the leaves when Root picks up their registrations', async () => {
            // Given a leaf-like probe that reads the accessibility context, in a row that derives its label
            const contextValues: unknown[] = [];
            function ContextProbe() {
                contextValues.push(useContext(MenuItemAccessibilityContext));
                return null;
            }
            render(
                <LocaleContextProvider>
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>{NAME}</MenuItem.FieldName>
                                <MenuItem.FieldValue>{VALUE}</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <ContextProbe />
                        </MenuItem.Row>
                    </MenuItem.Root>
                </LocaleContextProvider>,
            );

            // When Root has re-rendered with the derived label
            await screen.findByLabelText(`${NAME}, ${VALUE}`);

            // Then the context value kept its identity, so the probe rendered only once
            expect(contextValues).toHaveLength(1);
        });

        it('costs a row that derives its label a single re-render', async () => {
            // Given a row whose label comes from its text leaves
            const getUpdates = renderCountingUpdates({});

            // When the label has been derived
            await screen.findByLabelText(`${NAME}, ${VALUE}`);

            // Then both leaves registered in the same commit, so Root re-rendered once
            expect(getUpdates()).toBe(1);
        });

        it('costs a row that names itself nothing when it has nothing to announce', async () => {
            // Given a row that names itself, which is what the presets render
            const getUpdates = renderCountingUpdates({accessibilityLabel: ROW_LABEL});

            // When it has mounted
            await screen.findByLabelText(ROW_LABEL);

            // Then its text leaves skipped registering, so Root never re-rendered
            expect(getUpdates()).toBe(0);
        });

        it('costs a row that names itself a single re-render to pick up an announcement', async () => {
            // Given a row that names itself and shows a brick road indicator
            const getUpdates = renderCountingUpdates({accessibilityLabel: ROW_LABEL, shouldShowBrickRoadIndicator: true});

            // When the announcement has landed
            await screen.findByLabelText(`${ROW_LABEL}. ${REVIEW_REQUIRED}`);

            // Then only the announcement registered, and the text leaves stayed out of it
            expect(getUpdates()).toBe(1);
        });
    });
});
