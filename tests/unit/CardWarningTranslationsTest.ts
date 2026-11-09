import de from '@src/languages/de';
import el from '@src/languages/el';
import en from '@src/languages/en';
import es from '@src/languages/es';
import fr from '@src/languages/fr';
import italian from '@src/languages/it';
import ja from '@src/languages/ja';
import nl from '@src/languages/nl';
import pl from '@src/languages/pl';
import ptBR from '@src/languages/pt-BR';
import zhHans from '@src/languages/zh-hans';

import ts from '@typescript/typescript6';
import {readFileSync} from 'fs';
import path from 'path';

const locales = [
    ['en', en],
    ['de', de],
    ['el', el],
    ['es', es],
    ['fr', fr],
    ['it', italian],
    ['ja', ja],
    ['nl', nl],
    ['pl', pl],
    ['pt-BR', ptBR],
    ['zh-hans', zhHans],
] as const;
const descriptionKeys = new Set(['removeCardDescription', 'unassignCardDescription', 'unassignCardsDescription']);

describe('card warning translations', () => {
    it.each(locales)('keeps every %s warning as one complete interpolated sentence', (locale, translations) => {
        // Given the same TypeScript parser used by the translation generator
        const filePath = path.resolve(__dirname, '../../src/languages', `${locale}.ts`);
        const sourceFile = ts.createSourceFile(filePath, readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
        const warnings: ts.PropertyAssignment[] = [];
        const visit = (node: ts.Node) => {
            if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && descriptionKeys.has(node.name.text)) {
                warnings.push(node);
            }
            ts.forEachChild(node, visit);
        };

        // When extracting the warning functions
        visit(sourceFile);

        // Then each warning is one template expression, not fragments that could be translated independently
        expect(warnings).toHaveLength(descriptionKeys.size);
        for (const warning of warnings) {
            expect(ts.isArrowFunction(warning.initializer)).toBe(true);
            if (!ts.isArrowFunction(warning.initializer)) {
                throw new Error('Expected a warning function');
            }
            const body = warning.initializer.body;
            expect(ts.isTemplateExpression(body)).toBe(true);
            if (!ts.isTemplateExpression(body)) {
                throw new Error('Expected a complete warning template');
            }
            expect(body.templateSpans).toHaveLength(1);
            expect(body.templateSpans.at(0)?.expression.getText(sourceFile)).toBe('transactionsUrl');
        }

        // And every rendered warning has exactly one valid anchor containing the URL and localized label
        const {removeCardDescription, unassignCardDescription, unassignCardsDescription} = translations.workspace.moreFeatures.companyCards;
        for (const describeWarning of [removeCardDescription, unassignCardDescription, unassignCardsDescription]) {
            const html = describeWarning('https://new.expensify.com/search');
            if (typeof html !== 'string') {
                throw new Error('Expected warning text, not plural forms');
            }
            expect(html).toMatch(/<a href="https:\/\/new\.expensify\.com\/search">[^<]+<\/a>/);
            expect(html.match(/<a /g)).toHaveLength(1);
        }
    });
});
