import CLI from '@scripts/utils/CLI';

const cli = new CLI({
    positionalArgs: [
        {
            name: 'outPath',
            description: 'Output file path for the scaffold message',
        },
    ],
});

await Bun.write(cli.positionalArgs.outPath, 'victory-chart-renderer scaffolded\n');
