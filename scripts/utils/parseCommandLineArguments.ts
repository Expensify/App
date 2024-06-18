type ArgsMap = Record<string, string | undefined>;

// Function to parse command-line arguments into a key-value object
export default function parseCommandLineArguments(): ArgsMap {
    const args = process.argv.slice(2); // Skip node and script paths
    const argsMap: ArgsMap = {};
    args.forEach((arg) => {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            argsMap[key.substring(2)] = value;
        }
    });
    return argsMap;
}
