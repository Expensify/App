# KSv2

In Expensify, we use a prioritization system called called "Kernel Scheduler v2" (KSv2) to help us keep aligned on how frequently GitHub issues should be worked on, depending on their time priority:

**Hourly**: If a Github issue has the `Hourly` label, the assignee should update it *at least* once an hour

**Daily**: If a Github issue has the `Daily` label, the assignee should update it *at least* once a day

**Weekly**: If a Github issue has the `Weekly` label, the assignee should update it *at least* once a week

**Monthly**: If a Github issue has the `Monthly` label, the assignee should update it *at least* once a month.

## Dashboard

To help surface the issues and PRs that need the most #urgency, we've built a custom extension to use in GitHub. It looks like this:

<img src="https://user-images.githubusercontent.com/6829422/213875977-8ff4cf19-7690-4203-ae13-a8da259be7d0.png" />

In the dashboard, you can first see the PRs assigned to you as Reviewer. An engineer should review other people's code before working on their own code.

Then you can see all issues assigned to you, prioritized from most urgent to least urgent. Issues will also change color depending on other factors - e.g. if they have "HOLD" in the title or if they have the `Overdue`, `Planning`, or `Waiting for copy` labels applied.

If a GitHub issue has the `Overdue` label, it means that it hasn't been updated in the amount of time allotted for an update (ex - A weekly issue becomes overdue if it hasn't been updated in a week).

## Installation

You can install the KSv2 extension from [here](https://github.com/Expensify/k2-extension/). As a best practice, before you start working on assigned tasks, go to the [K2 dashboard](https://github.com/Expensify/Expensify#k2). At the top of the page, it lists all your assigned issues organized by priority. Anything with red text is overdue - make sure to address these first. That's it!

## Why is it called "Kernel Scheduler v2?"
KSv2 is a shout-out to Windows 95 improving the kernel scheduler used in Windows 3.1. In Windows 3.1, if a program was in the foreground, it was given 100% of the CPU time. This meant that if you watched a background application like the clock, it wouldn't update its time until the foreground application was no longer in the foreground. Then the clock could "catch up" and update to show the current time. Windows 95 made it so that background applications could update by dedicating a small amount of the foreground CPU usage as "spare cycles" for background apps to use. This meant that the clock could now update in real-time, even though it was running in the background.

We brought the same thinking to GitHub priority. A monthly issue is like the "background app". Rather than never getting any work done on it ever, we say that it should have _something_ done on it once a month. It doesn't need to be closed or completed, but it should have something done to it. That way most of a developer's bandwidth can be used on the high-priority items that are hourly and daily, yet still, make some progress on weekly and monthly issues.
