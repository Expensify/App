import {parse} from 'csv-parse';
import fs from 'fs';

const parser = parse({skip_empty_lines: true});
const adjacencyList: any = {};

function addEdge(source: string, target: string) {
    if (!adjacencyList[source]) {
        adjacencyList[source] = [];
    }
    adjacencyList[source].push(target);
}

function isCyclic(currentNode: string, visited: Map<string, boolean>, backEdges: Map<string, boolean>): boolean {
    visited.set(currentNode, true);
    backEdges.set(currentNode, true);

    // Do a depth first search for all the neighbours. If a node is found in backedge, a cycle is detected.
    const neighbours = adjacencyList[currentNode];
    if (neighbours) {
        for (const node of neighbours) {
            if (!visited.has(node)) {
                if (isCyclic(node, visited, backEdges)) {
                    return true;
                }
            } else if (backEdges.has(node)) {
                return true;
            }
        }
    }

    backEdges.delete(currentNode);

    return false;
}

function detectCycle() {
    const visited: Map<string, boolean> = new Map<string, boolean>();
    const backEdges: Map<string, boolean> = new Map<string, boolean>();

    for (let node in adjacencyList) {
        if (!visited.has(node)) {
            if (isCyclic(node, visited, backEdges)) {
                const cycle = Array.from(backEdges.keys());
                console.log(`Infinite redirect found in the cycle: ${cycle.join(' -> ')} -> ${node}`);
                return true;
            }
        }
    }
}

fs.createReadStream(`${process.cwd()}/docs/redirects.csv`)
    .pipe(parser)
    .on('data', (row) => {
        addEdge(row[0], row[1]);
    })
    .on('end', () => {
        if (detectCycle()) {
            process.exit(1);
        }
        process.exit(0);
    });
