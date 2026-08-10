// import/order: the relative import must come after the builtin one
import {basename} from './helper';
import fs from 'node:fs';

function exists() {
    return fs.existsSync(basename);
}

export default exists;
