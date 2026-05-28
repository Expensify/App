/**
 * @jest-environment jsdom
 */
/* eslint-disable import/extensions */
const {getActiveElementInfo} = require<{
    getActiveElementInfo: (el: Element | null) => {role: string | null; isRoleSuppressed: boolean};
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

    it('returns null role + isRoleSuppressed=false for a null element', () => {
        expect(getActiveElementInfo(null)).toEqual({role: null, isRoleSuppressed: false});
    });

    it('returns the element role + isRoleSuppressed=false when no suppression marker is present', () => {
        expect(getActiveElementInfo(withRole(document.createElement('div'), 'button'))).toEqual({role: 'button', isRoleSuppressed: false});
    });

    it('reports isRoleSuppressed=true while preserving the real role when the element carries data-suppress-active-role', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-suppress-active-role', 'true');
        expect(getActiveElementInfo(el)).toEqual({role: 'button', isRoleSuppressed: true});
    });

    it('ignores the ring-only data-programmatic-focus marker so generic autofocus keeps its role', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-programmatic-focus', 'true');
        expect(getActiveElementInfo(el)).toEqual({role: 'button', isRoleSuppressed: false});
    });

    it('flips isRoleSuppressed back to false once the marker is removed (post-blur)', () => {
        const el = withRole(document.createElement('div'), 'button');
        el.setAttribute('data-suppress-active-role', 'true');
        expect(getActiveElementInfo(el).isRoleSuppressed).toBe(true);
        el.removeAttribute('data-suppress-active-role');
        expect(getActiveElementInfo(el)).toEqual({role: 'button', isRoleSuppressed: false});
    });
});
