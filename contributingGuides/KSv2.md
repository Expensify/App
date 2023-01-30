# KSv2

In Expensify, we use a prioritization system called called "Kernel Scheduler v2" (KSv2) to help us keep aligned on how frequently GitHub issues should be worked on, depending on their time priority:

**Hourly**: If a Github issue has the `Hourly` label, the assignee should update it *at least* once an hour

**Daily**: If a Github issue has the `Daily` label, the assignee should update it *at least* once a day

**Weekly**: If a Github issue has the `Weekly` label, the assignee should update it *at least* once a week

**Monthly**: If a Github issue has the `Monthly` label, the assignee should update it *at least* once a month.

## Dashboard

To help surface the issues and PRs that need the most `#urgency`, we've built a custom extension to use in GitHub. It looks like this:

<img src="https://user-images.githubusercontent.com/6829422/213875977-8ff4cf19-7690-4203-ae13-a8da259be7d0.png" />

Once you have the extension installed, you can access it by going to https://github.com/Expensify/Expensify#k2 or clicking on the K2 tab at the top of a repo (between pull requests and GH actions).

### Pull Requests for review

In the dashboard, you can first see the PRs assigned to you as `Reviewer`. As part of our engineering guidelines, an engineer (internal or external) should review other people's code before working on their own code.

### Issues assigned to you

In the next section you can see all issues assigned to you, prioritized from most urgent (on the left) to least urgent (on the right). Issues will also change color depending on other factors - e.g. if they have "HOLD" in the title or if they have the `Overdue`, `Planning`, or `Waiting for copy` labels applied.

If a GitHub issue has the `Overdue` label, the text will be red. This means that the issue hasn't been updated in the amount of time allotted for an update (ex - A weekly issue becomes overdue if it hasn't been updated in a week).

### Your Pull Requests

After the issues section you will find a section that lists the PRs you've created.

<img src="https://user-images.githubusercontent.com/6829422/213875978-3df6bcd0-ee9a-472a-9a9f-6db70486bcf0.png" />

### WAQ issues

This section displays a list of open issues in the App repo which are not on hold and don't have PRs yet, all ordered by their age (and grouped by how many weeks old they are):

<img src="https://user-images.githubusercontent.com/6829422/213875962-fb1f23d0-59b9-4d05-960e-160e34c83cf0.png" />

## Label buttons

The page for a GitHub issue will have buttons on the right side for the most common labels. Some of these labels are only for internal use, but there are other labels that can be used for public repos:

<img src="https://user-images.githubusercontent.com/6829422/214215474-e7f03411-dea1-44ea-9ca0-3780d7ea2740.png" />

## Reviewer Checklist button

Additionally, the extension provides a button that facilitates the creation of the Reviewer Checklist into a new comment:

<img src="https://user-images.githubusercontent.com/6829422/214215497-ac268e40-0830-43bf-967d-fe667bc2de71.png" />

## Installation

You can install the KSv2 extension from [here](https://github.com/Expensify/k2-extension/).

## Best Practices
- Look at the dashboard every day, before you start any work
- Work your way down from the top to the bottom (look at PRs you need to review first > provide updates for issues assigned to you > check the progress on PRs you've written > find something new to work on)

## Why is it called "Kernel Scheduler v2?"
KSv2 is a shout-out to Windows 95 improving the kernel scheduler used in Windows 3.1. In Windows 3.1, if a program was in the foreground, it was given 100% of the CPU time. This meant that if you watched a background application like the clock, it wouldn't update its time until the foreground application was no longer in the foreground. Then the clock could "catch up" and update to show the current time. Windows 95 made it so that background applications could update by dedicating a small amount of the foreground CPU usage as "spare cycles" for background apps to use. This meant that the clock could now update in real-time, even though it was running in the background.

We brought the same thinking to GitHub priority. A monthly issue is like the "background app". Rather than never getting any work done on it ever, we say that it should have _something_ done on it once a month. It doesn't need to be closed or completed, but it should have something done to it. That way most of a developer's bandwidth can be used on the high-priority items that are hourly and daily, yet still, make some progress on weekly and monthly issues.
