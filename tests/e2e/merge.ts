import compare from './compare/compare';
import CONFIG from './config';

const args = process.argv.slice(2);

let mainPath = `${CONFIG.OUTPUT_DIR}/main.json`;
if (args.includes('--mainPath')) {
    mainPath = args[args.indexOf('--mainPath') + 1];
}

let deltaPath = `${CONFIG.OUTPUT_DIR}/delta.json`;
if (args.includes('--deltaPath')) {
    deltaPath = args[args.indexOf('--deltaPath') + 1];
}

let outputPath = `${CONFIG.OUTPUT_DIR}/output.md`;
if (args.includes('--outputPath')) {
    outputPath = args[args.indexOf('--outputPath') + 1];
}

async function run() {
    await compare(mainPath, deltaPath, outputPath, 'all');

    process.exit(0);
}

run();
