import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import type {ChartSkiaTypefaceKey} from '@components/Charts/types/chartSkiaTypefaceTypes';

function resolveRepoRoot(): string {
    const cwdRoot = process.cwd();

    if (existsSync(join(cwdRoot, 'assets/fonts/web/ExpensifyNeue-Regular.woff2'))) {
        return cwdRoot;
    }

    const fromPackageRoot = resolve(import.meta.dir, '../../..');

    if (existsSync(join(fromPackageRoot, 'assets/fonts/web/ExpensifyNeue-Regular.woff2'))) {
        return fromPackageRoot;
    }

    throw new Error('Could not locate App repository root for chart font assets');
}

const repoRoot = resolveRepoRoot();

const CHART_SKIA_TYPEFACE_PATHS: Record<ChartSkiaTypefaceKey, string> = {
    MONOSPACE: join(repoRoot, 'assets/fonts/web/ExpensifyMono-Regular.woff2'),
    MONOSPACE_BOLD: join(repoRoot, 'assets/fonts/web/ExpensifyMono-Bold.woff2'),
    MONOSPACE_ITALIC: join(repoRoot, 'assets/fonts/web/ExpensifyMono-Italic.woff2'),
    MONOSPACE_BOLD_ITALIC: join(repoRoot, 'assets/fonts/web/ExpensifyMono-BoldItalic.woff2'),
    EXP_NEUE: join(repoRoot, 'assets/fonts/web/ExpensifyNeue-Regular.woff2'),
    EXP_NEUE_BOLD: join(repoRoot, 'assets/fonts/web/ExpensifyNeue-Bold.woff2'),
    EXP_NEUE_ITALIC: join(repoRoot, 'assets/fonts/web/ExpensifyNeue-Italic.woff2'),
    EXP_NEUE_BOLD_ITALIC: join(repoRoot, 'assets/fonts/web/ExpensifyNeue-BoldItalic.woff2'),
    EXP_NEW_KANSAS_MEDIUM: join(repoRoot, 'assets/fonts/web/ExpensifyNewKansas-Medium.woff2'),
    EXP_NEW_KANSAS_MEDIUM_ITALIC: join(repoRoot, 'assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff2'),
    CUSTOM_EMOJI_FONT: join(repoRoot, 'assets/fonts/web/CustomEmojiWebFont.ttf'),
};

const CHART_FONT_MGR_SUPPLEMENTAL_PATHS = {
    NotoSansSymbols: join(repoRoot, 'assets/fonts/NotoSans-Symbols.ttf'),
    NotoSansSCMonths: join(repoRoot, 'assets/fonts/NotoSansSC-Months.ttf'),
} as const;

export {CHART_FONT_MGR_SUPPLEMENTAL_PATHS, CHART_SKIA_TYPEFACE_PATHS};
