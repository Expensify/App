import Translator from '@scripts/utils/Translator/Translator';

class TestTranslator extends Translator {
    protected performTranslation(): Promise<string> {
        return Promise.resolve('');
    }

    public estimateCost(): Promise<number> {
        return Promise.resolve(0);
    }

    public getFailedTranslations() {
        return [];
    }
}

describe('Translator - Chinese Brackets Fix', () => {
    let translator: TestTranslator;

    beforeEach(() => {
        translator = new TestTranslator();
    });

    describe('fixChineseBracketsInMarkdown', () => {
        it('should fix Chinese brackets in markdown links', () => {
            const input = '【Click here】(https://example.com)';
            const expected = '[Click here](https://example.com)';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should fix Chinese brackets in markdown images', () => {
            const input = '!【Alt text】(https://example.com/image.png)';
            const expected = '![Alt text](https://example.com/image.png)';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should fix Chinese brackets in reference-style links', () => {
            const input = '【Link text】【ref-id】';
            const expected = '[Link text][ref-id]';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should fix Chinese brackets in reference definitions', () => {
            const input = '【ref-id】: https://example.com "Title"';
            const expected = '[ref-id]: https://example.com "Title"';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should fix Chinese brackets for URLs', () => {
            const input = '【https://example.com】';
            const expected = '[https://example.com]';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should fix Chinese brackets in task list items', () => {
            const input = '- 【x】 Completed task\n- 【 】 Incomplete task';
            const expected = '- [x] Completed task\n- [ ] Incomplete task';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should handle multiple markdown patterns in one text', () => {
            const input = `
                Check out 【this link】(https://example.com) and this image !【screenshot】(image.png).
                Also see 【reference】【1】 and the definition:
                【1】: https://reference.com

                Tasks:
                - 【x】 Done
                - 【 】 Todo
            `.trim();

            const expected = `
                Check out [this link](https://example.com) and this image ![screenshot](image.png).
                Also see [reference][1] and the definition:
                [1]: https://reference.com

                Tasks:
                - [x] Done
                - [ ] Todo
            `.trim();

            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should return original text if no Chinese brackets present', () => {
            const input = '[Normal link](https://example.com) and regular text';
            const expected = '[Normal link](https://example.com) and regular text';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should handle empty string', () => {
            const input = '';
            const expected = '';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should handle nested markdown structures', () => {
            const input = '【【nested】】(url)';
            const expected = '[[nested]](url)';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should handle task lists with different bullet points', () => {
            const input = '* 【x】 Task 1\n+ 【 】 Task 2\n- 【x】 Task 3';
            const expected = '* [x] Task 1\n+ [ ] Task 2\n- [x] Task 3';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });

        it('should handle indented task lists', () => {
            const input = '  - 【x】 Indented task\n    - 【 】 More indented';
            const expected = '  - [x] Indented task\n    - [ ] More indented';
            const result = translator.fixChineseBracketsInMarkdown(input);
            expect(result).toBe(expected);
        });
    });
});
