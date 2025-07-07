"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMarkdown = void 0;
// From: https://raw.githubusercontent.com/callstack/reassure/main/packages/reassure-compare/src/output/markdown.ts
var promises_1 = require("node:fs/promises");
var path_1 = require("path");
var Logger = require("../../utils/logger");
var format = require("./format");
var markdownTable_1 = require("./markdownTable");
var MAX_CHARACTERS_PER_FILE = 65536;
var FILE_SIZE_SAFETY_MARGIN = 1000;
var MAX_CHARACTERS_PER_FILE_WITH_SAFETY_MARGIN = MAX_CHARACTERS_PER_FILE - FILE_SIZE_SAFETY_MARGIN;
var tableHeader = ['Name', 'Duration'];
var collapsibleSection = function (title, content) { return "<details>\n<summary>".concat(title, "</summary>\n\n").concat(content, "\n</details>\n\n"); };
var buildDurationDetails = function (title, entry, unit) {
    var relativeStdev = entry.stdev / entry.mean;
    return [
        "**".concat(title, "**"),
        "Mean: ".concat(format.formatMetric(entry.mean, unit)),
        "Stdev: ".concat(format.formatMetric(entry.stdev, unit), " (").concat(format.formatPercent(relativeStdev), ")"),
        entry.entries ? "Runs: ".concat(entry.entries.join(' ')) : '',
    ]
        .filter(Boolean)
        .join('<br/>');
};
var buildDurationDetailsEntry = function (entry) {
    return ['baseline' in entry ? buildDurationDetails('Baseline', entry.baseline, entry.unit) : '', 'current' in entry ? buildDurationDetails('Current', entry.current, entry.unit) : '']
        .filter(Boolean)
        .join('<br/><br/>');
};
var formatEntryDuration = function (entry) {
    if ('baseline' in entry && 'current' in entry) {
        return format.formatMetricDiffChange(entry);
    }
    if ('baseline' in entry) {
        return format.formatMetric(entry.baseline.mean, entry.unit);
    }
    if ('current' in entry) {
        return format.formatMetric(entry.current.mean, entry.unit);
    }
    return '';
};
var buildDetailsTable = function (entries, numberOfTables) {
    if (numberOfTables === void 0) { numberOfTables = 1; }
    if (!entries.length) {
        return [''];
    }
    // We always need at least one table
    var safeNumberOfTables = numberOfTables === 0 ? 1 : numberOfTables;
    var entriesPerTable = Math.floor(entries.length / safeNumberOfTables);
    var tables = [];
    for (var i = 0; i < safeNumberOfTables; i++) {
        var start = i * entriesPerTable;
        var end = i === safeNumberOfTables - 1 ? entries.length : start + entriesPerTable;
        var tableEntries = entries.slice(start, end);
        var rows = tableEntries.map(function (entry) { return [entry.name, buildDurationDetailsEntry(entry)]; });
        var content = (0, markdownTable_1.default)(__spreadArray([tableHeader], rows, true));
        var tableMarkdown = collapsibleSection('Show details', content);
        tables.push(tableMarkdown);
    }
    return tables;
};
var buildSummaryTable = function (entries, collapse) {
    if (collapse === void 0) { collapse = false; }
    if (!entries.length) {
        return '_There are no entries_';
    }
    var rows = entries.map(function (entry) { return [entry.name, formatEntryDuration(entry)]; });
    var content = (0, markdownTable_1.default)(__spreadArray([tableHeader], rows, true));
    return collapse ? collapsibleSection('Show entries', content) : content;
};
var buildMarkdown = function (data, skippedTests, numberOfExtraFiles) {
    var _a, _b, _c;
    var singleFileOutput;
    var nExtraFiles = numberOfExtraFiles !== null && numberOfExtraFiles !== void 0 ? numberOfExtraFiles : 0;
    // If the user didn't specify the number of extra files, calculate it based on the size of the single file
    if (numberOfExtraFiles === undefined) {
        singleFileOutput = buildMarkdown(data, skippedTests, 0)[0];
        var totalCharacters = (_a = singleFileOutput.length) !== null && _a !== void 0 ? _a : 0;
        // If the single file is small enough, return it
        if (totalCharacters <= MAX_CHARACTERS_PER_FILE_WITH_SAFETY_MARGIN) {
            return [singleFileOutput];
        }
        // Otherwise, calculate the number of extra files needed
        nExtraFiles = Math.ceil(totalCharacters / MAX_CHARACTERS_PER_FILE_WITH_SAFETY_MARGIN);
    }
    var mainFile = '## Performance Comparison Report 📊';
    mainFile += nExtraFiles > 0 ? " (1/".concat(nExtraFiles + 1, ")") : '';
    if ((_b = data.errors) === null || _b === void 0 ? void 0 : _b.length) {
        mainFile += '\n\n### Errors\n';
        data.errors.forEach(function (message) {
            mainFile += " 1. \uD83D\uDED1 ".concat(message, "\n");
        });
    }
    if ((_c = data.warnings) === null || _c === void 0 ? void 0 : _c.length) {
        mainFile += '\n\n### Warnings\n';
        data.warnings.forEach(function (message) {
            mainFile += " 1. \uD83D\uDFE1 ".concat(message, "\n");
        });
    }
    if (skippedTests.length > 0) {
        mainFile += "\n\n\u26A0\uFE0F Some tests did not pass successfully, so some results are omitted from final report: ".concat(skippedTests.join(', '));
    }
    mainFile += '\n\n### Significant Changes To Duration';
    mainFile += "\n".concat(buildSummaryTable(data.significance));
    mainFile += "\n".concat(buildDetailsTable(data.significance, 1).at(0));
    // We always need at least one table
    var numberOfMeaninglessDetailsTables = nExtraFiles === 0 ? 1 : nExtraFiles;
    var meaninglessDetailsTables = buildDetailsTable(data.meaningless, numberOfMeaninglessDetailsTables);
    if (nExtraFiles === 0) {
        mainFile += '\n\n### Meaningless Changes To Duration';
        mainFile += "\n".concat(buildSummaryTable(data.meaningless, true));
        mainFile += "\n".concat(meaninglessDetailsTables.at(0));
        return [mainFile];
    }
    var extraFiles = [];
    for (var i = 0; i < nExtraFiles; i++) {
        var extraFile = '## Performance Comparison Report 📊';
        extraFile += " (".concat(i + 2, "/").concat(nExtraFiles + 1, ")");
        extraFile += '\n\n### Meaningless Changes To Duration';
        extraFile += nExtraFiles >= 2 ? " (".concat(i + 1, "/").concat(nExtraFiles, ")") : '';
        extraFile += "\n".concat(buildSummaryTable(data.meaningless, true));
        extraFile += "\n".concat(meaninglessDetailsTables.at(i));
        extraFile += '\n';
        extraFiles.push(extraFile);
    }
    return __spreadArray([mainFile], extraFiles, true);
};
exports.buildMarkdown = buildMarkdown;
var writeToFile = function (filePath, content) {
    return promises_1.default
        .writeFile(filePath, content)
        .then(function () {
        Logger.info("\u2705  Written output markdown output file ".concat(filePath));
        Logger.info("\uD83D\uDD17 ".concat(path_1.default.resolve(filePath), "\n"));
    })
        .catch(function (error) {
        Logger.info("\u274C  Could not write markdown output file ".concat(filePath));
        Logger.info("\uD83D\uDD17 ".concat(path_1.default.resolve(filePath)));
        console.error(error);
        throw error;
    });
};
var writeToMarkdown = function (outputDir, data, skippedTests) {
    var markdownFiles = buildMarkdown(data, skippedTests);
    var filesString = markdownFiles.join('\n\n');
    Logger.info('Markdown was built successfully, writing to file...', filesString);
    if (markdownFiles.length === 1) {
        return writeToFile(path_1.default.join(outputDir, 'output1.md'), markdownFiles[0]);
    }
    return Promise.all(markdownFiles.map(function (file, index) {
        var filePath = "".concat(outputDir, "/output").concat(index + 1, ".md");
        return writeToFile(filePath, file).catch(function (error) {
            console.error(error);
            throw error;
        });
    }));
};
exports.default = writeToMarkdown;
