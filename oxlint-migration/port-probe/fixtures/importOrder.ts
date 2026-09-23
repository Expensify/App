import fs from 'node:fs';

// import/order: the relative import must come after the builtin one
import {basename} from './helper';

function exists() {
    return fs.existsSync(basename);
}

export default exists;
