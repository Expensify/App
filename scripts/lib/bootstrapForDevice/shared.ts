/** Defines the shared bootstrap options and validates identifier suffixes before platform-specific files are changed. */

import type {TupleToUnion} from 'type-fest';

const PLATFORMS = ['ios', 'android'] as const;
const BUILD_VARIANTS = ['release', 'debug', 'adhoc'] as const;

type BuildVariant = TupleToUnion<typeof BUILD_VARIANTS>;
type BuildVariants = readonly [BuildVariant, ...BuildVariant[]];

const DEFAULT_BUILD_VARIANTS: BuildVariants = ['release'];

type BootstrapOptions = {
    rootDirectory: string;
    developmentTeam: string;
    bundleIdentifier: string;
    buildVariants?: BuildVariants;
    identifierSuffix?: string;
};
type AndroidBootstrapOptions = Omit<BootstrapOptions, 'developmentTeam'>;

/** Parses and deduplicates the comma-separated native build variants selected for patching. */
function parseBuildVariants(value: string): BuildVariants {
    const [firstValue = '', ...remainingValues] = value.split(',');
    const firstVariant = parseBuildVariant(firstValue);
    const remainingVariants = [...new Set(remainingValues.map(parseBuildVariant))].filter((variant) => variant !== firstVariant);
    return [firstVariant, ...remainingVariants];
}

function validateIdentifierSuffix(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
        throw new Error(`Identifier suffix must contain only letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

function parseBuildVariant(value: string): BuildVariant {
    const normalizedInput = value.trim().toLowerCase();
    const normalizedValue = normalizedInput === 'ad-hoc' ? 'adhoc' : normalizedInput;
    const buildVariant = BUILD_VARIANTS.find((variant) => variant === normalizedValue);
    if (!buildVariant) {
        throw new Error(`Build variants must be a comma-separated list containing: ${BUILD_VARIANTS.join(', ')}. Received: ${value}`);
    }
    return buildVariant;
}

export {BUILD_VARIANTS, DEFAULT_BUILD_VARIANTS, PLATFORMS, parseBuildVariants, validateIdentifierSuffix};
export type {AndroidBootstrapOptions, BootstrapOptions, BuildVariant, BuildVariants};
