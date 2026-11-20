/**
 * Measures the work iOS does with the device address book each time Start chat or the expense participant list gains focus.
 * The screens call getContactsExtended for every device contact, then useSearchSelector drops contacts whose login is
 * already a known account by running addSMSDomainIfPhoneNumber on every personal detail and every contact login.
 *
 * Scenarios, for N contacts:
 * - first import: N contacts whose numbers were never parsed before in this process (new numbers for every run).
 * - repeat import: the same N contacts imported again, as happens on every focus and every return to the foreground.
 * - dedupe: the login pass from useSearchSelector over 2,000 personal details and the N imported contacts.
 *
 * Contacts use fictional 555 numbers in four address-book formats, and 30% have an email, like a real address book.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/ContactImport.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/ContactImport.perf-local.ts' --runInBand
 */
import type {DeviceContact} from '@libs/ContactImport/types';
import {getContactsExtended} from '@libs/ContactUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';

import {formatPhoneNumber, localeCompare} from '../utils/TestHelper';

const RUNS = 10;
const WARMUP_RUNS = 1;
const TEST_TIMEOUT_MS = 20 * 60 * 1000;
const PERSONAL_DETAILS_COUNT = 2000;
const CONTACT_COUNTS = [1000, 2000, 5000];

// Area codes that are valid in libphonenumber's US metadata; every number is NXX-555-XXXX
const AREA_CODES = ['201', '202', '203', '205', '206', '207', '208', '209', '210', '212', '213', '214', '215', '216', '217', '218', '219', '224', '225', '228'];
/** Formats a 10-digit number the way people store it in an address book: "(201) 555-0123", "201-555-0123", "+1 201 555 0123" or "2015550123". */
function formatAsInAddressBook(digits: string, style: number): string {
    const areaCode = digits.slice(0, 3);
    const exchange = digits.slice(3, 6);
    const line = digits.slice(6);
    switch (style % 4) {
        case 0:
            return `(${areaCode}) ${exchange}-${line}`;
        case 1:
            return `${areaCode}-${exchange}-${line}`;
        case 2:
            return `+1 ${areaCode} ${exchange} ${line}`;
        default:
            return digits;
    }
}

let nextNumber = 0;

/** Device contacts whose phone numbers were never used before in this process. */
function createDeviceContacts(count: number): DeviceContact[] {
    const contacts: DeviceContact[] = [];
    for (let index = 0; index < count; index++) {
        const numberIndex = nextNumber++;
        const areaCode = AREA_CODES.at(numberIndex % AREA_CODES.length) ?? '201';
        const line = String(Math.floor(numberIndex / AREA_CODES.length) % 10000).padStart(4, '0');
        contacts.push({
            firstName: `Fake${numberIndex}`,
            lastName: `Contact${numberIndex}`,
            phoneNumbers: [{value: formatAsInAddressBook(`${areaCode}555${line}`, index)}],
            emailAddresses: index % 10 < 3 ? [{value: `fake${numberIndex}@example.com`}] : [],
        });
    }
    return contacts;
}

/** Personal detail logins: emails, with 5% phone logins on the SMS domain. */
const personalDetailLogins = Array.from({length: PERSONAL_DETAILS_COUNT}, (_, index) =>
    index % 20 === 0 ? `+1305555${String(index).padStart(4, '0')}${CONST.SMS.DOMAIN}` : `member${index}@example.com`,
);

/** The login pass from useSearchSelector's contact dedupe, calling the real addSMSDomainIfPhoneNumber. */
function dedupeContactLogins(contactLogins: string[]) {
    const existingLogins = new Set<string>();
    for (const login of personalDetailLogins) {
        existingLogins.add(addSMSDomainIfPhoneNumber(login).toLowerCase());
    }
    let keptContacts = 0;
    for (const contactLogin of contactLogins) {
        const login = addSMSDomainIfPhoneNumber(contactLogin).toLowerCase();
        if (!login || existingLogins.has(login)) {
            continue;
        }
        existingLogins.add(login);
        keptContacts++;
    }
    return keptContacts;
}

function importContacts(deviceContacts: DeviceContact[]) {
    return getContactsExtended(deviceContacts, localeCompare, formatPhoneNumber, 1, {});
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]; outlierDurations?: number[]}, details: string) {
    // Written to stdout directly so the numbers reach the CI log even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    const outliers = (result.outlierDurations ?? []).map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(
        `[ContactImportBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${RUNS} durations=[${durations}] outliers=[${outliers}] ${details}\n`,
    );
}

describe('Device contact import', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    test.each(CONTACT_COUNTS)(
        'first import of %i contacts',
        async (contactCount) => {
            // A new list for every run, made outside the measured function, so no run sees numbers parsed by an earlier one
            const contactLists = Array.from({length: RUNS + WARMUP_RUNS}, () => createDeviceContacts(contactCount));
            let run = 0;
            let rows = 0;
            const result = await measureFunction(
                () => {
                    rows = importContacts(contactLists.at(run++) ?? []).length;
                },
                {runs: RUNS, warmupRuns: WARMUP_RUNS, writeFile: false},
            );
            expect(rows).toBe(contactCount);
            writeResult(`first-import contacts=${contactCount}`, result, `rows=${rows}`);
        },
        TEST_TIMEOUT_MS,
    );

    test.each(CONTACT_COUNTS)(
        'repeat import of %i contacts',
        async (contactCount) => {
            const deviceContacts = createDeviceContacts(contactCount);
            // The screen already imported these contacts once when it first gained focus
            importContacts(deviceContacts);
            let rows = 0;
            const result = await measureFunction(
                () => {
                    rows = importContacts(deviceContacts).length;
                },
                {runs: RUNS, warmupRuns: WARMUP_RUNS, writeFile: false},
            );
            expect(rows).toBe(contactCount);
            writeResult(`repeat-import contacts=${contactCount}`, result, `rows=${rows}`);
        },
        TEST_TIMEOUT_MS,
    );

    test.each(CONTACT_COUNTS)(
        'dedupe of %i contacts against the personal details',
        async (contactCount) => {
            const contactLogins = importContacts(createDeviceContacts(contactCount)).map((contact) => contact.login ?? '');
            let keptContacts = 0;
            const result = await measureFunction(
                () => {
                    keptContacts = dedupeContactLogins(contactLogins);
                },
                {runs: RUNS, warmupRuns: WARMUP_RUNS, writeFile: false},
            );
            expect(keptContacts).toBe(contactCount);
            writeResult(`dedupe contacts=${contactCount} personalDetails=${PERSONAL_DETAILS_COUNT}`, result, `kept=${keptContacts}`);
        },
        TEST_TIMEOUT_MS,
    );
});
