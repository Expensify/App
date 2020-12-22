# Contributing to Expensify.cash
Welcome! Thanks for checking out Expensify.cash and for taking the time to contribute!

## Getting Started
This guide is specifically for external contributors. For a general overview of the repo, check out our README located [here](https://github.com/Expensify/Expensify.cash/blob/master/README.md). The parts of the README to pay particular attention to are how to [run the web app](https://github.com/Expensify/Expensify.cash#running-the-web-app-via-production-api-proxy-contributors-) and how to [run the desktop/mobile apps](https://github.com/Expensify/Expensify.cash#running-the-desktop-and-mobile-apps-via-production-api-contributors-) locally using our production API.

#### Test Accounts
You can create as many accounts as needed in order to test your changes. You can create your test accounts directly from [expensify.cash](https://expensify.cash/). Right now, accounts can't chat with each other by default. If you want your test accounts to be able to chat with each other, post in the #expensify-contributors [Slack channel](https://github.com/Expensify/Expensify.cash/blob/master/CONTRIBUTING.md#asking-questions) to ask someone to add your test accounts to a policy that allows chatting.

## Code of Conduct
This project and everyone participating in it is governed by the Expensify [Code of Conduct](https://github.com/Expensify/Expensify.cash/blob/master/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contributors@expensify.com](mailto:contributors@expensify.com).

## Asking Questions
The best way to ask questions is to join our #expensify-contributors Slack channel. To request an invite to the channel, just email contributors@expensify.com with the subject "Slack Channel Invite" and we'll send you an invite! Please do not create issues to ask questions.

## Reporting Vulnerabilities
If you've found a vulnerability, please email security@expensify.com with the subject `Vulnerability Report` instead of creating an issue.

## Filing Issues
If you'd like to create a new issue, please first make sure the issue does not exist in the [issue list](https://github.com/Expensify/Expensify.cash/issues). When creating a new issue, please include all the required information on the issue template.

## Payment for Contributions
We are currently managing payment via Upwork. If you'd like to be paid for your contributions, please apply to fix the issue from our [Upwork issue list](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2). Each issue in this repo will also link out to the associated Upwork job.

## Submitting a Pull Request
#### Proposing a Change
1. Fork this repository and create a new branch
1. [Open a PR](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork). Be sure to fill in all the required information on the PR template, and be sure all of your commits are signed.
1. An Expensify engineer will be automatically assigned to review your PR
1. You will need all checks to pass:
	1. CLA - You must sign our [Contributor License Agreement](https://github.com/Expensify/Expensify.cash/blob/master/CLA.md) by following the CLA bot instructions that will be posted on your PR
	1. Tests - All tests must pass before a merge of a pull request
	1. Lint - All code must pass lint checks before a merge of a pull request

#### Testing
Upon submission of a PR, please include a numbered list of explicit testing steps for each platform (Web, Desktop, iOS, and Android) to confirm the fix works as expected and there are no regressions.
