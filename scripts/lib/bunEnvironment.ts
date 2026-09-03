declare const Bun: {
    env: Record<string, string | undefined>;
};

function environmentString(name: string): string | undefined {
    const value = Bun.env[name];
    return value && value.length > 0 ? value : undefined;
}

export default environmentString;
