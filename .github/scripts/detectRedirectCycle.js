"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var csv_parse_1 = require("csv-parse");
var fs_1 = require("fs");
var parser = (0, csv_parse_1.parse)();
var adjacencyList = {};
var visited = new Map();
var backEdges = new Map();
function addEdge(source, target) {
    if (!adjacencyList[source]) {
        adjacencyList[source] = [];
    }
    adjacencyList[source].push(target);
}
function isCyclic(currentNode) {
    visited.set(currentNode, true);
    backEdges.set(currentNode, true);
    // Do a depth first search for all the neighbours. If a node is found in backedge, a cycle is detected.
    var neighbours = adjacencyList[currentNode];
    if (neighbours) {
        for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
            var node = neighbours_1[_i];
            if (!visited.has(node)) {
                if (isCyclic(node)) {
                    return true;
                }
            }
            else if (backEdges.has(node)) {
                return true;
            }
        }
    }
    backEdges.delete(currentNode);
    return false;
}
function detectCycle() {
    for (var _i = 0, _a = Object.entries(adjacencyList); _i < _a.length; _i++) {
        var node = _a[_i][0];
        if (!visited.has(node)) {
            if (isCyclic(node)) {
                var cycle = Array.from(backEdges.keys());
                console.log("Infinite redirect found in the cycle: ".concat(cycle.join(' -> '), " -> ").concat(node));
                return true;
            }
        }
    }
    return false;
}
fs_1.default.createReadStream("".concat(process.cwd(), "/docs/redirects.csv"))
    .pipe(parser)
    .on('data', function (row) {
    // Create a directed graph of sourceURL -> targetURL
    addEdge(row[0], row[1]);
})
    .on('end', function () {
    if (detectCycle()) {
        process.exit(1);
    }
    process.exit(0);
});
