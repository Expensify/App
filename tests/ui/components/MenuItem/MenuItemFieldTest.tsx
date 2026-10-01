import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ArrowRight: () => null,
    })),
}));

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);
const CHEVRON_TEST_ID = 'menu-item-chevron';
const pressEvent = {nativeEvent: {}};
const NAME = 'Legal first name';
const VALUE = 'John';

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItemField', () => {
    beforeEach(() => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
    });

    describe('filled shape', () => {
        it('renders the name and the value', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    />
                </Wrapper>,
            );

            expect(screen.getByText(NAME)).toBeOnTheScreen();
            expect(screen.getByText(VALUE)).toBeOnTheScreen();
        });

        it('announces the name first, then the value', async () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    />
                </Wrapper>,
            );

            expect(await screen.findByLabelText(`${NAME}, ${VALUE}`)).toBeOnTheScreen();
        });

        it('marks only the value as copyable when value selection is enabled', () => {
            // Given a field value that is allowed to start native text selection
            // When the field is rendered
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        isValueSelectable
                    />
                </Wrapper>,
            );

            // Then only the value receives the shared copyable-text marker
            expect(screen.getByText(VALUE)).toHaveStyle({userSelect: 'text'});
            expect(screen.getByText(VALUE)).toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.COPYABLE_TEXT_ELEMENT]: true,
                }),
            );
            expect(screen.getByText(NAME)).not.toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.COPYABLE_TEXT_ELEMENT]: true,
                }),
            );
            expect(screen.getByText(NAME)).toHaveStyle({userSelect: 'none'});
            expect(screen.getByText(NAME)).toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true,
                }),
            );
        });

        it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('keeps browser value selection disabled on %s', async (platform) => {
            // Given a native platform where browser selection handling does not apply
            mockedGetPlatform.mockReturnValue(platform);
            const onPress = jest.fn();

            // When a pressable field opts into browser value selection
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={onPress}
                        isValueSelectable
                    />
                </Wrapper>,
            );

            // Then native text stays unmarked and ordinary row presses still work
            expect(screen.getByText(VALUE)).not.toHaveStyle({userSelect: 'text'});
            expect(screen.getByText(VALUE)).not.toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.COPYABLE_TEXT_ELEMENT]: true,
                }),
            );
            expect(screen.getByText(NAME)).not.toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true,
                }),
            );
            fireEvent.press(await screen.findByLabelText(`${NAME}, ${VALUE}`), pressEvent);
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('keeps disabled interactive values excluded from selection and copied content', () => {
            // Given a disabled interactive field on web
            // When browser value selection is requested
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={() => {}}
                        isDisabled
                        isValueSelectable
                    />
                </Wrapper>,
            );

            // Then selectable styling and metadata cannot override the disabled restriction
            expect(screen.getByText(VALUE)).toHaveStyle({userSelect: 'none'});
            expect(screen.getByText(VALUE)).toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true,
                }),
            );
            expect(screen.getByText(VALUE)).not.toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.COPYABLE_TEXT_ELEMENT]: true,
                }),
            );
        });
    });

    describe('value line count', () => {
        it('keeps the value on a single line by default', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    />
                </Wrapper>,
            );

            expect(screen.getByText(VALUE)).toHaveProp('numberOfLines', 1);
        });

        it('lets the value take the given number of lines', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        numberOfLinesValue={2}
                    />
                </Wrapper>,
            );

            expect(screen.getByText(VALUE)).toHaveProp('numberOfLines', 2);
        });

        it('lets the value grow unbounded given 0', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        numberOfLinesValue={0}
                    />
                </Wrapper>,
            );

            // Every platform reads 0 as "as many lines as it needs"
            expect(screen.getByText(VALUE)).toHaveProp('numberOfLines', 0);
        });
    });

    describe('empty shape', () => {
        it('keeps the placeholder label nonselectable when web value selection is enabled', () => {
            // Given a field without a value to select
            // When its row opts into browser value selection
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        isValueSelectable
                    />
                </Wrapper>,
            );

            // Then the placeholder remains a label rather than a copyable value
            expect(screen.getByText(NAME)).toHaveStyle({userSelect: 'none'});
            expect(screen.getByText(NAME)).toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true,
                }),
            );
            expect(screen.getByText(NAME)).not.toHaveProp(
                'dataSet',
                expect.objectContaining({
                    [CONST.COPYABLE_TEXT_ELEMENT]: true,
                }),
            );
        });

        it.each([
            ['no value prop', undefined],
            ['an empty value', ''],
        ])('renders the name as a placeholder and nothing else given %s', async (_case, value) => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={value}
                    />
                </Wrapper>,
            );

            expect(screen.getByText(NAME)).toBeOnTheScreen();
            expect(screen.queryByText(VALUE)).not.toBeOnTheScreen();
            // The name stands in for the missing value, so it is the whole announced label
            expect(await screen.findByLabelText(NAME)).toBeOnTheScreen();
        });
    });

    describe('trailing cell', () => {
        it('renders no chevron when the row is not pressable', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    />
                </Wrapper>,
            );

            expect(screen.queryByTestId(CHEVRON_TEST_ID)).not.toBeOnTheScreen();
        });

        it('renders a chevron when the row is pressable', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(screen.getByTestId(CHEVRON_TEST_ID)).toBeOnTheScreen();
        });

        it('renders children without a chevron when the row is not pressable', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    >
                        <Text>Badge</Text>
                    </MenuItemField>
                </Wrapper>,
            );

            expect(screen.getByText('Badge')).toBeOnTheScreen();
            expect(screen.queryByTestId(CHEVRON_TEST_ID)).not.toBeOnTheScreen();
        });

        it('renders children alongside the chevron when the row is pressable', () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={() => {}}
                    >
                        <Text>Badge</Text>
                    </MenuItemField>
                </Wrapper>,
            );

            expect(screen.getByText('Badge')).toBeOnTheScreen();
            expect(screen.getByTestId(CHEVRON_TEST_ID)).toBeOnTheScreen();
        });

        it.each([
            ['no children', undefined],
            ['sibling conditionals that all come out false', [false, false]],
        ])('renders no trailing cell given %s', (_, children) => {
            // Given a row that is not pressable, so there is no chevron to put in the trailing cell
            // When its children render nothing, including several conditionals that all came out false
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    >
                        {children}
                    </MenuItemField>
                </Wrapper>,
            );

            // Then no empty trailing cell is drawn to take up the row gap
            expect(screen.UNSAFE_queryAllByType(MenuItemTrailing)).toHaveLength(0);
        });
    });

    describe('press handling', () => {
        it('takes the button role only when pressable', async () => {
            const {unmount} = render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    />
                </Wrapper>,
            );

            expect(await screen.findByLabelText(`${NAME}, ${VALUE}`)).not.toHaveProp('role', CONST.ROLE.BUTTON);
            unmount();

            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={() => {}}
                    />
                </Wrapper>,
            );

            expect(await screen.findByRole(CONST.ROLE.BUTTON, {name: `${NAME}, ${VALUE}`})).toBeOnTheScreen();
        });

        it.each([false, true])('calls onPress for a normal press with isValueSelectable=%s', async (isValueSelectable) => {
            // Given a pressable field with or without native value selection enabled
            const onPress = jest.fn();
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={onPress}
                        isValueSelectable={isValueSelectable}
                    />
                </Wrapper>,
            );

            // When the row is pressed without selecting text
            fireEvent.press(await screen.findByLabelText(`${NAME}, ${VALUE}`), pressEvent);

            // Then the usual row action still runs once
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not call onPress when disabled', async () => {
            const onPress = jest.fn();
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={onPress}
                        isDisabled
                    />
                </Wrapper>,
            );

            fireEvent.press(await screen.findByLabelText(`${NAME}, ${VALUE}`), pressEvent);

            expect(onPress).not.toHaveBeenCalled();
        });
    });
});
