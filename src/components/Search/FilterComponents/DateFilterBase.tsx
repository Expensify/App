import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import type {SearchDatePreset} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseProps = {
    title: string;
    defaultDateValues: SearchDateValues;
    presets: SearchDatePreset[];
    isSearchAdvancedFiltersFormLoading?: boolean;
    onBackButtonPress: () => void;
    onSubmit: (values: SearchDateValues) => void;
    customFooter?: React.ReactNode;
    Wrapper?: React.ComponentType<{children: React.ReactNode}>;
};

// Use forwardRef so parent can get the selected date values via the exposed method
const DateFilterBase = forwardRef<SearchDatePresetFilterBaseHandle, DateFilterBaseProps>(
    ({title, defaultDateValues, presets, isSearchAdvancedFiltersFormLoading, onBackButtonPress, onSubmit, customFooter, Wrapper}, ref) => {
        const styles = useThemeStyles();
        const {translate} = useLocalize();

        const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
        const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

        useImperativeHandle(ref, () => ({
            getDateValues: () =>
                searchDatePresetFilterBaseRef.current?.getDateValues() ?? {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                },
            clearDateValues: () => searchDatePresetFilterBaseRef.current?.clearDateValues(),
            clearDateValueOfSelectedDateModifier: () => searchDatePresetFilterBaseRef.current?.clearDateValueOfSelectedDateModifier(),
            setDateValueOfSelectedDateModifier: () => searchDatePresetFilterBaseRef.current?.setDateValueOfSelectedDateModifier(),
        }));

        function getComputedTitle() {
            if (selectedDateModifier) {
                return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
            }

            return title;
        }

        const reset = () => {
            if (!searchDatePresetFilterBaseRef.current) {
                return;
            }

            if (selectedDateModifier) {
                searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
                setSelectedDateModifier(null);
                return;
            }

            searchDatePresetFilterBaseRef.current.clearDateValues();
        };

        const save = () => {
            if (!searchDatePresetFilterBaseRef.current) {
                return;
            }

            if (selectedDateModifier) {
                searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
                setSelectedDateModifier(null);
                return;
            }

            const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            onSubmit(dateValues);
        };

        const goBack = () => {
            if (selectedDateModifier) {
                setSelectedDateModifier(null);
                return;
            }

            onBackButtonPress();
        };

        const computedTitle = getComputedTitle();

        const content = (
            <>
                <HeaderWithBackButton
                    title={computedTitle}
                    onBackButtonPress={goBack}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={defaultDateValues}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                        isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
                    />
                </ScrollView>
                {!selectedDateModifier && customFooter ? (
                    customFooter
                ) : (
                    <>
                        <Button
                            text={translate('common.reset')}
                            onPress={reset}
                            style={[styles.mh4, styles.mt4]}
                            large
                        />
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.save')}
                            containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                            onSubmit={save}
                            enabledWhenOffline
                        />
                    </>
                )}
            </>
        );

        if (Wrapper) {
            return <Wrapper>{content}</Wrapper>;
        }

        return content;
    },
);

export default DateFilterBase;
