import fs from 'fs';
import path from 'path';
import FileUtils from '../../scripts/utils/FileUtils';

let tmpDir: string;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join('/tmp', 'resolve-files-'));

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), {recursive: true});
    fs.mkdirSync(path.join(tmpDir, 'src', 'hooks'), {recursive: true});
    fs.mkdirSync(path.join(tmpDir, 'src', 'utils'), {recursive: true});

    fs.writeFileSync(path.join(tmpDir, 'src', 'components', 'Button.tsx'), 'export default function Button() {}');
    fs.writeFileSync(path.join(tmpDir, 'src', 'components', 'Card.tsx'), 'export default function Card() {}');
    fs.writeFileSync(path.join(tmpDir, 'src', 'hooks', 'useToggle.ts'), 'export function useToggle() {}');
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils', 'math.ts'), 'export const add = (a, b) => a + b;');
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils', 'README.md'), '# Utils');
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils', 'data.json'), '{}');
});

afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('resolveFilePaths', () => {
    it('passes through individual file paths unchanged', () => {
        const file = path.join(tmpDir, 'src', 'components', 'Button.tsx');
        const result = FileUtils.resolveFilePaths([file]);
        expect(result).toEqual([file]);
    });

    it('expands a directory to all .ts and .tsx files recursively', () => {
        const dir = path.join(tmpDir, 'src');
        const result = FileUtils.resolveFilePaths([dir]);
        expect(result.sort()).toEqual([
            path.join(tmpDir, 'src', 'components', 'Button.tsx'),
            path.join(tmpDir, 'src', 'components', 'Card.tsx'),
            path.join(tmpDir, 'src', 'hooks', 'useToggle.ts'),
            path.join(tmpDir, 'src', 'utils', 'math.ts'),
        ]);
    });

    it('expands glob patterns', () => {
        const glob = path.join(tmpDir, 'src', 'components', '*.tsx');
        const result = FileUtils.resolveFilePaths([glob]);
        expect(result.sort()).toEqual([path.join(tmpDir, 'src', 'components', 'Button.tsx'), path.join(tmpDir, 'src', 'components', 'Card.tsx')]);
    });

    it('expands recursive glob patterns', () => {
        const glob = path.join(tmpDir, 'src', '**', '*.ts');
        const result = FileUtils.resolveFilePaths([glob]);
        expect(result.sort()).toEqual([path.join(tmpDir, 'src', 'hooks', 'useToggle.ts'), path.join(tmpDir, 'src', 'utils', 'math.ts')]);
    });

    it('handles a mix of files, directories, and globs', () => {
        const file = path.join(tmpDir, 'src', 'hooks', 'useToggle.ts');
        const dir = path.join(tmpDir, 'src', 'components');
        const result = FileUtils.resolveFilePaths([file, dir]);
        expect(result.sort()).toEqual([
            path.join(tmpDir, 'src', 'components', 'Button.tsx'),
            path.join(tmpDir, 'src', 'components', 'Card.tsx'),
            path.join(tmpDir, 'src', 'hooks', 'useToggle.ts'),
        ]);
    });

    it('deduplicates files that match multiple inputs', () => {
        const file = path.join(tmpDir, 'src', 'components', 'Button.tsx');
        const dir = path.join(tmpDir, 'src', 'components');
        const result = FileUtils.resolveFilePaths([file, dir]);
        const buttonCount = result.filter((f) => f.includes('Button.tsx')).length;
        expect(buttonCount).toBe(1);
    });

    it('filters out non .ts/.tsx files from directories and globs', () => {
        const dir = path.join(tmpDir, 'src', 'utils');
        const result = FileUtils.resolveFilePaths([dir]);
        expect(result).toEqual([path.join(tmpDir, 'src', 'utils', 'math.ts')]);
    });
});
