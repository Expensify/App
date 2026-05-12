/**
 * @jest-environment node
 */
import CLI from '../../scripts/utils/CLI';
import StringUtils from '../../src/libs/StringUtils';

describe('CLI', () => {
    const ORIGINAL_ARGV = process.argv;
    let mockExit: jest.SpyInstance;
    let mockLog: jest.SpyInstance;
    let mockError: jest.SpyInstance;
    let mockWarn: jest.SpyInstance;

    beforeEach(() => {
        process.argv = ['ts-node', 'script.ts'];
        mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });
        mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
        mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        process.argv = ORIGINAL_ARGV;
    });

    it('parses boolean flags with default false', () => {
        const cli = new CLI({
            flags: {
                verbose: {description: 'Enable verbose mode'},
            },
        });

        expect(cli.flags.verbose).toBe(false);
    });

    it('sets boolean flag when present', () => {
        process.argv.push('--verbose');
        const cli = new CLI({
            flags: {
                verbose: {description: 'Enable verbose mode'},
            },
        });

        expect(cli.flags.verbose).toBe(true);
    });

    it('parses named arg with default', () => {
        const cli = new CLI({
            namedArgs: {
                name: {description: 'Your name', default: 'Guest'},
            },
        });

        expect(cli.namedArgs.name).toBe('Guest');
    });

    it('uses named arg value from command line', () => {
        process.argv.push('--name=Alice');
        const cli = new CLI({
            namedArgs: {
                name: {description: 'Your name', default: 'Guest'},
            },
        });

        expect(cli.namedArgs.name).toBe('Alice');
    });

    it('supports "--arg value" syntax', () => {
        process.argv.push('--name', 'Bob');
        const cli = new CLI({
            namedArgs: {
                name: {description: 'Your name'},
            },
        });

        expect(cli.namedArgs.name).toBe('Bob');
    });

    it('throws if required named arg is missing', () => {
        expect(
            () =>
                new CLI({
                    namedArgs: {
                        name: {description: 'Required arg'},
                    },
                }),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required named argument --name');
    });

    it('throws on invalid named arg value from parse function', () => {
        process.argv.push('--count', 'abc');
        expect(
            () =>
                new CLI({
                    namedArgs: {
                        count: {
                            description: 'Numeric value',
                            parse: (val) => {
                                const num = Number(val);
                                if (Number.isNaN(num)) {
                                    throw new Error('Must be a number');
                                }
                                return num;
                            },
                        },
                    },
                }),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Invalid value for --count: Must be a number');
    });

    it('parses required positional arg', () => {
        process.argv.push('Hello');
        const cli = new CLI({
            positionalArgs: [{name: 'greeting', description: 'Greeting'}],
        });

        expect(cli.positionalArgs.greeting).toBe('Hello');
    });

    it('uses default for optional positional arg', () => {
        const cli = new CLI({
            positionalArgs: [{name: 'greeting', description: 'Greeting', default: 'Hi'}],
        });

        expect(cli.positionalArgs.greeting).toBe('Hi');
    });

    it('throws for missing required positional arg', () => {
        expect(
            () =>
                new CLI({
                    positionalArgs: [{name: 'greeting', description: 'Greeting'}],
                }),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required positional argument --greeting');
    });

    it('parses custom type with parse function', () => {
        process.argv.push('--locales', 'en,fr,es');
        const cli = new CLI({
            namedArgs: {
                locales: {
                    description: 'Languages',
                    parse: (val) => val.split(','),
                },
            },
        });

        expect(cli.namedArgs.locales).toEqual(['en', 'fr', 'es']);
    });

    it('prints help message and exits with --help flag', () => {
        process.argv.push('--help');
        expect(
            () =>
                new CLI({
                    flags: {
                        verbose: {description: 'Enable verbose logging'},
                    },
                    namedArgs: {
                        time: {
                            description: 'Time of day to greet (morning or evening)',
                            default: 'morning',
                            parse: (val) => {
                                if (val !== 'morning' && val !== 'evening') {
                                    throw new Error('Must be "morning" or "evening"');
                                }
                                return val;
                            },
                        },
                    },
                    positionalArgs: [
                        {
                            name: 'firstName',
                            description: 'First name to greet',
                        },
                        {
                            name: 'lastName',
                            description: 'Last name to greet',
                            default: '',
                        },
                    ],
                }),
        ).toThrow('exit');

        const scriptName = 'script.ts'; // Adjust if your tests override process.argv[1]
        const expectedOutput = StringUtils.dedent(
            `
            Usage: npx ts-node ${scriptName} [--verbose] [--yes] [--no] [--help] [--time <value>] <firstName> [lastName]

            Flags:
              --verbose              Enable verbose logging
              --yes                  Automatically answer "yes" to all confirmation prompts.
              --no                   Automatically answer "no" to all confirmation prompts.
              --help                 Show this help message.

            Named Arguments:
              --time                 Time of day to greet (morning or evening) (default: morning)

            Positional Arguments:
              firstName              First name to greet
              lastName               Last name to greet (default: )
        `,
        ).trim();

        // Join lines and strip indentation before comparison
        const actualOutput = mockLog.mock.calls.flat().join('\n').trim();

        expect(actualOutput).toBe(expectedOutput);
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('handles supersession when superseding arg is provided', () => {
        process.argv.push('--paths', 'common.save,errors.generic');
        const cli = new CLI({
            namedArgs: {
                compareRef: {
                    description: 'Compare reference',
                    default: 'main',
                },
                paths: {
                    description: 'Specific paths to process',
                    parse: (val) => val.split(','),
                    supersedes: ['compareRef'],
                    required: false,
                },
            },
        });

        expect(cli.namedArgs.paths).toEqual(['common.save', 'errors.generic']);
        expect(cli.namedArgs.compareRef).toBeUndefined();
    });

    it('uses default value when superseding arg is not provided', () => {
        const cli = new CLI({
            namedArgs: {
                compareRef: {
                    description: 'Compare reference',
                    default: 'main',
                },
                paths: {
                    description: 'Specific paths to process',
                    parse: (val) => val.split(','),
                    supersedes: ['compareRef'],
                    required: false,
                },
            },
        });

        expect(cli.namedArgs.paths).toBeUndefined();
        expect(cli.namedArgs.compareRef).toBe('main');
    });

    it('shows supersession information in help message', () => {
        process.argv.push('--help');
        expect(
            () =>
                new CLI({
                    namedArgs: {
                        compareRef: {
                            description: 'Compare reference',
                            default: 'main',
                        },
                        paths: {
                            description: 'Specific paths to process',
                            supersedes: ['compareRef'],
                            required: false,
                        },
                    },
                }),
        ).toThrow('exit');

        const actualOutput = mockLog.mock.calls.flat().join('\n');
        expect(actualOutput).toContain('(supersedes: compareRef)');
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('handles multiple superseded args', () => {
        process.argv.push('--priority', 'high');
        const cli = new CLI({
            namedArgs: {
                lowPriority: {
                    description: 'Low priority mode',
                    default: 'enabled',
                },
                mediumPriority: {
                    description: 'Medium priority mode',
                    default: 'enabled',
                },
                priority: {
                    description: 'Priority level',
                    supersedes: ['lowPriority', 'mediumPriority'],
                    required: false,
                },
            },
        });

        expect(cli.namedArgs.priority).toBe('high');
        expect(cli.namedArgs.lowPriority).toBeUndefined();
        expect(cli.namedArgs.mediumPriority).toBeUndefined();
    });

    it('requires superseded args when superseding arg is not provided', () => {
        expect(
            () =>
                new CLI({
                    namedArgs: {
                        compareRef: {
                            description: 'Compare reference',
                            // No default value
                        },
                        paths: {
                            description: 'Specific paths to process',
                            supersedes: ['compareRef'],
                            required: false,
                        },
                    },
                }),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required named argument --compareRef');
    });

    it('warns when superseded arg is provided alongside superseding arg', () => {
        process.argv.push('--paths', 'common.save', '--compare-ref', 'main');
        /* eslint-disable @typescript-eslint/naming-convention */
        const cli = new CLI({
            namedArgs: {
                'compare-ref': {
                    description: 'Compare reference',
                    default: 'main',
                },
                paths: {
                    description: 'Specific paths to process',
                    parse: (val) => val.split(','),
                    supersedes: ['compare-ref'],
                    required: false,
                },
            },
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        expect(mockWarn).toHaveBeenCalledWith('⚠️  Warning: --compare-ref is superseded by --paths and will be ignored.');
        expect(cli.namedArgs.paths).toEqual(['common.save']);
        expect(cli.namedArgs['compare-ref']).toBeUndefined();
    });

    it('warns for multiple superseded args when provided', () => {
        process.argv.push('--priority', 'high', '--low-priority', 'disabled', '--medium-priority', 'enabled');
        /* eslint-disable @typescript-eslint/naming-convention */
        const cli = new CLI({
            namedArgs: {
                'low-priority': {
                    description: 'Low priority mode',
                    default: 'enabled',
                },
                'medium-priority': {
                    description: 'Medium priority mode',
                    default: 'enabled',
                },
                priority: {
                    description: 'Priority level',
                    supersedes: ['low-priority', 'medium-priority'],
                    required: false,
                },
            },
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        expect(mockWarn).toHaveBeenCalledWith('⚠️  Warning: --low-priority is superseded by --priority and will be ignored.');
        expect(mockWarn).toHaveBeenCalledWith('⚠️  Warning: --medium-priority is superseded by --priority and will be ignored.');
        expect(cli.namedArgs.priority).toBe('high');
        expect(cli.namedArgs['low-priority']).toBeUndefined();
        expect(cli.namedArgs['medium-priority']).toBeUndefined();
    });

    it('does not warn when only superseding arg is provided', () => {
        process.argv.push('--paths', 'common.save');
        /* eslint-disable @typescript-eslint/naming-convention */
        const cli = new CLI({
            namedArgs: {
                'compare-ref': {
                    description: 'Compare reference',
                    default: 'main',
                },
                paths: {
                    description: 'Specific paths to process',
                    parse: (val) => val.split(','),
                    supersedes: ['compare-ref'],
                    required: false,
                },
            },
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        expect(mockWarn).not.toHaveBeenCalled();
        expect(cli.namedArgs.paths).toEqual(['common.save']);
        expect(cli.namedArgs['compare-ref']).toBeUndefined();
    });

    describe('built-in flags', () => {
        it('sets --yes flag when present', () => {
            process.argv.push('--yes');
            const cli = new CLI({
                flags: {
                    verbose: {description: 'Enable verbose mode'},
                },
            });

            expect(cli.flags.yes).toBe(true);
            expect(cli.flags.no).toBe(false);
        });

        it('sets --no flag when present', () => {
            process.argv.push('--no');
            const cli = new CLI({
                flags: {
                    verbose: {description: 'Enable verbose mode'},
                },
            });

            expect(cli.flags.no).toBe(true);
            expect(cli.flags.yes).toBe(false);
        });

        it('--yes and --no default to false', () => {
            const cli = new CLI({
                flags: {
                    verbose: {description: 'Enable verbose mode'},
                },
            });

            expect(cli.flags.yes).toBe(false);
            expect(cli.flags.no).toBe(false);
        });
    });

    describe('promptUserConfirmation', () => {
        it('returns true immediately when --yes flag is set', async () => {
            process.argv.push('--yes');
            const cli = new CLI({
                flags: {
                    verbose: {description: 'Enable verbose mode'},
                },
            });

            const result = await cli.promptUserConfirmation('Continue?');
            expect(result).toBe(true);
        });

        it('returns false immediately when --no flag is set', async () => {
            process.argv.push('--no');
            const cli = new CLI({
                flags: {
                    verbose: {description: 'Enable verbose mode'},
                },
            });

            const result = await cli.promptUserConfirmation('Continue?');
            expect(result).toBe(false);
        });
    });
});
