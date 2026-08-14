import type {ListItem} from '@components/SelectionList/types';

import type {ThemeStyles} from '@styles/index';

import {View} from 'react-native';

function sortDefaultToTop<T extends ListItem>(items: T[], isDefault: (item: T) => boolean, styles: ThemeStyles): T[] {
    return items
        .toSorted((a, b) => {
            if (isDefault(a)) {
                return -1;
            }
            if (isDefault(b)) {
                return 1;
            }
            return 0;
        })
        .map((item) => ({
            ...item,
            footerContent: isDefault(item) && items.length > 1 ? <View style={[styles.mh5, styles.mv1, styles.borderBottom]} /> : undefined,
        }));
}

// eslint-disable-next-line import/prefer-default-export
export {sortDefaultToTop};
