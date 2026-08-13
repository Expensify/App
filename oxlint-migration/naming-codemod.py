#!/usr/bin/env python3
"""Codemod for wiring `hosted/naming-convention` (see OXLINT_MIGRATION_INVESTIGATION.md).

Same story as the earlier waves: the rule reports zero *genuine* violations, but oxlint hosts it
under the `hosted/` alias (oxlint rejects `@typescript-eslint` as a JS-plugin name -- "reserved,
already implemented natively"), so the `eslint-disable` comments that silence it in ESLint no
longer match. Unlike the earlier waves, most of these are block comments rather than line ones.

    python3 oxlint-migration/naming-codemod.py [oxlint-report.json] [--apply]

Two passes, both prepending on the SAME line so no line numbers move, and both idempotent:

  A. block regions, driven by the source: every `/* eslint-disable @typescript-eslint/naming-
     convention */` gets an `/* oxlint-disable hosted/naming-convention */`, and every matching
     `eslint-enable` gets the `oxlint-enable` twin. Mirroring the enable matters -- an oxlint
     disable with no enable would silence the rest of the file, hiding real violations.
  B. line anchors, driven by the oxlint report: findings outside any block region sit on an
     `eslint-disable-next-line` / `-line` comment, which gets the same-line combo -- EXCEPT where
     that comment sits between a JSDoc block and the declaration. Prepending a block comment there
     makes `/* oxlint-… */` the comment immediately before the member, so `jsdoc/require-jsdoc`
     stops seeing the doc and reports (caught by re-running ESLint: 15 new findings). Those sites
     get a trailing `// oxlint-disable-line` on the code line instead, which leaves the JSDoc
     adjacency intact -- the same shape already used for the typescript/no-deprecated write sites.

A finding that neither pass covers is a genuine divergence: reported, never patched.
Default is a dry run.

Run it, re-run oxlint, run it again until the report is empty. That is not belt-and-braces: an
unclosed `oxlint-disable` block silences the rest of its file, so fixing one region reveals the
line-level findings below it that were masked before.
"""

import json
import os
import re
import subprocess
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OX_CODE = 'hosted(naming-convention)'
OX_ID = 'hosted/naming-convention'
ES_ID = '@typescript-eslint/naming-convention'

APPLY = '--apply' in sys.argv
positional = [a for a in sys.argv[1:] if not a.startswith('-')]
REPORT = positional[0] if positional else '/tmp/oxlint-full-nc.json'

BLOCK_DISABLE = re.compile(r'/\*\s*eslint-disable\s')
BLOCK_ENABLE = re.compile(r'/\*\s*eslint-enable\s')


def is_block_directive(text, pattern):
    """A block eslint-disable/enable for our rule, as opposed to a -next-line / -line one."""
    return bool(pattern.search(text)) and ES_ID in text and 'disable-next-line' not in text and 'disable-line' not in text


def block_regions(lines):
    """(start, end) line indexes where the rule is switched off for a whole region."""
    regions, start = [], None
    for index, text in enumerate(lines):
        if start is None and is_block_directive(text, BLOCK_DISABLE):
            start = index
        elif start is not None and is_block_directive(text, BLOCK_ENABLE):
            regions.append((start, index))
            start = None
    if start is not None:
        regions.append((start, len(lines) - 1))
    return regions


def prepend(text, marker, directive):
    """Inserts `/* directive OX_ID */ ` in front of the eslint comment, once."""
    if OX_ID in text:
        return text
    position = text.find(marker)
    if position < 0:
        return None
    return f'{text[:position]}/* {directive} {OX_ID} */ {text[position:]}'


def read_lines(path):
    """newline='' so a CRLF file stays CRLF -- text mode would rewrite every line ending."""
    return open(path, newline='').read().split('\n')


def write_lines(path, lines):
    open(path, 'w', newline='').write('\n'.join(lines))


def candidate_files(reported):
    """Files that need directive mirroring: the ones oxlint reports, plus the ones already patched.

    Deliberately NOT every file matching a grep for the rule: `.github/actions/**/index.js` are
    generated bundles that oxlint ignores, and touching them adds 30k lines of pure noise.
    """
    out = subprocess.run(
        ['git', 'grep', '-l', '-e', f'oxlint-disable {OX_ID}', '-e', f'oxlint-enable {OX_ID}'],
        capture_output=True, text=True, cwd=ROOT,
    )
    patched = [line for line in out.stdout.split('\n') if line]
    return sorted(set(patched) | set(reported))


def main():
    diagnostics = json.load(open(REPORT))['diagnostics']
    reported = defaultdict(list)
    for diagnostic in diagnostics:
        if diagnostic['code'] == OX_CODE:
            reported[diagnostic['filename']].append(diagnostic['labels'][0]['span']['line'])

    block_edits = defaultdict(dict)  # file -> index -> directive
    line_edits = defaultdict(set)
    trailing_edits = defaultdict(set)  # file -> index of the code line
    leftovers = []

    for rel in candidate_files(reported):
        path = os.path.join(ROOT, rel)
        try:
            lines = read_lines(path)
        except OSError:
            continue
        for start, end in block_regions(lines):
            if OX_ID not in lines[start]:
                block_edits[rel][start] = 'oxlint-disable'
            if is_block_directive(lines[end], BLOCK_ENABLE) and OX_ID not in lines[end]:
                block_edits[rel][end] = 'oxlint-enable'

    for rel, reported_lines in sorted(reported.items()):
        path = os.path.join(ROOT, rel)
        try:
            lines = read_lines(path)
        except OSError:
            leftovers.append((rel, 0, 'unreadable'))
            continue
        regions = block_regions(lines)
        for line in sorted(set(reported_lines)):
            index = line - 1
            if any(start <= index <= end for start, end in regions):
                continue  # pass A covers it
            above = lines[index - 1] if index >= 1 else ''
            same = lines[index]
            if 'eslint-disable-next-line' in above and ES_ID in above:
                # a JSDoc directly above the anchor must stay adjacent to the declaration
                if index >= 2 and lines[index - 2].strip().endswith('*/'):
                    trailing_edits[rel].add(index)
                else:
                    line_edits[rel].add(index - 1)
            elif 'eslint-disable-line' in same and ES_ID in same:
                line_edits[rel].add(index)
            else:
                leftovers.append((rel, line, same.strip()[:90]))

    print(f'report: {sum(len(v) for v in reported.values())} findings in {len(reported)} files')
    print(f'  A. block directives to mirror: {sum(len(v) for v in block_edits.values())} in {len(block_edits)} files')
    print(f'  B. line comments to migrate:   {sum(len(v) for v in line_edits.values())} in {len(line_edits)} files')
    print(f'  B. trailing (JSDoc-adjacent):  {sum(len(v) for v in trailing_edits.values())} in {len(trailing_edits)} files')
    print(f'  NOT covered by any disable comment (genuine divergences): {len(leftovers)}')
    for item in leftovers[:25]:
        print('    LEFTOVER', *item)

    if not APPLY:
        print('dry run -- pass --apply to write')
        return

    touched = set()
    for rel, per_index in block_edits.items():
        path = os.path.join(ROOT, rel)
        lines = read_lines(path)
        for index, directive in per_index.items():
            marker = '/* eslint-disable' if directive == 'oxlint-disable' else '/* eslint-enable'
            updated = prepend(lines[index], marker, directive)
            if updated is None:
                print('SKIP (no anchor)', rel, index + 1)
                continue
            lines[index] = updated
        write_lines(path, lines)
        touched.add(rel)

    for rel, indexes in line_edits.items():
        path = os.path.join(ROOT, rel)
        lines = read_lines(path)
        for index in indexes:
            text = lines[index]
            directive = 'oxlint-disable-next-line' if 'eslint-disable-next-line' in text else 'oxlint-disable-line'
            marker = '// eslint-disable' if '// eslint-disable' in text else '/* eslint-disable'
            updated = prepend(text, marker, directive)
            if updated is None:
                print('SKIP (no anchor)', rel, index + 1)
                continue
            lines[index] = updated
        write_lines(path, lines)
        touched.add(rel)

    for rel, indexes in trailing_edits.items():
        path = os.path.join(ROOT, rel)
        lines = read_lines(path)
        for index in indexes:
            if OX_ID not in lines[index]:
                lines[index] += f' // oxlint-disable-line {OX_ID}'
        write_lines(path, lines)
        touched.add(rel)

    print(f'applied to {len(touched)} files')


if __name__ == '__main__':
    main()
