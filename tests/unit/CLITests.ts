/**
 * @jest-environment node
 */
import CLI from '../../scripts/utils/CLI';
import StringUtils from '../../src/libs/StringUtils';

function withProcessArgs<T>(args: string[], fn: () => T): T {
    const originalArgs = process.argv;
    process.argv = ['node', 'script.ts', ...args];
    try {
        return fn();
    } finally {
        process.argv = originalArgs;
    }
}

describe('CLI', () => {
    let mockExit: jest.SpyInstance;
    let mockLog: jest.SpyInstance;
    let mockError: jest.SpyInstance;

    beforeEach(() => {
        mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });
        mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
        mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('parses boolean flags with default false', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    flags: {
                        verbose: {description: 'Enable verbose mode'},
                    },
                }),
        );

        expect(cli.flags.verbose).toBe(false);
    });

    it('sets boolean flag when present', () => {
        const cli = withProcessArgs(
            ['--verbose'],
            () =>
                new CLI({
                    flags: {
                        verbose: {description: 'Enable verbose mode'},
                    },
                }),
        );

        expect(cli.flags.verbose).toBe(true);
    });

    it('parses named arg with default', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    namedArgs: {
                        name: {description: 'Your name', default: 'Guest'},
                    },
                }),
        );

        expect(cli.namedArgs.name).toBe('Guest');
    });

    it('uses named arg value from command line', () => {
        const cli = withProcessArgs(
            ['--name=Alice'],
            () =>
                new CLI({
                    namedArgs: {
                        name: {description: 'Your name', default: 'Guest'},
                    },
                }),
        );

        expect(cli.namedArgs.name).toBe('Alice');
    });

    it('supports "--arg value" syntax', () => {
        const cli = withProcessArgs(
            ['--name', 'Bob'],
            () =>
                new CLI({
                    namedArgs: {
                        name: {description: 'Your name'},
                    },
                }),
        );

        expect(cli.namedArgs.name).toBe('Bob');
    });

    it('throws if required named arg is missing', () => {
        expect(() =>
            withProcessArgs(
                [],
                () =>
                    new CLI({
                        namedArgs: {
                            name: {description: 'Required arg'},
                        },
                    }),
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required named argument --name');
    });

    it('throws on invalid named arg value from parse function', () => {
        expect(() =>
            withProcessArgs(
                ['--count', 'abc'],
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
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Invalid value for --count: Must be a number');
    });

    it('parses required positional arg', () => {
        const cli = withProcessArgs(
            ['Hello'],
            () =>
                new CLI({
                    positionalArgs: [{name: 'greeting', description: 'Greeting'}],
                }),
        );

        expect(cli.positionalArgs.greeting).toBe('Hello');
    });

    it('uses default for optional positional arg', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    positionalArgs: [{name: 'greeting', description: 'Greeting', default: 'Hi'}],
                }),
        );

        expect(cli.positionalArgs.greeting).toBe('Hi');
    });

    it('throws for missing required positional arg', () => {
        expect(() =>
            withProcessArgs(
                [],
                () =>
                    new CLI({
                        positionalArgs: [{name: 'greeting', description: 'Greeting'}],
                    }),
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required positional argument --greeting');
    });

    it('parses custom type with parse function', () => {
        const cli = withProcessArgs(
            ['--langs', 'en,fr,es'],
            () =>
                new CLI({
                    namedArgs: {
                        langs: {
                            description: 'Languages',
                            parse: (val) => val.split(','),
                        },
                    },
                }),
        );

        expect(cli.namedArgs.langs).toEqual(['en', 'fr', 'es']);
    });

    it('prints help message and exits with --help flag', () => {
        expect(() =>
            withProcessArgs(
                ['--help'],
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
            ),
        ).toThrow('exit');

        const scriptName = 'script.ts'; // Adjust if your tests override process.argv[1]
        const expectedOutput = StringUtils.dedent(
            `
            Usage: npx ts-node ${scriptName} [--verbose] [--time <value>] <firstName> [lastName]

            Flags:
              --verbose              Enable verbose logging

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
});
