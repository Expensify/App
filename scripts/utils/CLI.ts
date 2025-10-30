/**
 * This file contains a CLI utility class which can be used to declaratively implement a strongly-typed CLI.
 * You provide a CLIConfig defining your arguments, then the class will handle parsing argv, type validation, error handling, and help messages.
 */
import type {NonEmptyObject, NonEmptyTuple, ValueOf, Writable} from 'type-fest';
import SafeString from '@src/utils/SafeString';

/**
 * A base CLI arg has only a description, which we will use in the help/usage message (built-in to any CLI).
 */
type CLIArg = {
    description: string;
};

/**
 * A boolean arg is characterized only by its presence or absence so has no other fields,
 * but we'll create a type alias to clearly distinguish it from other argument types.
 */
type BooleanArg = CLIArg;

/**
 * Any other argument is provided raw in process.argv as a string.
 * It can remain a string, or can be transformed into another type by a custom `parse` function.
 * It can be optional (by providing a default) or required (no default value).
 * It can also supersede other named arguments when provided.
 */
type StringArg<T = unknown> = CLIArg & {
    default?: T;
    parse?: (val: string) => T;
    supersedes?: string[];
    required?: boolean;
};

/**
 * A positional argument is just a string arg, but also must be assigned a name which we will eventually expose the CLI consumer.
 */
type PositionalArg<T = unknown> = StringArg<T> & {
    name: string;
};

/**
 * This type represents the config for a CLI.
 * Note: this utility does not yet support variadic args of any kind.
 */
type CLIConfig = NonEmptyObject<{
    /**
     * Record of named flags that are fully characterized by their presence or absence (present=true,absent=false).
     * @example `--verbose`
     */
    flags?: Record<string, BooleanArg>;

    /**
     * Record of named arguments that are represented by a key and a value.
     * @example `--threads=8`
     * @example `--name Rory`
     */
    namedArgs?: Record<string, StringArg>;

    /**
     * Tuple of positional args.
     * @example `myScript.ts arg1 arg2 arg3`
     */
    positionalArgs?: NonEmptyTuple<PositionalArg>;
}>;

/**
 * Record of flags to boolean after parsing.
 */
type ParsedFlags<Flags extends CLIConfig['flags']> = {
    [K in keyof NonNullable<Flags>]: boolean;
};

/**
 * Utility type to infer the final value of a string param. Either:
 * - it's a plain string, or
 * - it has a parse function and the final value is inferred from the return type of that function
 */
type InferStringArgParsedValue<T extends StringArg> = T extends {parse: (val: string) => infer R} ? R : string;

/**
 * Record of named args after parsing.
 */
type ParsedNamedArgs<NamedArgs extends CLIConfig['namedArgs']> = {
    [K in keyof NonNullable<NamedArgs>]: InferStringArgParsedValue<NonNullable<NamedArgs>[K]>;
};

/**
 * Record of positional args after parsing.
 */
type ParsedPositionalArgs<PositionalArgs extends CLIConfig['positionalArgs']> = {
    [K in NonNullable<PositionalArgs>[number] as K['name']]: InferStringArgParsedValue<K>;
};

/**
 * Utility to parse command-line arguments to a script.
 *
 * @example
 * ```
 * const cli = new CLI({
 *     flags: {
 *         verbose: {
 *             description: 'Enable verbose logging',
 *         },
 *     },
 *     namedArgs: {
 *         time: {
 *             description: 'Time of day to greet (morning or evening)',
 *             default: 'morning',
 *             parse: (val) => {
 *                 if (val !== 'morning' && val !== 'evening') {
 *                     throw new Error('Must be "morning" or "evening"');
 *                 }
 *                 return val as 'morning' | 'evening';
 *             },
 *         },
 *     },
 *     positionalArgs: [
 *         {
 *             name: 'firstName'
 *             description: 'First name to greet',
 *         },
 *         {
 *             name: 'lastName',
 *             description: 'Last name to greet',
 *             default: '',
 *         },
 *     ],
 * });
 *
 * let fullName = cli.positionalArgs.firstName;
 * if (cli.flags.verbose) {
 *     fullName += cli.positionalArgs.lastName;
 * }
 * console.log(fullName);
 * console.log(cli.namedArgs.time);
 * ```
 */
class CLI<TConfig extends CLIConfig> {
    /**
     * Flags after parsing.
     */
    public readonly flags: ParsedFlags<TConfig['flags']>;

    /**
     * Named args after parsing.
     */
    public readonly namedArgs: ParsedNamedArgs<TConfig['namedArgs']>;

    /**
     * Positional args after parsing, collected into a record keyed by the name of each arg.
     */
    public readonly positionalArgs: ParsedPositionalArgs<TConfig['positionalArgs']>;

    constructor(private readonly config: TConfig) {
        const rawArgs = process.argv.slice(2);

        // Handle help command
        if (rawArgs.includes('help') || rawArgs.includes('--help')) {
            this.printHelp();
            process.exit(0);
        }

        try {
            // Initialize all flags to false by default
            this.flags = Object.fromEntries(Object.keys(config.flags ?? {}).map((key) => [key, false])) as typeof this.flags;

            const parsedNamedArgs: Partial<Writable<typeof this.namedArgs>> = {};
            const parsedPositionalArgs: Partial<Writable<typeof this.positionalArgs>> = {};
            const providedNamedArgs = new Set<string>();

            let positionalIndex = 0;
            for (let i = 0; i < rawArgs.length; i++) {
                const rawArg = rawArgs.at(i);
                if (rawArg === undefined) {
                    continue;
                }

                if (rawArg.startsWith('--')) {
                    // Either a flag or a named param
                    const [rawArgName, rawArgValue] = rawArg.slice(2).split('=');
                    if (rawArgName in this.flags) {
                        // Arg is a flag
                        this.flags[rawArgName as keyof typeof this.flags] = true;
                    } else if (config.namedArgs && rawArgName in config.namedArgs) {
                        // Arg is a named arg
                        providedNamedArgs.add(rawArgName);

                        // Grab the value from the split token, otherwise go for the next token
                        let argValueBeforeParse = '';
                        if (rawArgValue) {
                            argValueBeforeParse = rawArgValue;
                        } else {
                            argValueBeforeParse = rawArgs.at(++i) ?? '';
                            if (!argValueBeforeParse || argValueBeforeParse.startsWith('--')) {
                                throw new Error(`Missing value for --${rawArgName}`);
                            }
                        }

                        const spec = config.namedArgs[rawArgName];
                        parsedNamedArgs[rawArgName as keyof typeof parsedNamedArgs] = CLI.parseStringArg(argValueBeforeParse, rawArgName, spec) as ValueOf<typeof parsedNamedArgs>;
                    } else {
                        console.error(`Unknown flag: --${rawArgName}`);
                        process.exit(1);
                    }
                } else {
                    // Arg is a positional arg
                    const spec = config.positionalArgs?.at(positionalIndex);
                    if (spec === undefined) {
                        throw new Error(`Unexpected arg: ${rawArg}`);
                    }
                    parsedPositionalArgs[spec.name as keyof typeof parsedPositionalArgs] = CLI.parseStringArg(rawArg, spec.name, spec) as ValueOf<typeof parsedPositionalArgs>;
                    positionalIndex++;
                }
            }

            // Handle supersession logic
            const supersededArgs = new Set<string>();
            for (const [name, spec] of Object.entries(config.namedArgs ?? {})) {
                if (providedNamedArgs.has(name) && spec.supersedes) {
                    for (const supersededArg of spec.supersedes) {
                        supersededArgs.add(supersededArg);
                        if (providedNamedArgs.has(supersededArg)) {
                            console.warn(`⚠️  Warning: --${supersededArg} is superseded by --${name} and will be ignored.`);
                        }
                    }
                }
            }

            // Validate that all required args are present, assign defaults where values are not parsed
            for (const [name, spec] of Object.entries(config.namedArgs ?? {})) {
                if (name in parsedNamedArgs) {
                    if (supersededArgs.has(name)) {
                        parsedNamedArgs[name as keyof typeof parsedNamedArgs] = undefined as ValueOf<typeof parsedNamedArgs>;
                    }
                } else if (supersededArgs.has(name)) {
                    // This arg was superseded, so don't require it and don't assign a default
                    continue;
                } else if (spec.default !== undefined) {
                    parsedNamedArgs[name as keyof typeof parsedNamedArgs] = spec.default as ValueOf<typeof parsedNamedArgs>;
                } else if (spec.required === false) {
                    // Explicitly marked as optional, leave undefined
                    continue;
                } else {
                    // Arguments without defaults are required by default (unless explicitly marked as optional)
                    throw new Error(`Missing required named argument --${name}`);
                }
            }

            for (const spec of config.positionalArgs ?? []) {
                if (!(spec.name in parsedPositionalArgs)) {
                    if (spec.default !== undefined) {
                        parsedPositionalArgs[spec.name as keyof typeof parsedPositionalArgs] = spec.default as ValueOf<typeof parsedPositionalArgs>;
                    } else {
                        throw new Error(`Missing required positional argument --${spec.name}`);
                    }
                }
            }

            this.namedArgs = parsedNamedArgs as typeof this.namedArgs;
            this.positionalArgs = parsedPositionalArgs as unknown as typeof this.positionalArgs;
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                this.printHelp();
            } else {
                console.error('An unexpected error occurred initializing the CLI.');
            }
            process.exit(1);
        }
    }

    private printHelp(): void {
        const {flags = {}, namedArgs = {}, positionalArgs = []} = this.config;
        const scriptName = process.argv.at(1) ?? 'script.ts';
        const positionalUsage = positionalArgs.map((arg) => (arg.default === undefined ? `<${arg.name}>` : `[${arg.name}]`)).join(' ');
        const namedArgUsage = Object.keys(namedArgs)
            .map((key) => `[--${key} <value>]`)
            .join(' ');
        const flagUsage = Object.keys(flags)
            .map((key) => `[--${key}]`)
            .join(' ');

        console.log(`\nUsage: npx ts-node ${scriptName} ${flagUsage} ${namedArgUsage} ${positionalUsage}\n`);

        if (Object.keys(flags).length > 0) {
            console.log('Flags:');
            for (const [name, spec] of Object.entries(flags)) {
                console.log(`  --${name.padEnd(20)} ${spec.description}`);
            }
            console.log('');
        }

        if (Object.keys(namedArgs).length > 0) {
            console.log('Named Arguments:');
            for (const [name, spec] of Object.entries(namedArgs)) {
                const defaultLabel = spec.default !== undefined ? ` (default: ${SafeString(spec.default)})` : '';
                const supersededLabel = spec.supersedes && spec.supersedes.length > 0 ? ` (supersedes: ${spec.supersedes.join(', ')})` : '';
                console.log(`  --${name.padEnd(20)} ${spec.description}${defaultLabel}${supersededLabel}`);
            }
            console.log('');
        }

        if (positionalArgs.length > 0) {
            console.log('Positional Arguments:');
            for (const arg of positionalArgs) {
                const defaultLabel = arg.default !== undefined ? ` (default: ${SafeString(arg.default)})` : '';
                console.log(`  ${arg.name.padEnd(22)} ${arg.description}${defaultLabel}`);
            }
            console.log('');
        }
    }

    private static parseStringArg<T extends StringArg>(rawString: string, paramName: string, spec: T): InferStringArgParsedValue<T> {
        if ('parse' in spec && !!spec.parse) {
            try {
                return spec.parse(rawString) as InferStringArgParsedValue<T>;
            } catch (error) {
                let errorMessage = '';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error(`Invalid value for --${paramName}: ${errorMessage}`);
                process.exit(1);
            }
        } else {
            return rawString as InferStringArgParsedValue<T>;
        }
    }
}

export default CLI;
