/** Copy only validated regular dist/ files from a build artifact, never links or files that could replace trusted tooling. */
import path from 'node:path';

const MAX_ASSET_SIZE_BYTES = 25 * 1024 * 1024;

async function extractAdhocAssets(archivePath: string, destination: string): Promise<void> {
    const archive = new Bun.Archive(await Bun.file(archivePath).bytes());
    // Unlike extract(), files() returns regular files only. Writing these blobs never creates archive symlinks or hard links.
    const files = await archive.files();
    const validated = [...files].map(([name, file]) => {
        if (path.posix.isAbsolute(name) || name.includes('\\') || name.split('/').includes('..')) {
            throw new Error('Preview archive contains a path outside dist/');
        }
        const [root, ...parts] = path.posix.normalize(name).split('/');
        if (root !== 'dist' || parts.length === 0) {
            throw new Error('Preview archive contains a path outside dist/');
        }
        return {name: parts.join('/'), file};
    });
    if (!validated.some(({name}) => name === 'index.html')) {
        throw new Error('Preview archive must contain a regular dist/index.html');
    }

    // Validate all paths before writing anything. The destination is a trusted, isolated assets directory.
    for (const {name, file} of validated) {
        if (name.endsWith('.map') || path.posix.basename(name) === '.assetsignore') {
            continue;
        }
        if (file.size > MAX_ASSET_SIZE_BYTES) {
            throw new Error('Preview asset exceeds the Workers Static Assets file limit');
        }
        await Bun.write(path.join(destination, name), file);
    }
}

export default extractAdhocAssets;
