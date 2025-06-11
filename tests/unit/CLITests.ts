/**
 * @jest-environment node
 */
import CLI from '../../scripts/utils/CLI';

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

    it('parses boolean flags with defaults', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    flags: {
                        verbose: {type: Boolean, description: 'Enable verbose', default: false},
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
                        verbose: {type: Boolean, description: 'Enable verbose', default: false},
                    },
                }),
        );

        expect(cli.flags.verbose).toBe(true);
    });

    it('parses string flags with default', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    flags: {
                        name: {type: String, description: 'Your name', default: 'Guest'},
                    },
                }),
        );

        expect(cli.flags.name).toBe('Guest');
    });

    it('uses string flag value from command line', () => {
        const cli = withProcessArgs(
            ['--name=Alice'],
            () =>
                new CLI({
                    flags: {
                        name: {type: String, description: 'Your name', default: 'Guest'},
                    },
                }),
        );

        expect(cli.flags.name).toBe('Alice');
    });

    it('supports "--flag value" syntax for strings', () => {
        const cli = withProcessArgs(
            ['--name', 'Bob'],
            () =>
                new CLI({
                    flags: {
                        name: {type: String, description: 'Your name', default: 'Guest'},
                    },
                }),
        );

        expect(cli.flags.name).toBe('Bob');
    });

    it('throws if required string flag is missing', () => {
        expect(() =>
            withProcessArgs(
                [],
                () =>
                    new CLI({
                        flags: {
                            name: {type: String, description: 'Your name'},
                        },
                    }),
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required flag: --name');
    });

    it('throws on invalid value if validator fails', () => {
        expect(() =>
            withProcessArgs(
                ['--name', '123'],
                () =>
                    new CLI({
                        flags: {
                            name: {
                                type: String,
                                description: 'Your name',
                                validate: (val) => {
                                    if (!val.match(/^[A-Za-z]+$/)) {
                                        throw new Error('invalid name');
                                    }
                                    return val;
                                },
                            },
                        },
                    }),
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Invalid value for --name: Error: invalid name');
    });

    it('parses required positional parameter', () => {
        const cli = withProcessArgs(
            ['Hello'],
            () =>
                new CLI({
                    params: {
                        greeting: {type: String, description: 'Greeting'},
                    },
                }),
        );

        expect(cli.params.greeting).toBe('Hello');
    });

    it('uses default for optional positional param', () => {
        const cli = withProcessArgs(
            [],
            () =>
                new CLI({
                    params: {
                        greeting: {type: String, description: 'Greeting', default: 'Hi'},
                    },
                }),
        );

        expect(cli.params.greeting).toBe('Hi');
    });

    it('throws for missing required positional param', () => {
        expect(() =>
            withProcessArgs(
                [],
                () =>
                    new CLI({
                        params: {
                            greeting: {type: String, description: 'Greeting'},
                        },
                    }),
            ),
        ).toThrow();
        expect(mockError).toHaveBeenCalledWith('Missing required parameter: <greeting>');
    });

    it('prints help and exits with --help flag', () => {
        expect(() =>
            withProcessArgs(
                ['--help'],
                () =>
                    new CLI({
                        flags: {
                            help: {type: Boolean, description: 'Show help', default: false},
                            verbose: {type: Boolean, description: 'Verbose', default: false},
                        },
                        params: {
                            greeting: {type: String, description: 'Greeting', default: 'Hi'},
                        },
                    }),
            ),
        ).toThrow('exit');

        const calls = mockLog.mock.calls.flat();

        expect(calls.some((line) => typeof line === 'string' && line.includes('Usage'))).toBe(true);
        expect(mockExit).toHaveBeenCalledWith(0);
    });
});
