// Fixture for no-restricted-syntax, hosted through `core/` because oxlint has no native port: the
// rule matches esquery selectors, so this is also the only place the bridge's selector engine is
// tested, including the regex attribute matches and the `:not(:has(...))` in the Pressable rule.
//
// One violation per selector the repo configures, except WithStatement: `with` is a parse error in a
// module on both tools, so that selector is unreachable here for the same reason no-octal needs a
// script-mode file.
import * as Parent from '../ParentModule';
import * as Sibling from './SiblingModule';
import * as Libs from '@libs/SomeLib';
import * as ReportActions from '@userActions/Report';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import React from 'react';

enum Status {
    Active,
}

const Wrapped = React.forwardRef(() => null);

function scan(rows: number[]) {
    outer: for (const row of rows) {
        if (row > 0) {
            break outer;
        }
    }
    return [Parent, Sibling, Libs, ReportActions];
}

const trigger = <PressableWithoutFeedback onPress={() => {}} />;

export {scan, Status, trigger, Wrapped};
