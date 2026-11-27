import {describe, expect, it} from 'bun:test';

import * as fs from 'fs';
import * as path from 'path';

import ZipUtils from '../../scripts/utils/ZipUtils';

const ANIMATIONS_DIRECTORY = path.resolve(import.meta.dirname, '../../assets/animations');

describe('ZipUtils', () => {
    it('reads back the entries it wrote', () => {
        // Given entries with a nested path, a name outside ASCII and an empty file, which are the cases where the lengths in the headers are easy to get wrong
        const entries = [
            {name: 'manifest.json', data: Buffer.from('{"version":"1"}')},
            {name: 'animations/café.json', data: Buffer.from(JSON.stringify({layers: Array.from({length: 200}, (_, index) => ({ind: index}))}))},
            {name: 'empty.txt', data: Buffer.alloc(0)},
        ];

        // When they go through an archive
        const archive = ZipUtils.write(entries);

        // Then they come back with the same names, content and order, and the content was compressed
        expect(ZipUtils.read(archive)).toEqual(entries);
        expect(archive.length).toBeLessThan(entries.reduce((total, entry) => total + entry.data.length, 0));
    });

    it('writes the same archive for the same entries', () => {
        // Given the same entries written at two different times
        const entries = [{name: 'animations/data.json', data: Buffer.from('{"fr":24}')}];

        // When both archives are compared
        const firstArchive = ZipUtils.write(entries);
        const secondArchive = ZipUtils.write(entries);

        // Then they are identical, because an archive that embedded the current time would show up as a change in git every time an asset is rewritten
        expect(firstArchive.equals(secondArchive)).toBe(true);
    });

    it('reads the .lottie files exported by the design tools', () => {
        // Given the animations of the app, which come from several exporters and mix stored and deflated entries
        const fileNames = fs.readdirSync(ANIMATIONS_DIRECTORY).filter((fileName) => fileName.endsWith('.lottie'));
        expect(fileNames.length).toBeGreaterThan(0);

        for (const fileName of fileNames) {
            // When one of them is read
            const entries = ZipUtils.read(fs.readFileSync(path.join(ANIMATIONS_DIRECTORY, fileName)));

            // Then it has a manifest and every entry holds valid JSON, which would not parse if an entry was cut at the wrong offset
            expect(entries.map((entry) => entry.name)).toContain('manifest.json');
            for (const entry of entries.filter((item) => item.name.endsWith('.json'))) {
                expect(() => JSON.parse(entry.data.toString('utf8')) as unknown).not.toThrow();
            }
        }
    });

    it('rejects a file that is not a zip archive', () => {
        // Given a file without the record that ends every zip archive
        const plainFile = Buffer.from('{"fr":24}');

        // When it is read
        // Then it fails with a clear error instead of reading entries at offsets that mean nothing
        expect(() => ZipUtils.read(plainFile)).toThrow('Not a zip archive');
    });
});
