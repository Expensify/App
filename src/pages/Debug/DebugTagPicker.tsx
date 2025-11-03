import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import type {ListItem} from '@components/SelectionListWithSections/types';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {insertTagIntoTransactionTagsString} from '@libs/IOUUtils';
import {getTagLists} from '@libs/PolicyUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

type DebugTagPickerProps = {
    /** The policyID we are getting tags for */
    policyID: string;

    /** Current tag name */
    tagName?: string;

    /** Callback to submit the selected tag */
    onSubmit: (item: ListItem) => void;
};

const policyHasMultipleTagListsSelector = (policy: OnyxEntry<Policy>) => policy?.hasMultipleTagLists;

function DebugTagPicker({policyID, tagName = '', onSubmit}: DebugTagPickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [newTagName, setNewTagName] = useState(tagName);
    const selectedTags = useMemo(() => getTagArrayFromName(newTagName), [newTagName]);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const [hasMultipleTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true, selector: policyHasMultipleTagListsSelector});
    const updateTagName = useCallback(
        (index: number) =>
            ({text}: ListItem) => {
                const newTag = text === selectedTags.at(index) ? undefined : text;
                const updatedTagName = insertTagIntoTransactionTagsString(newTagName, newTag ?? '', index, hasMultipleTagLists ?? false);
                if (policyTagLists.length === 1) {
                    return onSubmit({text: updatedTagName});
                }
                setNewTagName(updatedTagName);
            },
        [newTagName, onSubmit, policyTagLists.length, selectedTags, hasMultipleTagLists],
    );

    const submitTag = useCallback(() => {
        onSubmit({text: newTagName});
    }, [newTagName, onSubmit]);

    return (
        <View style={styles.gap5}>
            <View style={styles.gap5}>
                {policyTagLists.map(({name}, index) => (
                    <View key={name}>
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
