import {beforeAll, describe, expect, it} from 'bun:test';

import {ESLint, Linter} from 'eslint';

let listRules: Linter.Config;

beforeAll(async () => {
    // ESLint exposes the resolved configuration without a concrete return type.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const config = (await new ESLint().calculateConfigForFile('src/components/SelectionList/BaseSelectionList.tsx')) as Linter.Config;
    if (!config.rules || !config.languageOptions?.parser) {
        throw new Error('Expected the application ESLint configuration');
    }

    // Exercise the effective rules after all flat-config overrides, without unrelated type-aware rules.
    listRules = {
        files: ['**/*.tsx'],
        languageOptions: {
            parser: config.languageOptions.parser,
            parserOptions: {ecmaFeatures: {jsx: true}, sourceType: 'module'},
        },
        // ESLint rule identifiers use kebab-case.
        /* eslint-disable @typescript-eslint/naming-convention */
        rules: {
            'no-restricted-imports': config.rules['no-restricted-imports'],
            'no-restricted-properties': config.rules['no-restricted-properties'],
            'no-restricted-syntax': config.rules['no-restricted-syntax'],
        },
        /* eslint-enable @typescript-eslint/naming-convention */
    };
});

describe('LegendList import restrictions', () => {
    it.each([
        "import {FlatList} from 'react-native';",
        "import {FlatList as NativeList} from 'react-native';",
        "import type {FlatListProps} from 'react-native';",
        "import {FlatList} from 'react-native-gesture-handler';",
        "import {FlashList} from '@shopify/flash-list';",
        "import List from '@shopify/flash-list/dist/FlashList';",
        "import List from 'react-native/Libraries/Lists/FlatList';",
        "import DraggableFlatList from 'react-native-draggable-flatlist';",
        "import List from '@components/FlatList/FlatList';",
        "import List from '@components/FlashList';",
        "import List from '@components/KeyboardDismissibleFlatList';",
    ])('rejects %s', (source) => {
        expect(lint(source).some(({ruleId}) => ruleId === 'no-restricted-imports')).toBe(true);
    });

    it.each(['const list = <Animated.FlatList />;', 'const List = Animated.FlatList;', 'const List = Native.FlatList;'])('rejects member access: %s', (source) => {
        expect(lint(source).some(({ruleId}) => ruleId === 'no-restricted-properties' || ruleId === 'no-restricted-syntax')).toBe(true);
    });

    it.each([
        "import {LegendList} from '@legendapp/list/react-native';",
        "import {AnimatedLegendList} from '@legendapp/list/reanimated';",
        "import type {LegendListProps, LegendListRef} from '@legendapp/list/react-native';",
        "import DraggableList from '@components/DraggableList';",
        "import RenderTaskQueue from '@components/FlatList/RenderTaskQueue';",
        "import {KeyboardDismissibleFlatListContextProvider} from '@components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';",
    ])('allows %s', (source) => {
        expect(lint(source)).toEqual([]);
    });
});

function lint(source: string): Linter.LintMessage[] {
    return new Linter().verify(source, [listRules], {filename: 'list.tsx'});
}
