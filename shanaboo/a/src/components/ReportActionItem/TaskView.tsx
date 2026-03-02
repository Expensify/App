import React from 'react';
import {View} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {parse} from 'expensify-common';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportUtils from '@libs/ReportUtils';
    const isCanceled = ReportUtils.isCanceledTaskReport(taskReport);
    const isOpen = ReportUtils.isOpenTaskReport(taskReport);
    const isCompleted = ReportUtils.isCompletedTaskReport(taskReport);
    const description = taskReport?.description ?? '';
    const html = description ? parse(description, {textRepresentation: 'html'}) : '';

    const renderAvatar = () => {
        if (!ReportUtils.isTaskReport(taskReport)) {