import type {ListItem} from '@components/SelectionList/ListItem/types';
import getListItemAccessibilityProps from '@components/SelectionList/utils/getListItemAccessibilityProps';

import {getBrowser, isMobile} from '@libs/Browser';

import CONST from '@src/CONST';

jest.mock('@libs/Browser', () => ({
    getBrowser: jest.fn(),
    isMobile: jest.fn(),
}));

const mockGetBrowser = jest.mocked(getBrowser);
const mockIsMobile = jest.mocked(isMobile);

const item: ListItem = {text: 'Concierge', alternateText: 'concierge@expensify.com', keyForList: 'concierge'};

describe('getListItemAccessibilityProps', () => {
    beforeEach(() => {
        mockGetBrowser.mockReturnValue(CONST.BROWSER.CHROME);
        mockIsMobile.mockReturnValue(false);
    });

    describe('role resolution', () => {
        it.each([
            ['single-select row defaults to option', {role: CONST.ROLE.BUTTON}, CONST.ROLE.OPTION],
            ['navigational row (shouldUseOptionRole=false) keeps its role', {role: CONST.ROLE.BUTTON, shouldUseOptionRole: false}, CONST.ROLE.BUTTON],
            ['multi-select row keeps its role', {role: CONST.ROLE.BUTTON, canSelectMultiple: true}, CONST.ROLE.BUTTON],
            ['checkbox row keeps checkbox', {role: CONST.ROLE.CHECKBOX}, CONST.ROLE.CHECKBOX],
            ['radio row keeps radio', {role: CONST.ROLE.RADIO}, CONST.ROLE.RADIO],
        ])('%s', (_name, params, expectedRole) => {
            expect(getListItemAccessibilityProps({item, ...params}).role).toBe(expectedRole);
        });
    });

    describe('accessibility state', () => {
        it('exposes aria-selected for selectable options', () => {
            expect(getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, isSelected: true}).accessibilityState).toEqual({selected: true});
            expect(getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, isSelected: false}).accessibilityState).toEqual({selected: false});
        });

        it.each([[CONST.ROLE.CHECKBOX], [CONST.ROLE.RADIO]])('exposes checked (selection) and selected (focus) for %s rows', (role) => {
            expect(getListItemAccessibilityProps({item, role, isSelected: true, isFocused: false}).accessibilityState).toEqual({checked: true, selected: false});
            expect(getListItemAccessibilityProps({item, role, isSelected: false, isFocused: true}).accessibilityState).toEqual({checked: false, selected: true});
        });
    });

    describe('accessibility label', () => {
        it('prefers the explicit label over the item-derived one', () => {
            const {accessibleAndAccessibilityLabel} = getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, accessibilityLabel: 'Custom label'});
            expect(accessibleAndAccessibilityLabel).toEqual({accessible: undefined, accessibilityLabel: 'Custom label'});
        });

        it('derives the label from the item when no explicit label is given', () => {
            const {accessibleAndAccessibilityLabel} = getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON});
            expect(accessibleAndAccessibilityLabel).toEqual({accessible: undefined, accessibilityLabel: 'Concierge, concierge@expensify.com'});
        });
    });

    describe('accessible=false', () => {
        it('hides the row from assistive tech and removes it from the tab order', () => {
            const result = getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, accessible: false, tabIndex: 0});
            expect(result.role).toBe(CONST.ROLE.PRESENTATION);
            expect(result.tabIndex).toBe(-1);
            expect(result.accessibleAndAccessibilityLabel).toEqual({accessible: false});
        });
    });

    describe('aria-current', () => {
        it.each([
            ['set for a selected option on desktop Chrome', {isSelected: true}, CONST.BROWSER.CHROME, false, true],
            ['not set when unselected', {isSelected: false}, CONST.BROWSER.CHROME, false, undefined],
            ['not set on mobile Chrome', {isSelected: true}, CONST.BROWSER.CHROME, true, undefined],
            ['not set on other browsers', {isSelected: true}, CONST.BROWSER.SAFARI, false, undefined],
            ['not set for checkable roles', {isSelected: true, role: CONST.ROLE.CHECKBOX}, CONST.BROWSER.CHROME, false, undefined],
        ])('%s', (_name, params, browser, mobile, expected) => {
            mockGetBrowser.mockReturnValue(browser);
            mockIsMobile.mockReturnValue(mobile);
            expect(getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, ...params}).ariaCurrent).toBe(expected);
        });
    });

    it('passes the tab index through for accessible rows', () => {
        expect(getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, tabIndex: 0}).tabIndex).toBe(0);
        expect(getListItemAccessibilityProps({item, role: CONST.ROLE.BUTTON, tabIndex: -1}).tabIndex).toBe(-1);
    });
});
