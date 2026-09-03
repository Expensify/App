type BunStdio = 'inherit' | 'ignore' | 'pipe';
type BunSpawnSyncOptions = {
    cwd?: string;
    stdin?: BunStdio;
    stdout?: BunStdio;
    stderr?: BunStdio;
    maxBuffer?: number;
};
type BunSpawnSyncResult = {
    stdout: Uint8Array;
    stderr: Uint8Array;
    exitCode: number;
    success: boolean;
};

declare const Bun: {
    spawnSync: (command: string[], options?: BunSpawnSyncOptions) => BunSpawnSyncResult;
};

/** Calls Bun's synchronous process API without importing Bun runtime types into Node-based test configurations. */
function spawnSync(command: string[], options?: BunSpawnSyncOptions): BunSpawnSyncResult {
    return Bun.spawnSync(command, options);
}

export default spawnSync;
