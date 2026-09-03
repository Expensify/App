// cspell:ignore apos noverify smime

import {env, Glob, spawnSync} from 'bun';
import {join} from 'node:path';
import {createInterface} from 'node:readline/promises';

const TEAM_ID_PATTERN = /^[A-Z0-9]{10}$/;

type DevelopmentTeam = {
    id: string;
    name: string;
};

async function resolveDevelopmentTeam(developmentTeam: string | undefined, teams = installedDevelopmentTeams(), prompt = promptForDevelopmentTeam): Promise<string> {
    if (developmentTeam) {
        return developmentTeam;
    }
    return prompt(teams);
}

/** Finds valid signing teams in Xcode's current and legacy provisioning-profile directories and deduplicates them by team ID. */
function installedDevelopmentTeams(): DevelopmentTeam[] {
    const homeDirectory = env.HOME;
    if (!homeDirectory) {
        throw new Error('Could not locate provisioning profiles because HOME is not set.');
    }
    const profileDirectories = [join(homeDirectory, 'Library/Developer/Xcode/UserData/Provisioning Profiles'), join(homeDirectory, 'Library/MobileDevice/Provisioning Profiles')];
    const teams = new Map<string, DevelopmentTeam>();
    for (const directory of profileDirectories) {
        let profileNames: string[];
        try {
            profileNames = [...new Glob('*.mobileprovision').scanSync({cwd: directory, onlyFiles: true})];
        } catch {
            continue;
        }
        for (const profileName of profileNames) {
            const profile = decodeProvisioningProfile(join(directory, profileName));
            const team = profile ? parseDevelopmentTeamFromProvisioningProfile(profile) : undefined;
            if (team) {
                teams.set(team.id, team);
            }
        }
    }
    return [...teams.values()].toSorted((left, right) => left.name.localeCompare(right.name));
}

async function promptForDevelopmentTeam(teams: DevelopmentTeam[]): Promise<string> {
    if (teams.length === 0) {
        throw new Error('No Apple development teams were found. Add your Apple ID in Xcode > Settings > Accounts and download or create a provisioning profile, or pass --development-team.');
    }

    console.log('Select an Apple development team:');
    for (const [index, team] of teams.entries()) {
        console.log(`  ${index + 1}. ${team.name} (${team.id})`);
    }
    const readline = createInterface({input: process.stdin, output: process.stdout});
    try {
        while (true) {
            const answer = await readline.question('Team: ');
            const selectedTeam = teams.at(Number(answer) - 1);
            if (selectedTeam && /^\d+$/.test(answer.trim())) {
                return selectedTeam.id;
            }
            console.log(`Enter a number from 1 to ${teams.length}.`);
        }
    } finally {
        readline.close();
    }
}

/** Extracts the signing team from a decoded provisioning profile, excluding malformed and expired profiles. */
function parseDevelopmentTeamFromProvisioningProfile(profile: string, now = new Date()): DevelopmentTeam | undefined {
    const teamID = profile.match(/<key>TeamIdentifier<\/key>\s*<array>\s*<string>([^<]+)<\/string>/)?.at(1);
    const teamName = profile.match(/<key>TeamName<\/key>\s*<string>([^<]+)<\/string>/)?.at(1);
    const expirationDate = profile.match(/<key>ExpirationDate<\/key>\s*<date>([^<]+)<\/date>/)?.at(1);
    if (!teamID || !teamName || !TEAM_ID_PATTERN.test(teamID) || (expirationDate && new Date(expirationDate) <= now)) {
        return undefined;
    }
    return {id: teamID, name: decodeXml(teamName)};
}

/** Decodes the CMS payload in a provisioning profile, returning undefined when OpenSSL cannot verify or read it. */
function decodeProvisioningProfile(path: string): string | undefined {
    const result = spawnSync(['openssl', 'smime', '-verify', '-inform', 'der', '-noverify', '-in', path], {stdin: 'ignore', stderr: 'ignore'});
    return result.success ? result.stdout.toString() : undefined;
}

function decodeXml(value: string): string {
    return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
}

export {installedDevelopmentTeams, parseDevelopmentTeamFromProvisioningProfile, resolveDevelopmentTeam};
export type {DevelopmentTeam};
