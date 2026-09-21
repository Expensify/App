import {render, renderHook, screen} from '@testing-library/react-native';

import type ImageSVGProps from '@components/ImageSVG/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

const mockImageSVGSpy = jest.fn<void, [ImageSVGProps]>();

jest.mock('@components/ImageSVG', () => (props: ImageSVGProps) => {
    mockImageSVGSpy(props);
    return null;
});

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ArrowRight: () => null,
        DotIndicator: () => null,
    })),
}));

const BRICK_ROAD_INDICATOR_TEST_ID = 'menu-item-brick-road-indicator';
const NAME = 'Legal first name';
const VALUE = 'John';
const REVIEW_REQUIRED = 'Your review is required';

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('MenuItemBrickRoadIndicator', () => {
    beforeEach(() => {
        mockImageSVGSpy.mockClear();
    });

    it('renders the dot in the trailing cell', () => {
        render(
            <Wrapper>
                <MenuItemField
                    name={NAME}
                    value={VALUE}
                >
                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                </MenuItemField>
            </Wrapper>,
        );

        expect(screen.getByTestId(BRICK_ROAD_INDICATOR_TEST_ID)).toBeOnTheScreen();
    });

    it.each([
        [CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, 'danger'],
        [CONST.BRICK_ROAD_INDICATOR_STATUS.INFO, 'success'],
    ] as const)('paints the dot with the %s color', (status, themeColor) => {
        const {result} = renderHook(() => useTheme());

        render(
            <Wrapper>
                <MenuItemField
                    name={NAME}
                    value={VALUE}
                >
                    <MenuItem.BrickRoadIndicator status={status} />
                </MenuItemField>
            </Wrapper>,
        );

        expect(mockImageSVGSpy).toHaveBeenCalledWith(expect.objectContaining({fill: result.current[themeColor]}));
    });

    describe('accessibility', () => {
        it('announces that the row needs a review after the label', async () => {
            render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                </Wrapper>,
            );

            expect(await screen.findByLabelText(`${NAME}, ${VALUE}. ${REVIEW_REQUIRED}`)).toBeOnTheScreen();
        });

        it('stops announcing it once the dot is gone', async () => {
            const {rerender} = render(
                <Wrapper>
                    <MenuItemField
                        name={NAME}
                        value={VALUE}
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                </Wrapper>,
            );

            rerender(
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
});
