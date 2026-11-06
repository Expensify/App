import CONST from '@src/CONST';
import {ALL_NAICS, NAICS_MAPPING_WITH_ID} from '@src/NAICS';

describe('NAICS', () => {
    it('includes six-digit leaf codes in ALL_NAICS so they can be searched and shown as selected', () => {
        // Given the flat NAICS list that IndustryCodeSelector searches by prefix
        const ids = ALL_NAICS.map((item) => `${item.id}`);

        // When we look for the codes the industry code form accepts
        const validIndustryCodes = ids.filter((id) => CONST.REGEX.INDUSTRY_CODE.test(id));

        // Then the six-digit leaf codes are present, because only those pass validation and a saved code must be findable
        expect(validIndustryCodes.length).toBeGreaterThan(0);
        expect(ids).toContain('111130');
    });

    it('lists every NAICS code only once', () => {
        // Given the flat NAICS list built by walking the whole tree
        const ids = ALL_NAICS.map((item) => item.id);

        // When we remove duplicates
        const uniqueIds = new Set(ids);

        // Then nothing was removed, so no row shows up twice in the selector
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('still maps a parent code to its child codes', () => {
        // Given a parent code that has children in the NAICS tree
        const children = NAICS_MAPPING_WITH_ID['11113'];

        // When we read its children, which IndustryCodeSelector shows after the parent row is selected
        const childIds = children?.map((child) => `${child.id}`);

        // Then the six-digit leaf code is listed under its parent
        expect(childIds).toContain('111130');
    });
});
