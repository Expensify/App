import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import type {ListItem} from '@components/SelectionList/types';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOUUtils from '@libs/IOUUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type DebugTagPickerProps = {
    policyID: string;
    tagName?: string;
    onSubmit: (item: ListItem) => void;
};

function DebugTagPicker({policyID, tagName = '', onSubmit}: DebugTagPickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [newTagName, setNewTagName] = useState(tagName);
    const selectedTags = useMemo(() => TransactionUtils.getTagArrayFromName(newTagName), [newTagName]);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    const updateTagName = useCallback(
        (index: number) =>
            ({text}: ListItem) => {
                const newTag = text === selectedTags.at(index) ? undefined : text;
                const updatedTagName = IOUUtils.insertTagIntoTransactionTagsString(newTagName, newTag ?? '', index);
                if (policyTagLists.length === 1) {
                    return onSubmit({text: updatedTagName});
                }
                setNewTagName(updatedTagName);
            },
        [newTagName, onSubmit, policyTagLists.length, selectedTags],
    );

    const submitTag = useCallback(() => {
        onSubmit({text: newTagName});
    }, [newTagName, onSubmit]);

    return (
        <View style={styles.gap5}>
            <View style={styles.gap5}>
                {policyTagLists.map(({name}, index) => (
                    <View>
                        {policyTagLists.length > 1 && <Text style={[styles.textLabelSupportingNormal, styles.ph5, styles.mb3]}>{name}</Text>}
                        <TagPicker
                            policyID={policyID}
                            selectedTag={selectedTags.at(index) ?? ''}
                            tagListName={name}
                            tagListIndex={index}
                            shouldOrderListByTagName
                            onSubmit={updateTagName(index)}
                        />
                    </View>
                ))}
            </View>
            {policyTagLists.length > 1 && (
                <View style={styles.ph5}>
                    <Button
                        success
                        large
                        text={translate('common.save')}
                        onPress={submitTag}
                    />
                </View>
            )}
        </View>
    );
}

export default DebugTagPicker;
