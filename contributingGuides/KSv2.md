# KSv2

In Expensify, we use a prioritization system called called "Kernel Scheduler v2" (KSv2) to help us keep aligned on how frequently GitHub issues should be worked on, depending on their time priority:

**Hourly**: If a Github issue has the `Hourly` label, the assignee should update it *at least* once an hour

**Daily**: If a Github issue has the `Daily` label, the assignee should update it *at least* once a day

**Weekly**: If a Github issue has the `Weekly` label, the assignee should update it *at least* once a week

**Monthly**: If a Github issue has the `Monthly` label, the assignee should update it *at least* once a month.

If a GitHub issue has the `Overdue` label, it means that it hasn't been updated in the amount of time allotted for an update (ex - A weekly issue becomes overdue if it hasn't been updated in a week).

You can install the KSv2 extension from [here](https://github.com/Expensify/k2-extension/). As a best practice, before you start working on assigned tasks, go to the [K2 dashboard](https://github.com/Expensify/Expensify#k2). At the top of the page, it lists all your assigned issues organized by priority. Anything with red text is overdue - make sure to address these first. That's it!

