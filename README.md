# wordpress-warp

A tool to download and upload WordPress content and settings to a local directory.

# Requirements

Works only with a site hosted at [WordPress.com](https://wordpress.com/) or a WordPress site with the [Jetpack](http://jetpack.me/) plugin installed.

Requires [node](https://nodejs.org/) to be installed.

# Installation

In a terminal shell run the following command:

```
npm install -g wordpress-warp
```

## Authentication Setup

Because warp will use the WordPress.com REST API and application client secrets
cannot be kept secret in a json file, you must create a new
Application to identify the app. Hopefully future versions of wordpress-warp
will not have this requirement if I can figure out a way around it.

First visit [the developer site](https://developer.wordpress.com/apps/new/) to
create a new app (you must be logged-in to WordPress.com). For `Name` and
`Description` you can put whatever you like, but `Redirect URL` must be
`http://localhost:3001/connect/res` and `Type` must be `Web`.

After you click "Create", you'll be able to see your app in the [Application
List](https://developer.wordpress.com/apps/). Click on its title and you'll see
a table entitled **OAuth Information**. You'll need the `Client ID` and the `Client
Secret` for the first time you run `warp`.

# Usage

In a terminal shell, typing the following command will download a copy of your
WordPress site's data to a new directory (except replace `mysite.wordpress.com`
with your site's URL):

```
warp --site=mysite.wordpress.com --download
```

Then you can edit the files in that directory to modify the posts and settings
of the site (currently only pages and custom-css). In the example above, there
will be a new directory called `mysite.wordpress.com` containing files for my site.

To upload your changes back to the site, run the following command (**beware
that this will overwrite any changes you or others have made to the site since
the last download**):

```
warp --site=mysite.wordpress.com --upload
```

The first time you run this for a site you will be required to authorize your
upload with WordPress.com, but `warp` will save the token locally so that you
will not need to authenticate for future uploads.

## File watching

If you want to leave warp running while you make edits to your site, you can run
the following command:

```
warp --site=mysite.wordpress.com --upload --watch
```

This will watch your site's files for any changes and upload them as they are
saved.
