import {execFileSync} from 'child_process';
import path from 'path';

/**
 * Utility class to programmatically format files with Oxfmt.
 */
class Oxfmt {
    /**
     * Format a single file with Oxfmt.
     */
    public static format(filePath: string): void {
        const oxfmtPath = path.resolve(__dirname, '../../node_modules/.bin/oxfmt');
        execFileSync(oxfmtPath, ['--write', filePath], {stdio: 'inherit'});
        console.log(`✅ Formatted: ${filePath}`);
    }
}

export default Oxfmt;
