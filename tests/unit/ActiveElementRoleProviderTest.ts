/**
 * @jest-environment jsdom
 */
/* eslint-disable import/extensions */
const {getActiveElementInfo} = require<{
    getActiveElementInfo: (el: Element | null) => {role: string | null; isProgrammatic: boolean};
}>('../../src/components/ActiveElementRoleProvider/index.tsx');
/* eslint-enable import/extensions */

/*
 * jsdom v20 doesn't reflect ARIAMixin's `role` to a property; stub it for parity with real browsers.
 */
function withRole(el: Element, role: string | null): Element {
    Object.defineProperty(el, 'role', {value: role, configurable: true});
    return el;
}

describe('getActiveElementInfo', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns null role + isProgrammatic=false for a null element', () => {
        expect(getActiveElementInfo(null)).toEqual({role: null, isProgrammatic: false});
    });

    it('returns the element role + isProgrammatic=false when no programmatic-focus marker is present', () => {
        expect(getActiveElementInfo(withRole(document.createElement('div'), 'button'))).toEqual({role: 'button', isProgrammatic: false});
    });

    it('reports isProgrammatic=true (preserving the real role) when `data-programmatic-focus="true"` — `useActiveElementRole` filters this to null for `Button.shouldDisableEnterShortcut` (#90838 regression guard)', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-programmatic-focus', 'true');
        expect(getActiveElementInfo(el)).toEqual({role: 'button', isProgrammatic: true});
    });

    it('flips isProgrammatic back to false once the marker is removed (post-blur)', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-programmatic-focus', 'true');
        expect(getActiveElementInfo(el).isProgrammatic).toBe(true);
        el.removeAttribute('data-programmatic-focus');
        expect(getActiveElementInfo(el)).toEqual({role: 'button', isProgrammatic: false});
    });
});
