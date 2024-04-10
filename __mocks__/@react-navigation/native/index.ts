import {useIsFocused as realUseIsFocused, useTheme as realUseTheme} from '@react-navigation/native';

// We only want these mocked for storybook, not jest
const useIsFocused: typeof realUseIsFocused = process.env.NODE_ENV === 'test' ? realUseIsFocused : () => true;

// @ts-expect-error as we're mocking this function
const useTheme: typeof realUseTheme = process.env.NODE_ENV === 'test' ? realUseTheme : () => ({});

export * from '@react-navigation/core';
export * from '@react-navigation/native';
export {useIsFocused, useTheme};
