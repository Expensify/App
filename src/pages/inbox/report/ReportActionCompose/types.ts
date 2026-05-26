import type React from 'react';

type ReportActionComposeProps = {
    /** Report ID */
    reportID: string;
};

type ReportActionComposeWithChildrenProps = ReportActionComposeProps & {
    children: React.ReactNode;
};

export type {ReportActionComposeProps, ReportActionComposeWithChildrenProps};
