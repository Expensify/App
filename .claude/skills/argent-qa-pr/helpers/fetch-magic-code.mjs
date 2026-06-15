#!/usr/bin/env node
/**
 * fetch-magic-code.mjs — fetch the latest Expensify login code from a Gmail inbox.
 *
 * Uses `imap` + `mailparser` (run `npm install` in this dir once) because the code lives
 * in a quoted-printable HTML email body that needs real MIME decoding.
 *   node fetch-magic-code.mjs [--from expensify] [--timeout 90]
 *
 * Prints ONLY the 6-digit code to stdout. Exit 0 ok / 1 timeout / 2 bad config / 3 IMAP.
 *
 * Credentials — a Gmail **App Password** (needs 2FA + IMAP). Resolved in order:
 *   env GMAIL_USER + GMAIL_APP_PASSWORD  →  local .env (see .env.example)  →  macOS Keychain
 *   (security add-generic-password -s "expensify-auto-login" -a "<gmail>" -w "<app-pw>")
 *
 * NOTE: Expensify's email subject is "Your Expensify security code" (sender
 * concierge@expensify.com) and the 6-digit code is in the BODY — so we search broadly
 * (unseen, from expensify) and extract the code from the decoded text/html.
 * Idea/credit: adamgrzybowski/expensify-auto-login.
 */
import Imap from 'imap';
import {simpleParser} from 'mailparser';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const arg = (n, d) => {
    const i = process.argv.indexOf(`--${n}`);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};

// Credentials precedence: process env → local .env (gitignored) → macOS Keychain.
// The .env path means no Keychain access prompt for a throwaway test account.
const fileEnv = {};
try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
    for (const l of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m) fileEnv[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
} catch {
    /* no .env file — fine */
}

const USER = process.env.GMAIL_USER || fileEnv.GMAIL_USER || arg('user', '');
const FROM = arg('from', 'expensify');
const TIMEOUT = parseInt(arg('timeout', '90'), 10) * 1000;
const imapUser = USER.replace(/\+[^@]+@/, '@');
let PASS = process.env.GMAIL_APP_PASSWORD || fileEnv.GMAIL_APP_PASSWORD || '';
if (!PASS) {
    try {
        PASS = execSync(`security find-generic-password -s "expensify-auto-login" -a "${imapUser}" -w`, {stdio: ['ignore', 'pipe', 'ignore']})
            .toString()
            .trim();
    } catch {
        /* not in keychain */
    }
}
if (!USER || !PASS) {
    console.error('ERR(2): need GMAIL_USER + App Password (env GMAIL_APP_PASSWORD or Keychain service "expensify-auto-login").');
    process.exit(2);
}

const imap = new Imap({user: imapUser, password: PASS, host: 'imap.gmail.com', port: 993, tls: true, tlsOptions: {servername: 'imap.gmail.com'}});
const openInbox = () => new Promise((res, rej) => imap.openBox('INBOX', false, (e, b) => (e ? rej(e) : res(b))));
const search = (crit) => new Promise((res, rej) => imap.search(crit, (e, r) => (e ? rej(e) : res(r || []))));

function extractCodeFromMatches(uids) {
    return new Promise((resolve, reject) => {
        const f = imap.fetch(uids, {bodies: ''});
        const found = [];
        let pending = uids.length;
        const done = () => {
            if (pending > 0) return;
            if (!found.length) return resolve(null);
            found.sort((a, b) => b.date - a.date);
            const best = found[0];
            imap.addFlags(best.uid, '\\Seen', () => {});
            resolve(best.code);
        };
        f.on('message', (msg) => {
            let uid;
            msg.once('attributes', (a) => (uid = a.uid));
            msg.on('body', async (stream) => {
                try {
                    const p = await simpleParser(stream);
                    const hay = `${p.subject || ''}\n${p.text || ''}\n${p.html || ''}`;
                    const m = hay.match(/(?:code|magic)[^\d]{0,40}(\d{6})/i) || hay.match(/\b(\d{6})\b/);
                    if (m) found.push({uid, code: m[1], date: p.date || new Date(0)});
                } catch {
                    /* skip unparseable */
                }
                pending--;
                done();
            });
        });
        f.once('error', reject);
    });
}

(async () => {
    const start = Date.now();
    await new Promise((res, rej) => {
        imap.once('ready', res);
        imap.once('error', rej);
        imap.connect();
    }).catch((e) => {
        console.error('ERR(3): IMAP login failed —', e.message, '(check App Password / IMAP enabled).');
        process.exit(3);
    });
    await openInbox();
    console.error(`⏳ waiting for Expensify code email from *${FROM}* (up to ${TIMEOUT / 1000}s)...`);
    while (Date.now() - start < TIMEOUT) {
        try {
            const uids = await search(['UNSEEN', ['FROM', FROM]]);
            if (uids.length) {
                const code = await extractCodeFromMatches(uids);
                if (code) {
                    process.stdout.write(code + '\n');
                    imap.end();
                    process.exit(0);
                }
            }
        } catch (e) {
            console.error('(search retry:', e.message + ')');
        }
        await new Promise((r) => setTimeout(r, 3000));
    }
    console.error('ERR(1): timed out waiting for the code email.');
    imap.end();
    process.exit(1);
})();
