> [!IMPORTANT]
> As of Lando [v3.23.0](https://github.com/lando/core/releases/tag/v3.23.0) the CLI is now part of [@lando/core](https://github.com/lando/core) and this repo is now archived eg longer actively maintained, used, looked at, etc.
>
> Please visit [@lando/core](https://github.com/lando/core) for anything CLI related.

# Lando CLI

This is the Lando CLI. It implements [`@lando/core`](https://github.com/lando/core) and mixes in a bunch of [plugins](https://github.com/lando/lando/tree/main/plugins). It is a light wrapper around  [`yargs`](https://www.npmjs.com/package/yargs) and [`inquirer`](https://www.npmjs.com/package/inquirer) and mostly allows for:

* Dynamically loading `lando` "tasks" based on `pwd`
* Assembling the `lando` configuration
* Bootstrapping the `lando` and `app` objects
* Abstracting out options, args and interactive questions

## Basic Usage

See a list of commands.

```yaml
lando
```

For more info you should check out the [docs](https://docs.lando.dev/cli):

## Issues, Questions and Support

If you have a question or would like some community support we recommend you [join us on Slack](https://launchpass.com/devwithlando).

If you'd like to report a bug or submit a feature request then please [use the issue queue](https://github.com/lando/cli-legacy/issues/new/choose) in this repo.

## Changelog

We try to log all changes big and small in both [THE CHANGELOG](https://github.com/lando/cli-legacy/blob/main/CHANGELOG.md) and the [release notes](https://github.com/lando/cli-legacy/releases).

## Releasing

[Create a release on GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) with a [semver](https://semver.org)-appropriate tag.

## Contributors

<a href="https://github.com/lando/cli-legacy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=lando/cli-legacy" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Other Selected Resources

* [LICENSE](/LICENSE)
* [TERMS OF USE](https://docs.lando.dev/terms)
* [PRIVACY POLICY](https://docs.lando.dev/privacy)
* [CODE OF CONDUCT](https://docs.lando.dev/coc)

