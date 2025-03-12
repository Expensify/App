#!/usr/bin/env node
import fs from 'fs';
import renderEmail from '../core/renderEmail';

function usage() {
    console.error('Usage: node cli.bundle.js --notification <NotificationNode> --onyxData <OnyxData> --output <filepath>');
    process.exit(1);
}

async function main() {
    const args = process.argv.slice(2);
    const notificationArgIndex = args.indexOf('--notification');
    const onyxDataArgIndex = args.indexOf('--onyxData');
    const outputArgIndex = args.indexOf('--output');

    if (notificationArgIndex === -1 || !args[notificationArgIndex + 1]) {
        console.error('Error: You must provide --notification <NotificationName>');
        usage();
    }

    const notificationName = args[notificationArgIndex + 1];
    let onyxData = {};
    if (onyxDataArgIndex > -1 && onyxDataArgIndex < args.length - 1) {
        onyxData = JSON.parse(args[onyxDataArgIndex + 1]);
    }
    let outputFile = 'output.html';
    if (outputArgIndex > -1 && outputArgIndex < args.length - 1) {
        outputFile = args[outputArgIndex + 1];
    }

    try {
        const html = await renderEmail({notificationName, onyxData});
        await fs.writeFile(outputFile, html);
        console.log(`✅ Rendered email saved to ${outputFile}`);
    } catch (error) {
        console.error(`Error rendering email: ${error.message}`);
        process.exit(1);
    }
}

main();
