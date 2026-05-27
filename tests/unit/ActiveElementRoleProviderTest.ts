/**
 * @jest-environment jsdom
 */
/* eslint-disable import/extensions */
const {getRoleForActive} = require<{
    getRoleForActive: (el: Element | null) => string | null;
}>('../../src/components/ActiveElementRoleProvider/index.tsx');
/* eslint-enable import/extensions */

// jsdom v20 doesn't reflect ARIAMixin's `role` to a property; stub it for parity with real browsers.
function withRole(el: Element, role: string | null): Element {
    Object.defineProperty(el, 'role', {value: role, configurable: true});
    return el;
}

describe('getRoleForActive', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns null for a null element', () => {
        expect(getRoleForActive(null)).toBeNull();
    });

    it('returns the element role when no programmatic-focus marker is present', () => {
        expect(getRoleForActive(withRole(document.createElement('div'), 'button'))).toBe('button');
    });

    it('returns null when the element carries `data-programmatic-focus="true"` — Button.shouldDisableEnterShortcut therefore stays inactive after a restore (#90838 regression guard)', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-programmatic-focus', 'true');
        expect(getRoleForActive(el)).toBeNull();
    });

    it('returns the element role once the marker is removed (post-blur)', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-programmatic-focus', 'true');
        expect(getRoleForActive(el)).toBeNull();
        el.removeAttribute('data-programmatic-focus');
        expect(getRoleForActive(el)).toBe('button');
    });
});
