/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import StringUtils from '@libs/StringUtils';
import generateTranslations from '../../scripts/generateTranslations';

jest.mock('openai');

let tempDir: string;
let LANGUAGES_DIR: string;
let EN_PATH: string;
let IT_PATH: string;

describe('generateTranslations', () => {
    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translations-test-'));
        LANGUAGES_DIR = path.join(tempDir, 'src/languages');
        EN_PATH = path.join(LANGUAGES_DIR, 'en.ts');
        IT_PATH = path.join(LANGUAGES_DIR, 'it.ts');
        fs.mkdirSync(LANGUAGES_DIR, {recursive: true});

        // Patch env to redirect script to temp path
        process.env.LANGUAGES_DIR = LANGUAGES_DIR;
    });

    afterEach(() => {
        fs.rmdirSync(LANGUAGES_DIR);
        delete process.env.LANGUAGES_DIR;
        jest.clearAllMocks();
    });

    describe('--dry-run', () => {
        beforeEach(() => {
            process.argv.push('--dry-run');
        });

        afterEach(() => {
            process.argv = process.argv.filter((arg) => arg !== '--dry-run');
        });

        it('translates nested structures', async () => {
            fs.writeFileSync(
                EN_PATH,
                StringUtils.dedent(`
                    const strings = {
                        greeting: 'Hello',
                        farewell: 'Goodbye',
                        message: (username: string, count: number) => \`Hi \${username}, you have \${count} messages\`,
                        some: {
                            nested: {
                                str: 'nested string',
                                fnc: ({destructuredArg}) => \`My template string contains a single \${destructuredArg} argument\`,
                            }
                        }
                    };
                    export default strings;
            `),
                'utf8',
            );
            await generateTranslations();
            const itContent = fs.readFileSync(IT_PATH, 'utf8');
            expect(itContent).toStrictEqual(
                StringUtils.dedent(`
                    const strings = {
                        greeting: '[it] Hello',
                        farewell: '[it] Goodbye',
                        message: (username: string, count: number) => \`[it] Hi \${username}, you have \${count} messages\`,
                        some: {
                            nested: {
                                str: '[it] nested string',
                                fnc: ({destructuredArg}) => \`[it] My template string contains a single \${destructuredArg} argument\`,
                            }
                        }
                    };
                    export default strings;
            `),
            );
        });
    });
});
