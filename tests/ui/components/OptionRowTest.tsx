import {render, renderHook} from '@testing-library/react-native';

import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import ReportAvatar from '@components/Avatar/connected/ReportAvatar';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DisplayNames from '@components/DisplayNames';
import type HoverableProps from '@components/Hoverable/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionRow from '@components/OptionRow';
import type {OptionRowProps} from '@components/OptionRow';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';

import type {TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {DynamicColorIOS, StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Avatar/connected/AccountAvatar', () => jest.fn(() => null));
jest.mock('@components/Avatar/connected/ReportAvatar', () => jest.fn(() => null));
jest.mock('@components/DisplayNames', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestAmountInput', () => jest.fn(() => null));
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: HoverableProps) => (typeof children === 'function' ? children(true) : children),
}));

describe('OptionRow production composition', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('renders a report-less account and truncates participants before real tooltip sorting', async () => {
        // Given personal-details producers with a final alphabetically first user beyond the tooltip limit.
        const participants = Array.from({length: 11}, (_, index) => createMock<PersonalDetails>({accountID: index + 1, login: `${index === 10 ? 'aaa' : 'user'}${index}@example.com`}));
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, Object.fromEntries(participants.map((participant) => [participant.accountID, participant])));
        await waitForBatchedUpdatesWithAct();
        const option = createMock<OptionRowProps['option']>({
            keyForList: '1',
            accountID: 1,
            reportID: undefined,
            text: 'Selected contact',
            participantsList: participants,
            icons: [{source: 'avatar.png', type: CONST.ICON_TYPE_AVATAR, id: 1}],
        });
        // When the real row calls the real tooltip implementation and chooses its avatar branch.
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <OptionRow option={option} />
            </ComposeProviders>,
        );
        // Then the account route is retained and the eleventh participant never enters the sorted tooltip set.
        expect(AccountAvatar).toHaveBeenCalled();
        expect(ReportAvatar).not.toHaveBeenCalled();
        const displayProps = jest.mocked(DisplayNames).mock.calls.at(-1)?.[0];
        expect(displayProps).toBeDefined();
        expect(displayProps?.displayNamesWithTooltips).toHaveLength(10);
        expect(displayProps?.displayNamesWithTooltips?.map((participant) => participant.accountID)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
        expect(displayProps?.displayNamesWithTooltips?.map((participant) => participant.accountID)).not.toContain(11);
    });

    it('passes an opaque hover color to the report avatar and lets focus take precedence', () => {
        // Given the native dynamic-color producer, which must not be converted to a string.
        const color = DynamicColorIOS({light: '#eeeeee', dark: '#111111'});
        expect(typeof color).toBe('object');
        const option = createMock<OptionRowProps['option']>({keyForList: '123', reportID: '123', text: 'Report', icons: [{source: 'avatar.png', type: CONST.ICON_TYPE_AVATAR, id: 1}]});
        const {result} = renderHook(useThemeStyles);
        // When the hovered row renders and then gains keyboard focus.
        const {rerender} = render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <OptionRow
                    option={option}
                    hoverStyle={{backgroundColor: color}}
                />
            </ComposeProviders>,
        );
        const hoveredProps = jest.mocked(ReportAvatar).mock.calls.at(-1)?.[0];
        expect(hoveredProps).toBeDefined();
        expect(hoveredProps?.backdropColor).toBe(color);
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <OptionRow
                    option={option}
                    hoverStyle={{backgroundColor: color}}
                    optionIsFocused
                />
            </ComposeProviders>,
        );
        // Then focus uses the active surface while hover preserves the exact ColorValue identity.
        const focusedProps = jest.mocked(ReportAvatar).mock.calls.at(-1)?.[0];
        expect(focusedProps).toBeDefined();
        expect(focusedProps?.backdropColor).toBe(result.current.sidebarLinkActive.backgroundColor);
    });

    it.each([0, 17])('returns only paddingLeft=%s in a fresh style accepted by text and view consumers', (paddingLeft) => {
        // Given the real padding producer serves both text and view compositions.
        const {result} = renderHook(useStyleUtils);
        // When each consumer receives the narrow producer result without rebuilding it.
        const textStyle: TextStyle = result.current.getPaddingLeft(paddingLeft);
        const viewStyle: ViewStyle = result.current.getPaddingLeft(paddingLeft);
        // Then zero and nonzero values preserve their only field and each call owns its object.
        expect(textStyle).toEqual({paddingLeft});
        expect(viewStyle).toEqual({paddingLeft});
        expect(textStyle).not.toBe(viewStyle);
    });

    it('preserves the amount-input padding order through the existing style helper', () => {
        // Given the amount-input fields consumed by OptionRow, without unrelated report defaults.
        const option = createMock<OptionRowProps['option']>({
            keyForList: 'amount',
            text: 'Amount',
            shouldShowAmountInput: true,
            amountInputProps: {prefixCharacter: '$', currency: 'USD', amount: 100},
        });
        const {result} = renderHook(() => ({styles: useThemeStyles(), utils: useStyleUtils()}));
        // When the row composes the actual prefix padding and renders the amount input leaf.
        const {rerender} = render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <OptionRow option={option} />
            </ComposeProviders>,
        );
        const inputProps = jest.mocked(MoneyRequestAmountInput).mock.calls.at(-1)?.[0];
        // Then the padding helper follows the existing base styles and wins for paddingLeft.
        expect(inputProps).toBeDefined();
        expect(StyleSheet.flatten(inputProps?.inputStyle).paddingLeft).toBe(result.current.utils.getCharacterPadding('$') + result.current.styles.pl1.paddingLeft);
        // When the caller supplies zero padding, its style must override the computed prefix padding.
        const amountInputProps = option.amountInputProps;
        expect(amountInputProps).toBeDefined();
        if (!amountInputProps) {
            throw new Error('Amount input props are missing');
        }
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <OptionRow option={{...option, amountInputProps: {...amountInputProps, inputStyle: {paddingLeft: 0}}}} />
            </ComposeProviders>,
        );
        const overridden = jest.mocked(MoneyRequestAmountInput).mock.calls.at(-1)?.[0];
        // Then base, computed and caller ordering preserves even a zero override.
        expect(overridden).toBeDefined();
        expect(StyleSheet.flatten(overridden?.inputStyle).paddingLeft).toBe(0);
    });
});
