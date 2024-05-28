import {parse} from 'csv-parse';
import fs from 'fs';

const parser = parse();

const adjacencyList: Record<string, string[]> = {};
const visited: Map<string, boolean> = new Map<string, boolean>();
const backEdges: Map<string, boolean> = new Map<string, boolean>();

function addEdge(source: string, target: string) {
    if (!adjacencyList[source]) {
        adjacencyList[source] = [];
    }
    adjacencyList[source].push(target);
}

function isCyclic(currentNode: string): boolean {
    visited.set(currentNode, true);
    backEdges.set(currentNode, true);

    // Do a depth first search for all the neighbours. If a node is found in backedge, a cycle is detected.
    const neighbours = adjacencyList[currentNode];
    if (neighbours) {
        for (const node of neighbours) {
            if (!visited.has(node)) {
                if (isCyclic(node)) {
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

function detectCycle(): boolean {
    for (const [node] of Object.entries(adjacencyList)) {
        if (!visited.has(node)) {
            if (isCyclic(node)) {
                const cycle = Array.from(backEdges.keys());
                console.log(`Infinite redirect found in the cycle: ${cycle.join(' -> ')} -> ${node}`);
                return true;
            }
        }
    }
    return false;
}

fs.createReadStream(`${process.cwd()}/docs/redirects.csv`)
    .pipe(parser)
    .on('data', (row: [string, string]) => {
        // Create a directed graph of sourceURL -> targetURL
        addEdge(row[0], row[1]);
    })
    .on('end', () => {
        if (detectCycle()) {
            process.exit(1);
        }
        process.exit(0);
    });
