/**
 * All "Flags" or "named args" start with -- (no short form for now)
 * - String flags must be followed by a value (separated either by a = or by whitespace)
 * - The presence of a default value make a flag optional. Otherwise they are required.
 * - Boolean flags must be required
 */
type Flag = BooleanFlag | StringFlag;

type BooleanFlag = {
    type: BooleanConstructor;
    description: string;
    default: boolean;
};

type StringFlag = {
    type: StringConstructor;
    description: string;
    default?: string;
    validate?: (val: string) => string;
};

/**
 * "Params" are positional args. They must be strings, but can optional or required.
 */
type Param = {
    type: StringConstructor;
    description: string;
    default?: string;
};

/**
 * This config is passed to the constructor to define your CLI.
 */
type CLIConfig = {
    flags?: Record<string, Flag>;
    params?: Record<string, Param>;
};

type ParsedFlags<Flags extends Record<string, Flag>> = {
    [K in keyof Flags]: Flags[K] extends BooleanFlag ? boolean : string;
};

type ParsedParams<Params extends Record<string, Param>> = {
    [K in keyof Params]: string;
};

/**
 * Utility to parse command-line arguments to a script.
 *
 * @example
 * ```
 * const cli = new CLI({
 *     parameters: {
 *         firstName: {
 *             type: String,
 *             description: 'First name to greet',
 *         },
 *         lastName: {
 *             type: String,
 *             description: 'Optional last name',
 *             default: '',
 *         },
 *     },
 *     flags: {
 *         time: {
 *             type: String,
 *             description: 'Time of day to greet (morning or evening)',
 *             default: 'morning',
 *             validate: (val) => {
 *                 if (val !== 'morning' && val !== 'evening') {
 *                     throw new Error('Must be "morning" or "evening"');
 *                 }
 *                 return val;
 *             },
 *         },
 *         verbose: {
 *             type: Boolean,
 *             description: 'Enable verbose logging',
 *         },
 *     },
 * });
 *
 * console.log(cli.parameters.firstName);
 * if (cli.flags.verbose) {
 *     console.debug(cli.parameters.lastName)
 * }
 * console.log(cli.flags.time);
 * ```
 */
class CLI<Flags extends Record<string, Flag> = Record<string, never>, Params extends Record<string, Param> = Record<string, never>> {
    public readonly flags: ParsedFlags<Flags>;

    public readonly params: ParsedParams<Params>;

    constructor(private readonly config: CLIConfig) {
        const rawArgs = process.argv.slice(2);
        const parsedFlags: Record<string, string | boolean> = {};
        const parsedParams: string[] = [];

        // Parse raw args passed into the CLI
        for (let i = 0; i < rawArgs.length; i++) {
            const rawArg = rawArgs.at(i);
            if (rawArg === undefined) {
                continue;
            }

            if (rawArg.startsWith('--')) {
                const [flagName, rawValue] = rawArg.slice(2).split('=');
                const flagSpec = config.flags?.[flagName];

                if (flagSpec === undefined) {
                    console.warn(`Unknown flag: --${flagName}`);
                    continue;
                }

                if (flagSpec.type === Boolean) {
                    parsedFlags[flagName] = true;
                    continue;
                }

                const value = rawValue ?? rawArgs.at(i + 1);
                if (value === undefined || value.startsWith('--')) {
                    console.error(`Missing value for --${flagName}`);
                    process.exit(1);
                }

                if ('validate' in flagSpec && !!flagSpec.validate) {
                    try {
                        parsedFlags[flagName] = flagSpec.validate(value);
                    } catch (error) {
                        console.error(`Invalid value for --${flagName}: ${String(error)}`);
                        process.exit(1);
                    }
                } else {
                    parsedFlags[flagName] = value;
                }

                // rawValue is only NOT undefined when the flag and value are passed like --flag=value
                if (rawValue === undefined) {
                    i++;
                }
            } else {
                parsedParams.push(rawArg);
            }
        }

        // Validate that required flags are present
        this.flags = {} as ParsedFlags<Flags>;
        for (const [flagName, flagSpec] of Object.entries(config.flags ?? {})) {
            if (flagSpec.type === Boolean) {
                this.flags[flagName as keyof Flags] = !!parsedFlags[flagName] as ParsedFlags<Flags>[typeof flagName];
            } else {
                const val = parsedFlags[flagName] ?? flagSpec.default;
                if (val === undefined) {
                    console.error(`Missing required flag: --${flagName}`);
                    this.printHelp();
                    process.exit(1);
                }
                this.flags[flagName as keyof Flags] = val as ParsedFlags<Flags>[typeof flagName];
            }
        }

        // Validate that required params are present
        this.params = {} as ParsedParams<Params>;
        const paramEntries = Object.entries(config.params ?? {});
        for (let i = 0; i < paramEntries.length; i++) {
            const paramEntry = paramEntries.at(i);
            if (!paramEntry) {
                continue;
            }

            const [name, spec] = paramEntry;
            const val = parsedParams.at(i) ?? spec.default;

            if (val === undefined) {
                console.error(`Missing required parameter: <${name}>`);
                this.printHelp();
                process.exit(1);
            }

            this.params[name as keyof Params] = val;
        }

        // print help if the help flag is provided
        if ('help' in this.flags && this.flags.help === true) {
            this.printHelp();
            process.exit(0);
        }
    }

    private printHelp(): void {
        const paramUsage = Object.entries(this.config.params ?? {})
            .map(([name, spec]) => (spec.default === undefined ? `<${name}>` : `[${name}]`))
            .join(' ');

        console.log(`\nUsage: npx ts-node ${process.argv.at(1) ?? ''} [options] ${paramUsage}\n`);
        console.log('Options:');

        for (const [name, spec] of Object.entries(this.config.flags ?? {})) {
            const typeLabel = spec.type === Boolean ? 'boolean' : 'string';
            const defaultLabel = 'default' in spec && spec.default !== undefined ? ` (default: ${spec.default})` : '';
            console.log(`  --${name.padEnd(20)} ${spec.description} [${typeLabel}]${defaultLabel}`);
        }

        for (const [name, spec] of Object.entries(this.config.params ?? {})) {
            const defaultLabel = spec.default !== undefined ? ` (default: ${spec.default})` : '';
            console.log(`  <${name.padEnd(18)}> ${spec.description}${defaultLabel}`);
        }
    }
}

export default CLI;
