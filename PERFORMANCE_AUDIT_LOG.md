# Improve the peformance of the composer input 

## Problem / Reproduction

- Run the desktop app
- Open the developer tools
- Go to performance, and set CPU throttling to 6x and Hardware Concurrency to 8x or 4x
- Open a chat and type something

You will notice that the input is very badly lacking behind.

## Findings log

We start with working from the branch

- `reapply-onyx-upgrade-use-cache-with-fixes`

as it contains the Onyx cache fixes, which we want to have in place.

One thing is certain is, that the composer will lag badly when we re-render the sidebar or the whole report screen. So we want to bring these down as well.

I was measuring the performance with react devtools, and measured a single key press.
(Note: I put one letter already there, as putting a letter will mark the report as draft, which will cause updates to the SidebarLinks, which i wanted not to shadow the performance investigation for the composer for now).

- ReportActionCompose re-renders: ~10x
- Composer re-renders: ~15x

Those components are still class components. Our team has already rewritten them to function components.
I want to apply the performance optimizations to those FCs, so we don't have dupe work.
So i merged the following PRs in my branch:

- https://github.com/Expensify/App/pull/18648
    - Same amount of re-renders after merging
- https://github.com/Expensify/App/pull/23359
    - Improved performance

After mergint the PRs:

- ReportActionCompose re-renders: ~6x
- Composer re-renders: ~8x

I know want to check if i can even get the component to re-render less, afterwards i want to optimize the children to not re-render if not necessary.

### Moving the suggestions out

I figured that there are a lot of state updates just for the suggestions. 
I am moving that to a new component.

When testing to just remove the suggestion logic I get the following:

- ReportActionCompose re-renders: ~4x
- Composer re-renders: ~6x

### Loading further messages

I just made the observation that when we open a new chat the scroll bar on the right gets smaller and smalle. THat probably means we are loading and rendering more and more messages.
I think we should just reduce the size of initially loaded messages, to improve performance. Because after that the chat input is stable.