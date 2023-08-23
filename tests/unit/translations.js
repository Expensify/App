const translations = require('../../src/languages/translations');

describe('Translations', () => {
    describe('flattenObject()', () => {
        it('It should work correctly', () => {
            const func = ({content}) => `This is the content: ${content}`;
            const simpleObject = {
                common: {
                    yes: 'Yes',
                    no: 'No',
                },
                complex: {
                    activity: {
                        none: 'No Activity',
                        some: 'Some Activity',
                    },
                    report: {
                        title: {
                            expense: 'Expense',
                            task: 'Task',
                        },
                        description: {
                            none: 'No description',
                        },
                        content: func,
                        messages: ["Hello", "Hi", "Sup!"]
                    },
                },
            };

            const result = translations.flattenObject(simpleObject);
            expect(result).toStrictEqual({
                'common.yes': 'Yes',
                'common.no': 'No',
                'complex.activity.none': 'No Activity',
                'complex.activity.some': 'Some Activity',
                'complex.report.title.expense': 'Expense',
                'complex.report.title.task': 'Task',
                'complex.report.description.none': 'No description',
                'complex.report.content': func,
                'complex.report.messages': ["Hello", "Hi", "Sup!"],
            });
        });
    });
});
