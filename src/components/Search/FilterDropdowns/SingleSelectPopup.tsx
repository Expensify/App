import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {TranslationPaths} from '@src/languages/types';

type SingleSelectItem = {
    translation: TranslationPaths;
    value: string;
};

type SingleSelectPopupProps = {
    items: SingleSelectItem[];
    onChange: (item: SingleSelectItem) => void;
};

function SingleSelectPopup({items, onChange}: SingleSelectPopupProps) {
    const {translate} = useLocalize();

    return (
        <View>
            {items.map((item) => {
                return <Text>{translate(item.translation)}</Text>;
            })}
        </View>
    );
}

SingleSelectPopup.displayName = 'SingleSelectPopup';
export default SingleSelectPopup;
