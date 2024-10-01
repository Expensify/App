# Welcome to New Help!
Here are some instructions on how to get started with New Help...

## How to contribute
Expensify is an open source app, with its public Github repo hosted at https://github.com/Expensify/App.  The newhelp.expensify.com website is a part of that same open source project.  You can contribute to this helpsite in one of two ways:

### The hard way: local dev environment
If you are a developer comfortable working on the command line, you can edit these files as follows:

1. Fork https://github.com/Expensify/App repo
  * `...tbd...`
2. Install Homebrew: https://brew.sh/
3. Install `rbenv` using brew:
  * `brew install rbenv`
4. Install ruby v3.3.4 using
  * `rbenv install 3.3.4`
5. Set the your default ruby version using 
  * `rbenv global 3.3.4`
6. Install Jekyll and bundler gem 
  * `cd help`
  * `gem install jekyll bundler`
7. Create a branch for your changes
8. Make your changes
9. Locally build and test your changes:
  * `bundle exec jekyll build`
10. Push your changes

### The easy way: edit on Github
If you don't want to set up your own local dev environment, feel free to just edit the help materials directly from Github:

1. Open whatever file you want.
2. Replace `github.com` with `github.dev` in the URL
3. Edit away!

## How to add a page
The current design of NewHelp.expensify.com is only to have a very small handful pages (one for each "product"), each of which is a markdown file stored in `/help` using the `product` template (defined in `/help/_layouts/product.html`).  Accordingly, it's very unlikely you'll be adding a new page.

The goal is to use a system named Jekyll to do the heavy lifting of not just converting that Markdown into HTML, but also allowing for deep linking of the headers, auto-linking mentions of those titles elsewhere, and a ton more.  So, just write a basic Markdown file, and it should handle the rest.

## How to preview the site online
Every PR pushed by an authorized Expensify employee or representative will automatically trigger a "build" of the site using a Github Action.  This will [follow these steps](../.github/workflows/deployNewHelp.yml) to:
1. Start a new Ubuntu server
2. Check out the repo
3. Install Ruby and Jekyll
4. Build the entire site using Jekyll
5. Create a "preview" of the newly built site in Cloudflare
6. Record a link to that preview in the PR.

## How to deploy the site for real
Whenever a PR that touches the `/help` directory is merged, it will re-run the build just like before.  However, it will detect that this build is being run from the `main` branch, and thus push the changes to the `production` Cloudflare environment -- meaning, it will replace the contents hosted at https://newhelp.expensify.com
