type ArgsMap = Record<string, string | undefined>;

// Function to parse command-line arguments into a key-value object
export default function parseCommandLineArguments(): ArgsMap {
    const args = process.argv.slice(2); // Skip node and script paths
    const argsMap: ArgsMap = {};
    for (const arg of args) {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            const name = key.substring(2);
            argsMap[name] = value;
            // User may provide a help arg without any value
            if (name.toLowerCase() === 'help' && !value) {
                argsMap[name] = 'true';
            }
        }
    }
    return argsMap;
}
