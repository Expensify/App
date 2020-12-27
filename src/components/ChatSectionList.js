import _ from 'underscore';
import React from 'react';
import {View, Text, SectionList} from 'react-native';
import ChatLinkRow from '../pages/home/sidebar/ChatLinkRow';
import SubHeader from './SubHeader';
import KeyboardSpacer from './KeyboardSpacer';
import styles from '../styles/styles';

const ChatSectionList = ({
    sections = [],
    onSelectRow = () => {},
    headerMessage = '',
    focusedIndex = 0,
    selectedOptions = [],
    canSelectMultipleOptions = false,
    hideSectionHeaders = false,
    contentContainerStyles = [],
}) => (
    <View style={[styles.flex1]}>
        {headerMessage ? (
            <View style={[styles.ph2]}>
                <Text style={[styles.textLabel]}>
                    {headerMessage}
                </Text>
            </View>
        ) : null}
        <SectionList
            bounces={false}
            indicatorStyle="white"
            keyboardShouldPersistTaps="always"
            contentContainerStyle={[styles.flex1, ...contentContainerStyles]}
            showsVerticalScrollIndicator={false}
            sections={sections}
            keyExtractor={option => option.keyForList}
            renderItem={({item, index, section}) => (
                <ChatLinkRow
                    option={item}
                    optionIsFocused={focusedIndex === (index + section.indexOffset)}
                    onSelectRow={onSelectRow}
                    isSelected={_.find(selectedOptions, option => option.login === item.login)}
                    showSelectedState={canSelectMultipleOptions}
                />
            )}
            renderSectionHeader={({section: {title, shouldShow}}) => {
                if (title && shouldShow && !hideSectionHeaders) {
                    return <SubHeader text={title} />;
                }

                return <View style={styles.mt1} />;
            }}
            extraData={focusedIndex}
            ListFooterComponent={View}
            ListFooterComponentStyle={[styles.p1]}
        />
        <KeyboardSpacer />
    </View>
);

export default ChatSectionList;
