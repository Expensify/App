#!/usr/bin/env node

const GitUtils = require('../../.github/libs/GitUtils');

GitUtils.getPullRequestsMergedBetween(process.argv[2], process.argv[3]);
