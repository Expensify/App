const compare = require('./compare/compare');
const {OUTPUT_DIR} = require('./config');

const args = process.argv.slice(2);

let mainPath = `${OUTPUT_DIR}/main.json`;
if (args.includes('--mainPath')) {
    mainPath = args[args.indexOf('--mainPath') + 1];
}

let deltaPath = `${OUTPUT_DIR}/delta.json`;
if (args.includes('--deltaPath')) {
    deltaPath = args[args.indexOf('--deltaPath') + 1];
}

let outputPath = `${OUTPUT_DIR}/output.md`;
if (args.includes('--outputPath')) {
    outputPath = args[args.indexOf('--outputPath') + 1];
}

async function run() {
    await compare(mainPath, deltaPath, outputPath, 'all');

    process.exit(0);
}

run();
