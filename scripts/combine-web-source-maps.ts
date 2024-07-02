import Concat from 'concat-with-sourcemaps';
import * as fs from 'fs';
import * as path from 'path';

const distFolder = path.join(__dirname, '../dist');

type FileMap = {
    file: string;
    map: string;
};

const files: FileMap[] = fs
    .readdirSync(distFolder)
    .filter((file) => file.endsWith('.map'))
    .map((mapFile) => {
        const jsFile = mapFile.replace('.js.map', '.js');
        if (fs.existsSync(path.join(distFolder, jsFile))) {
            return {file: path.join(distFolder, jsFile), map: path.join(distFolder, mapFile)};
        }
        return null;
    })
    .filter((file): file is FileMap => file !== null);

if (files.length === 0) {
    console.error('No matching .js and .map files found.');
    process.exit(1);
}

const concat = new Concat(true, 'combined.js', '\n');

files.forEach(({file, map}) => {
    const content = fs.readFileSync(file, 'utf-8');
    const mapContent = fs.readFileSync(map, 'utf-8');
    concat.add(file, content, mapContent);
});

fs.writeFileSync(path.join(distFolder, 'combined.js'), concat.content);
fs.writeFileSync(path.join(distFolder, 'combined.js.map'), concat.sourceMap ?? '');

console.log('Combined files created successfully.');
