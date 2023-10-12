type NextStepButton = {
    text: string;
    tooltip: string;
    disabled: boolean;
};

type ReportNextStep = {
    /** Buttons to display as the next step in the report in group policies */
    buttons: {
        approve: NextStepButton;
        reimburse: NextStepButton;
    };
};

export default ReportNextStep;
