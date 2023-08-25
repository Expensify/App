import {useIsFocused as realUseIsFocused} from '@react-navigation/native';

// We only want this mocked for storybook, not jest
const useIsFocused = process.env.NODE_ENV === 'test' ? realUseIsFocused : () => true;

export * from '@react-navigation/core';
export * from '@react-navigation/native';
export {useIsFocused};
