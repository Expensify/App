import CLI from '../../scripts/utils/CLI';

const originalArgv = process.argv;
beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
});

afterEach(() => {
    process.argv = originalArgv;
    jest.restoreAllMocks();
});

function setArgv(...args: string[]) {
    process.argv = ['node', 'script.ts', ...args];
}

describe('CLI variadic positional args', () => {
    it('collects multiple positional args into a string[]', () => {
        setArgv('check', 'file1.ts', 'file2.tsx', 'file3.jsx');

        const cli = new CLI({
            positionalArgs: [
                {
                    name: 'command',
                    description: 'Command to run',
                },
                {
                    name: 'files',
                    description: 'Files to check',
                    variadic: true,
                    default: [],
                },
            ],
        });

        expect(cli.positionalArgs.command).toBe('check');
        expect(cli.positionalArgs.files).toEqual(['file1.ts', 'file2.tsx', 'file3.jsx']);
    });

    it('returns an empty array when no variadic args are provided', () => {
        setArgv('check');

        const cli = new CLI({
            positionalArgs: [
                {
                    name: 'command',
                    description: 'Command to run',
                },
                {
                    name: 'files',
                    description: 'Files to check',
                    variadic: true,
                    default: [],
                },
            ],
        });

        expect(cli.positionalArgs.command).toBe('check');
        expect(cli.positionalArgs.files).toEqual([]);
    });

    it('works with flags alongside variadic args', () => {
        setArgv('--verbose', 'check', 'file1.ts', 'file2.ts');

        const cli = new CLI({
            flags: {
                verbose: {description: 'Enable verbose output'},
            },
            positionalArgs: [
                {
                    name: 'command',
                    description: 'Command to run',
                },
                {
                    name: 'files',
                    description: 'Files to check',
                    variadic: true,
                    default: [],
                },
            ],
        });

        expect(cli.flags.verbose).toBe(true);
        expect(cli.positionalArgs.command).toBe('check');
        expect(cli.positionalArgs.files).toEqual(['file1.ts', 'file2.ts']);
    });

    it('works with named args alongside variadic args', () => {
        setArgv('check', '--remote', 'upstream', 'file1.ts');

        const cli = new CLI({
            namedArgs: {
                remote: {description: 'Git remote', default: 'origin'},
            },
            positionalArgs: [
                {
                    name: 'command',
                    description: 'Command to run',
                },
                {
                    name: 'files',
                    description: 'Files to check',
                    variadic: true,
                    default: [],
                },
            ],
        });

        expect(cli.namedArgs.remote).toBe('upstream');
        expect(cli.positionalArgs.command).toBe('check');
        expect(cli.positionalArgs.files).toEqual(['file1.ts']);
    });
});
