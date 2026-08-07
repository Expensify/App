#!/usr/bin/env node

import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultFlowsDirectory = fileURLToPath(new URL('../flows/scenarios', import.meta.url));
const target = path.resolve(process.argv[2] ?? defaultFlowsDirectory);

function listFlowFiles(targetPath) {
    if (statSync(targetPath).isFile()) {
        return [targetPath];
    }

    return readdirSync(targetPath)
        .filter((name) => name.endsWith('.ad'))
        .map((name) => path.join(targetPath, name))
        .sort();
}

function readMetadata(lines, key) {
    const pattern = new RegExp(`^# @${key}\\s+(.+)$`);
    return lines.flatMap((line, index) => {
        const match = pattern.exec(line.trim());
        return match ? [{line: index + 1, value: match[1]}] : [];
    });
}

function decodeSelector(value) {
    return value.replaceAll('\\"', '"').replaceAll('\\\\', '\\');
}

function readExecutableSelectors(lines) {
    return lines.flatMap((line, index) => {
        const trimmed = line.trim();
        const isMatch = /^is exists "((?:\\.|[^"])*)"$/.exec(trimmed);
        if (isMatch) {
            return [{kind: 'assertion', line: index + 1, selector: decodeSelector(isMatch[1])}];
        }

        const waitSelectorMatch = /^wait "((?:\\.|[^"])*)"\s+\d+$/.exec(trimmed);
        if (waitSelectorMatch) {
            return [{kind: 'assertion', line: index + 1, selector: decodeSelector(waitSelectorMatch[1])}];
        }

        const waitTextMatch = /^wait text "((?:\\.|[^"])*)"\s+\d+$/.exec(trimmed);
        if (waitTextMatch) {
            return [{kind: 'assertion', line: index + 1, selector: `text="${decodeSelector(waitTextMatch[1])}"`}];
        }

        return [];
    });
}

function readInteractionSelectors(body) {
    return body.flatMap((command) => {
        const match = /^(press|fill) "((?:\\.|[^"])*)"/.exec(command.value);
        return match ? [{kind: match[1], line: command.line, selector: decodeSelector(match[2])}] : [];
    });
}

function isMutation(command) {
    return /^(?:press|click|fill|type|longpress|scroll|swipe|back|home)(?:\s|$)/.test(command) || /^find\s+.+\s+"(?:click|fill|type)"(?:\s|$)/.test(command);
}

function validateSelector(commandSelector, uniqueLabels = new Set()) {
    const alternatives = commandSelector.selector.split('||').map((alternative) => alternative.trim());
    const findings = [];
    const idIndex = alternatives.findIndex((alternative) => alternative.startsWith('id='));
    if (idIndex > 0) {
        findings.push({line: commandSelector.line, message: 'ID selector must be the first alternative'});
    }

    const ranks = alternatives.map((alternative) => {
        if (alternative.startsWith('id=')) {
            return 0;
        }
        if (alternative.startsWith('role=')) {
            return 1;
        }
        if (alternative.startsWith('label=')) {
            return 2;
        }
        return 3;
    });
    if (ranks.some((rank, index) => index > 0 && rank < ranks[index - 1])) {
        findings.push({line: commandSelector.line, message: 'selector alternatives must be ordered from most specific to least specific'});
    }

    for (const alternative of alternatives) {
        if (!alternative.startsWith('label=')) {
            continue;
        }

        // iOS reports every bottom-navigation node as hittable=false, so a tab press can only resolve
        // through a bare label. That is safe only for a label the author has confirmed is unique in the
        // tree, which `@unique-label` records; without it a bare label silently taps the first match.
        const labelMatch = /^label="((?:\\.|[^"])*)"$/.exec(alternative);
        if (labelMatch && uniqueLabels.has(decodeSelector(labelMatch[1]))) {
            continue;
        }

        if (commandSelector.kind === 'press' && !alternative.includes('hittable=true')) {
            findings.push({line: commandSelector.line, message: 'bare label press must require hittable=true'});
        }
        if (commandSelector.kind === 'assertion' && !alternative.includes('hittable=true')) {
            findings.push({line: commandSelector.line, message: 'bare label assertion must require hittable=true'});
        }
    }

    return findings;
}

function validateFlow(filePath) {
    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    const body = lines.map((line, index) => ({line: index + 1, value: line.trim()})).filter(({value}) => value.length > 0 && !value.startsWith('#'));
    const executableSelectors = readExecutableSelectors(lines);
    const interactionSelectors = readInteractionSelectors(body);
    const mutationLines = body.filter(({value}) => isMutation(value)).map(({line}) => line);
    const firstMutationLine = mutationLines.at(0) ?? Number.POSITIVE_INFINITY;
    const lastMutationLine = mutationLines.at(-1) ?? Number.NEGATIVE_INFINITY;
    const findings = [];

    if (readMetadata(lines, 'desc').length !== 1) {
        findings.push({line: 1, message: 'flow must declare exactly one @desc'});
    }

    const preconditions = readMetadata(lines, 'pre');
    if (preconditions.length === 0) {
        findings.push({line: 1, message: 'flow must declare at least one @pre'});
    }

    const postconditions = readMetadata(lines, 'post');
    if (postconditions.length === 0) {
        findings.push({line: 1, message: 'scenario must declare at least one @post'});
    }

    const resets = readMetadata(lines, 'reset');
    if (resets.length > 1) {
        findings.push({line: resets[1].line, message: 'scenario may declare at most one @reset'});
    }
    for (const reset of resets) {
        const resetPath = path.isAbsolute(reset.value) ? reset.value : path.resolve(process.cwd(), reset.value);
        if (!existsSync(resetPath)) {
            findings.push({line: reset.line, message: `@reset path does not exist: ${reset.value}`});
        }
    }

    for (const precondition of preconditions) {
        const matchingAssertions = executableSelectors.filter(({selector}) => selector === precondition.value);
        if (matchingAssertions.length === 0) {
            findings.push({line: precondition.line, message: `@pre is not enforced: ${precondition.value}`});
        } else if (!matchingAssertions.some(({line}) => line < firstMutationLine)) {
            findings.push({line: precondition.line, message: `@pre must be enforced before the first mutation: ${precondition.value}`});
        }
    }

    for (const postcondition of postconditions) {
        const matchingAssertions = executableSelectors.filter(({selector}) => selector === postcondition.value);
        if (matchingAssertions.length === 0) {
            findings.push({line: postcondition.line, message: `@post is not enforced: ${postcondition.value}`});
        } else if (!matchingAssertions.some(({line}) => line > lastMutationLine)) {
            findings.push({line: postcondition.line, message: `@post must be enforced after the last mutation: ${postcondition.value}`});
        }
    }

    for (const command of body) {
        if (/^find\s+.+\s+"click"(?:\s|$)/.test(command.value)) {
            findings.push({line: command.line, message: 'find click is not deterministic; use an exact selector'});
        }
    }

    const uniqueLabels = new Set(readMetadata(lines, 'unique-label').map(({value}) => value.trim()));
    for (const commandSelector of [...executableSelectors, ...interactionSelectors]) {
        findings.push(...validateSelector(commandSelector, uniqueLabels));
    }

    for (const [index, command] of body.entries()) {
        if (!command.value.startsWith('press ') || !command.value.includes('floating-action-button')) {
            continue;
        }

        if (!body.at(index + 1)?.value.startsWith('wait ')) {
            findings.push({line: command.line, message: 'floating action menu press must be followed by a selector wait'});
        }
    }

    return findings;
}

function validateSentryTagOwnership(flowFiles) {
    const ownersByTag = new Map();

    for (const filePath of flowFiles) {
        const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
        const canonical = readMetadata(lines, 'measure').some(({value}) => value === 'canonical');
        for (const tag of readMetadata(lines, 'tag').filter(({value}) => value.startsWith('sentry-'))) {
            const owners = ownersByTag.get(tag.value) ?? [];
            owners.push({canonical, filePath, line: tag.line});
            ownersByTag.set(tag.value, owners);
        }
    }

    return [...ownersByTag.entries()].flatMap(([tag, owners]) => {
        if (owners.length < 2 || owners.filter(({canonical}) => canonical).length === 1) {
            return [];
        }

        return [
            {
                filePath: owners[0].filePath,
                line: owners[0].line,
                message: `${tag} is declared by multiple flows without one canonical @measure`,
            },
        ];
    });
}

const flowFiles = listFlowFiles(target);
let findingCount = 0;
for (const filePath of flowFiles) {
    for (const finding of validateFlow(filePath)) {
        findingCount += 1;
        process.stderr.write(`${path.relative(process.cwd(), filePath)}:${finding.line}: ${finding.message}\n`);
    }
}
for (const finding of validateSentryTagOwnership(flowFiles)) {
    findingCount += 1;
    process.stderr.write(`${path.relative(process.cwd(), finding.filePath)}:${finding.line}: ${finding.message}\n`);
}

if (findingCount > 0) {
    process.exitCode = 1;
} else {
    process.stdout.write('Agent Device flow validation passed.\n');
}
