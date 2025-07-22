import fs from 'fs';
import path from 'path';
import type {Options} from 'prettier';
import prettier from 'prettier';

/**
 * Utility class to programmatically format files with prettier.
 */
class Prettier {
    /**
     * Singleton instance.
     */
    private static instance: Prettier;

    /**
     * Config loaded from .prettierrc.js
     */
    private config: Options | null = null;

    /**
     * Format a single file with prettier.
     */
    public static async format(filePath: string): Promise<void> {
        if (!Prettier.instance) {
            Prettier.instance = new Prettier();
            await Prettier.instance.loadConfig(filePath);
        }

        if (!Prettier.instance.config) {
            throw new Error('Failed to load Prettier configuration.');
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const formatted = await prettier.format(fileContent, {
            ...Prettier.instance.config,
            filepath: filePath, // ensures correct parser
        });

        fs.writeFileSync(filePath, formatted, 'utf8');
        console.log(`✅ Formatted: ${filePath}`);
    }

    private async loadConfig(filePath: string): Promise<void> {
        const configPath = path.resolve(__dirname, '../../.prettierrc.js');
        this.config = await prettier.resolveConfig(filePath, {
            config: configPath,
        });
    }
}

export default Prettier;
