import {render, screen} from '@testing-library/react-native';

import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import DescriptionField from '@components/ReportActionItem/MoneyRequestViewFields/DescriptionField';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
    hasHoverSupport: () => false,
}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 400}));

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <LocaleContextProvider>
            <HTMLEngineProvider>{children}</HTMLEngineProvider>
        </LocaleContextProvider>
    );
}

describe('MenuItem HTML field selection', () => {
    beforeEach(() => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
    });

    it('keeps formatted expense descriptions selectable on mobile web', async () => {
        // Given an editable description on a touch layout where ordinary HTML is not selectable.
        // When the expense allows copying its description.
        render(
            <Wrapper>
                <DescriptionField
                    title="<strong>Team lunch</strong>"
                    copyValue="Team lunch"
                    canEdit
                    onPress={jest.fn()}
                />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then formatted text can still be selected without making the row read-only.
        expect(screen.getByText('Team lunch')).toHaveProp('selectable', true);
    });

    it('keeps plain expense descriptions selectable on mobile web', async () => {
        // Given a description with no HTML tags on the same touch layout.
        // When the expense allows copying its description.
        render(
            <Wrapper>
                <DescriptionField
                    title="Team lunch"
                    copyValue="Team lunch"
                    canEdit
                    onPress={jest.fn()}
                />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then plain descriptions retain the same selection behavior as formatted descriptions.
        expect(screen.getByText(/Team lunch/)).toHaveProp('selectable', true);
    });

    it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('preserves native HTML selection defaults on %s', async (platform) => {
        // Given a native touch layout where the HTML provider disables selection.
        jest.mocked(getPlatform).mockReturnValue(platform);

        // When the row requests browser text selection.
        render(
            <Wrapper>
                <MenuItem.Root shouldAllowTextSelection>
                    <MenuItem.FieldValueHTML>{'<strong>Team lunch</strong>'}</MenuItem.FieldValueHTML>
                </MenuItem.Root>
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the browser-only setting does not override the native provider.
        expect(screen.getByText('Team lunch')).toHaveProp('selectable', false);
    });

    it('preserves inherited HTML selection when the row does not request it', async () => {
        // Given a touch layout whose HTML selection is disabled by default.
        // When an ordinary row displays formatted text.
        render(
            <Wrapper>
                <MenuItem.Root>
                    <MenuItem.FieldValueHTML>{'<strong>Team lunch</strong>'}</MenuItem.FieldValueHTML>
                </MenuItem.Root>
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then unrelated field consumers keep their existing provider configuration.
        expect(screen.getByText('Team lunch')).toHaveProp('selectable', false);
    });
});
