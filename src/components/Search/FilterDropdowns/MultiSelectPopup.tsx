import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {TranslationPaths} from '@src/languages/types';

type MultiSelectItem = {
    translation: TranslationPaths;
    value: string;
};

type MultiSelectPopupProps = {
    items: MultiSelectItem[];
    onChange: (item: MultiSelectItem[]) => void;
};

function MultiSelectPopup({items, onChange}: MultiSelectPopupProps) {
    const {translate} = useLocalize();

    return (
        <View>
            {items.map((item) => {
                return <Text>{translate(item.translation)}</Text>;
            })}
        </View>
    );
}

MultiSelectPopup.displayName = 'MultiSelectPopup';
export default MultiSelectPopup;
