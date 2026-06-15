#!/usr/bin/env node
/**
 * scan-prs.mjs — scan open Expensify/App PRs, keep the mobile-native ones, and rate how
 * hard each would be to QA with the `argent-qa-pr` skill (🟢 Easy / 🟡 Medium / 🔴 Hard).
 *
 *   node scan-prs.mjs [--limit 80] [--json <path>]
 *
 * Prints a markdown table (candidates easy→hard, then a collapsed skipped section).
 * Requires the `gh` CLI to be authenticated. One issue fetch per PR, so it's a bit slow.
 *
 * The rating is a heuristic first pass from the linked issue's reproduced platforms +
 * keyword flags + step count. It is meant to be sanity-checked by a human/agent, not
 * trusted blindly — see SKILL.md.
 */
import {execSync} from 'node:child_process';
import fs from 'node:fs';

const arg = (n, d) => {
    const i = process.argv.indexOf(`--${n}`);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const LIMIT = parseInt(arg('limit', '80'), 10);
const JSON_OUT = arg('json', '');
const REPO = 'Expensify/App';
const gh = (c) => {
    try {
        return execSync(c, {maxBuffer: 1e8, stdio: ['ignore', 'pipe', 'ignore']}).toString();
    } catch (e) {
        return e.stdout ? e.stdout.toString() : '';
    }
};
const sec = (b, s, e) => {
    const i = b.search(new RegExp(s, 'i'));
    if (i < 0) return '';
    const x = b.slice(i + s.length);
    const j = e ? x.search(new RegExp(e, 'i')) : -1;
    return (j < 0 ? x : x.slice(0, j)).trim();
};

console.error(`Scanning up to ${LIMIT} open PRs in ${REPO}...`);
const prs = JSON.parse(gh(`gh pr list --repo ${REPO} --state open --limit ${LIMIT} --json number,title,body,isDraft`) || '[]');
const rows = [];
const counts = {webOnly: 0, other: 0, noIssue: 0, drafts: 0};

for (const p of prs) {
    if (p.isDraft) {
        counts.drafts++;
        continue;
    }
    if (/\[no ?qa\]/i.test(p.title)) {
        counts.other++;
        continue;
    }
    if (/\[(wip|hold)\]|\b(revert|do not merge|dnm)\b/i.test(p.title)) {
        rows.push({pr: p.number, issue: '', title: p.title, plat: '', diff: '—', status: 'SKIPPED_OTHER', note: 'WIP / hold / revert'});
        counts.other++;
        continue;
    }
    const m = (p.body || '').match(/issues\/(\d+)/);
    if (!m) {
        counts.noIssue++;
        rows.push({pr: p.number, issue: '', title: p.title, plat: '?', diff: '?', status: 'UNKNOWN', note: 'no linked issue — triage by hand'});
        continue;
    }
    const issue = m[1];
    const ij = JSON.parse(gh(`gh issue view ${issue} --repo ${REPO} --json body`) || '{}');
    const b = ij.body || '';
    const checked = b
        .split('\n')
        .filter((l) => /\[x\]/i.test(l) && /(Android|iOS|mWeb|MacOS|Windows)/i.test(l))
        .map((l) => l.replace(/^\s*-?\s*\[x\]\s*/i, '').trim());
    const native = checked.filter((c) => /^(Android: App|iOS: App)/i.test(c)).map((c) => c.split(':')[0].trim());
    const hasWeb = checked.some((c) => /Windows|MacOS|mWeb/i.test(c));
    if (native.length === 0) {
        if (hasWeb) {
            counts.webOnly++;
            rows.push({pr: p.number, issue, title: p.title, plat: 'web/mWeb', diff: '—', status: 'SKIPPED_WEB_ONLY', note: 'only web/mWeb reproduced'});
        } else {
            counts.other++;
            rows.push({pr: p.number, issue, title: p.title, plat: '—', diff: '—', status: 'SKIPPED_OTHER', note: 'no Platforms checklist (refactor/chore/tracking?) — triage by hand'});
        }
        continue;
    }
    const action = sec(b, '## Action Performed:?', '## Expected');
    const steps = action.split('\n').filter((l) => /^\s*\d+\./.test(l)).length;
    const lo = b.toLowerCase();
    // Raw keyword SIGNALS — factual hints only (NOT a verdict). They help the agent decide which
    // candidates to deep-dive first. The scout does NOT rate difficulty or setup: the agent judges
    // that per candidate by reading the full PR + linked issue/PROPOSAL + `gh pr diff` (see SKILL.md).
    const sig = [];
    if (/qbo|quickbooks|xero|netsuite|sage|intacct|certinia|accounting/.test(lo)) sig.push('accounting');
    if (/plaid|bank account|company card|expensify card|reimburs/.test(lo)) sig.push('bank/card');
    if (/copilot|delegate/.test(lo)) sig.push('copilot/delegate');
    if (/invite member|approver|workflow|submit workspace|\badmin\b/.test(lo)) sig.push('ws/roles');
    if (/offline|airplane/.test(lo)) sig.push('offline');
    if (/4 finger|four finger|test tool|biometric/.test(lo)) sig.push('test-tool');
    if (/share (a )?(photo|image)|share sheet|native share/.test(lo)) sig.push('native-share');
    if (/deep ?link|\/r\//.test(lo)) sig.push('deeplink');
    if (/sign ?up|new gmail|new account/.test(lo)) sig.push('signup');
    if (/onboarding|employee step/.test(lo)) sig.push('onboarding');
    if (/\brooms?\b/.test(lo)) sig.push('rooms');
    if (/(log|sign) ?out|logged ?out|anonymous|anon user/.test(lo)) sig.push('logged-out');

    rows.push({pr: p.number, issue, title: p.title, plat: native.join('+') + (hasWeb ? '+web' : ''), status: 'CANDIDATE', signals: [...new Set(sig)].join(', '), steps});
}

const cands = rows.filter((r) => r.status === 'CANDIDATE');
const skipped = rows.filter((r) => r.status !== 'CANDIDATE');
const esc = (s) => (s || '').replace(/\|/g, '\\|').slice(0, 70);
// No row numbering here — PRs are identified by PR number. The agent re-ranks/numbers after judging.
const line = (r) => `| [#${r.pr}](https://github.com/Expensify/App/pull/${r.pr}) | ${r.issue || '—'} | ${esc(r.title)} | ${r.plat || ''} | ${r.status} | ${esc(r.note)} |`;
// Candidate line: FACTUAL columns only (platforms, step count, raw signals) — no verdict.
const cline = (r) => `| [#${r.pr}](https://github.com/Expensify/App/pull/${r.pr}) | ${r.issue || '—'} | ${esc(r.title)} | ${r.plat || ''} | ${r.steps || '?'} | ${esc(r.signals) || '—'} |`;

let out = `## Mobile-native QA candidates (${cands.length}) — agent judges each\n\n`;
out += "_The scout only filters to **mobile-native** PRs. **Difficulty + setup/feasibility is the agent's call**:\n";
out += 'for each candidate, read the full PR body + linked issue/PROPOSAL + `gh pr diff <n>`, then rate it and\n';
out += 'plan the setup (see `argent-qa-pr` SKILL.md → Phase 1.5). "Signals" below are raw keyword hits to help\n';
out += 'prioritize which to open first — they are NOT a verdict._\n\n';
out += '| PR | Issue | Title | Platforms | Steps | Signals (raw hints) |\n|---|---|---|---|---|---|\n';
out += cands.map((r) => cline(r)).join('\n') + '\n\n';
out += `<details><summary>Skipped / web-only / other (${skipped.length})</summary>\n\n`;
out += '| PR | Issue | Title | Platforms | Status | Note |\n|---|---|---|---|---|---|\n';
out += skipped.map((r) => line(r)).join('\n') + '\n</details>\n';
console.log(out);
console.error(`\nScanned ${prs.length} PRs → ${cands.length} candidates, ${counts.webOnly} web-only, ${counts.other} chore/WIP/NoQA, ${counts.noIssue} no-issue, ${counts.drafts} drafts.`);
if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({generatedAt: new Date().toISOString(), candidates: cands, skipped}, null, 2));
    console.error('Wrote ' + JSON_OUT);
}
