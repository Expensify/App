import {isRecord} from '@libs/ObjectUtils';

type JourneyReport = {
    query: string;
    resultLabelPrefix: string;
    title: string;
};

type JourneyFixture = {
    accountEmail: string;
    accountClass: 'heavy';
    description: string;
    report: JourneyReport;
    personalChat: JourneyReport;
    allowMessages: boolean;
    scrolls: number;
    tabCycles: number;
};

/** Require an explicitly selected heavy account instead of silently training on whoever is signed in. */
function parseJourneyFixture(input: unknown): JourneyFixture {
    if (!isRecord(input) || input.accountClass !== 'heavy') {
        throw new Error('The journey requires a fixture with accountClass="heavy", approved by the account owner.');
    }
    const accountEmail = requiredString(input.accountEmail, 'accountEmail');
    if (!accountEmail.includes('@')) {
        throw new Error('accountEmail must identify the approved heavy account.');
    }
    const personalChat = parseReport(input.personalChat, 'personalChat');
    if (personalChat.query !== accountEmail || !personalChat.title.endsWith('(you)') || personalChat.resultLabelPrefix !== `${personalChat.title}, ${accountEmail}`) {
        throw new Error('personalChat must be the approved account\'s own "(you)" chat, with its email as query and its title and email in resultLabelPrefix.');
    }
    return {
        accountEmail,
        accountClass: 'heavy',
        description: requiredString(input.description, 'description'),
        report: parseReport(input.report, 'report'),
        personalChat,
        allowMessages: input.allowMessages === true,
        scrolls: boundedInteger(input.scrolls ?? 8, 'scrolls', 4, 30),
        tabCycles: boundedInteger(input.tabCycles ?? 3, 'tabCycles', 2, 10),
    };
}

function parseReport(input: unknown, name: string): JourneyReport {
    if (!isRecord(input)) {
        throw new Error(`${name} must specify query, resultLabelPrefix, and title.`);
    }
    return {
        query: requiredString(input.query, `${name}.query`),
        resultLabelPrefix: requiredString(input.resultLabelPrefix, `${name}.resultLabelPrefix`),
        title: requiredString(input.title, `${name}.title`),
    };
}

function requiredString(input: unknown, name: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
        throw new Error(`${name} must be a nonempty string.`);
    }
    return input.trim();
}

function boundedInteger(input: unknown, name: string, minimum: number, maximum: number): number {
    if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < minimum || input > maximum) {
        throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
    }
    return input;
}

export {parseJourneyFixture};
export type {JourneyFixture, JourneyReport};
