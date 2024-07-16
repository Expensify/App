import React, {useState} from 'react';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues, OnyxKey as OnyxValuesKey} from '@src/ONYXKEYS';

type DebugDetailsProps<Okey extends OnyxValuesKey> = {
    data: OnyxEntry<OnyxValues[Okey]>;
    onyxKey: OnyxKey;
    isCollection?: boolean;
    idSelector?: (data: OnyxEntry<Record<string, unknown>>) => string;
};

function DebugDetails<Okey extends OnyxValuesKey>({data, onyxKey, isCollection = false, idSelector = () => ''}: DebugDetailsProps<Okey>) {
    const styles = useThemeStyles();
    const [draftData, setDraftData] = useState<OnyxEntry<OnyxValues[Okey]>>(data);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5, styles.pb5]}
        >
            {Object.entries(data ?? {}).map(([key, value]) => (
                <TextInput
                    errorText={errors[key]}
                    accessibilityLabel="Text input field"
                    key={key}
                    forceActiveLabel
                    label={key}
                    numberOfLines={4}
                    multiline={typeof value === 'object'}
                    defaultValue={typeof value === 'object' ? JSON.stringify(value, null, 6) : (value as string)}
                    onChangeText={(updatedValue) => {
                        setDraftData((currentDraftData) => {
                            if (typeof currentDraftData === 'object') {
                                return {...currentDraftData, [key]: updatedValue};
                            }
                            return updatedValue;
                        });
                        setHasChanges(true);
                    }}
                />
            ))}
            <Button
                success
                text="Save"
                isDisabled={!hasChanges}
                onPress={() => {
                    let updatedData = draftData;
                    let hasErrors = false;
                    setErrors({});
                    if (typeof draftData === 'object') {
                        const results = Object.entries(draftData).map(([key, value]) => {
                            try {
                                if (data && typeof data[key] === 'object') {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
                                    return [key, typeof value === 'string' ? JSON.parse(value.replaceAll('\n', '')) : value];
                                }
                            } catch (error) {
                                setErrors((currentErrors) => ({...currentErrors, [key]: error.message as string}));
                                hasErrors = true;
                            }
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                            return [key, value];
                        });
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        updatedData = Object.fromEntries(results);
                    }
                    if (hasErrors) {
                        return;
                    }
                    setHasChanges(false);
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    Onyx.merge(onyxKey, updatedData);
                }}
            />
            <Button
                danger
                text="Delete"
                onPress={() => {
                    if (isCollection) {
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.merge(onyxKey, {[idSelector(data as OnyxEntry<Record<string, unknown>>)]: null});
                    } else {
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.set(onyxKey, null);
                    }
                    Navigation.goBack();
                }}
            />
        </ScrollView>
    );
}

DebugDetails.displayName = 'DebugDetails';

export default DebugDetails;
