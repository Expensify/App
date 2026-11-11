import type {ColumnAbsorber} from '@components/Table/columnResize/getAbsorbedColumnWidths';
import getAbsorbedColumnWidths from '@components/Table/columnResize/getAbsorbedColumnWidths';

function absorber(columnKey: string, {minWidth = 100, maxWidth = Number.POSITIVE_INFINITY}: {minWidth?: number; maxWidth?: number} = {}): ColumnAbsorber {
    return {columnKey, minWidth, maxWidth};
}

describe('getAbsorbedColumnWidths', () => {
    it('splits an odd delta into whole px, giving the odd pixel to the earlier of two tied absorbers', () => {
        // Given two 200px absorbers with the same room to shrink
        const absorbers = [absorber('a'), absorber('b')];

        // When they absorb a 25px widening
        const widths = getAbsorbedColumnWidths(absorbers, {a: 200, b: 200}, 25);

        // Then they give 13px and 12px, so tracks stay whole px, the row keeps its width, and ties keep render order so a drag and a reload agree
        expect(widths).toEqual({a: 187, b: 188});
    });

    it('rounds fractional start widths and a fractional delta before splitting, so the shares sum exactly', () => {
        // Given three absorbers starting at fractional widths, as a table measured in sub-pixels can hand them over
        const absorbers = [absorber('a'), absorber('b'), absorber('c')];
        const startWidths = {a: 150.4, b: 149.6, c: 200};

        // When they absorb a 12.5px widening
        const widths = getAbsorbedColumnWidths(absorbers, startWidths, 12.5);

        // Then each lands on a whole px and together they give exactly the 13px the delta rounds to, so no fraction is lost or invented
        expect(widths).toEqual({a: 146, b: 145, c: 196});
    });

    it('passes the share of an absorber that hits its minimum on to the rest', () => {
        // Given an absorber that can give 25px, rendered before one that can only give 10px
        const absorbers = [absorber('email'), absorber('role', {minWidth: 190})];

        // When they absorb a 25px widening
        const widths = getAbsorbedColumnWidths(absorbers, {email: 200, role: 200}, 25);

        // Then the tight one stops at its minimum and the other gives the 15px left, so the row still fits
        expect(widths).toEqual({email: 185, role: 190});
    });

    it('passes the share of an absorber that hits its maximum on to the rest', () => {
        // Given an absorber capped 5px above its width, so it truncates long values, next to an uncapped one
        const absorbers = [absorber('card', {maxWidth: 205}), absorber('account')];

        // When they absorb a 25px narrowing
        const widths = getAbsorbedColumnWidths(absorbers, {card: 200, account: 200}, -25);

        // Then the capped one stops at its cap and the other takes the 20px left, so the row still fills the table
        expect(widths).toEqual({card: 205, account: 220});
    });
});
