#!/usr/bin/env ts-node
import fs from 'fs';
import * as Logger from './utils/Logger';

Logger.log(' measuring list commits');
fs.readFile('/Users/jakubszymczak/Desktop/pomiary-search-page/FLASH-FIRST2.json', 'utf8', (err, data) => {
    if (err) {
        Logger.log('Error reading the file:', err);
        return;
    }

    try {
        const profile = JSON.parse(data);
        const commits = profile.dataForRoots[0].commitData || [];
        Logger.log(`${profile.dataForRoots[0].commitData[0].duration}`);
        let totalRenderTime = 0;

        commits.forEach((commit) => {
            if (commit.duration != null) {
                totalRenderTime += commit.duration;
                totalRenderTime += commit.effectDuration;
                totalRenderTime += commit.passiveEffectDuration;
            }
        });

        Logger.log(`Total Render Time plus effects: ${totalRenderTime} ms`);
        Logger.log(`Commits ${profile.dataForRoots[0].commitData.length}`);
    } catch (parseError) {
        Logger.log('Error parsing the JSON:', parseError);
    }
});
