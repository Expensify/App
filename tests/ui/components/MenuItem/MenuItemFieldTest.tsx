import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ArrowRight: () => null,
    })),
}));

const CHEVRON_TEST_ID = 'menu-item-chevron';
const pressEvent = {nativeEvent: {}};
const NAME = 'Legal first name';
const VALUE = 'John';

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItemField', () => {
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
    });

    describe('empty shape', () => {
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

        it('calls onPress when pressed', async () => {
            const onPress = jest.fn();
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                        onPress={onPress}
                    />
                </Wrapper>,
            );

            fireEvent.press(await screen.findByLabelText(`${NAME}, ${VALUE}`), pressEvent);

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
