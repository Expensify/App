/**
 * @jest-environment node
 */
import main from '../../scripts/temp';

describe('main', () => {
    it('works', () => {
        const result = main();
        expect(result).toBe(true);
    });
});
