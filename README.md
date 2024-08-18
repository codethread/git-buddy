# git-buddy

My little helper 🚧

### Development

```sh
bun dev
```

Additionally, with traces can be seen at http://localhost:3000/explore via docker ([taken from the docs](https://effect.website/docs/guides/observability/telemetry/tracing)):

```sh
bun trace:up # start
open localhost:3000/explore # visit to see traces
bun trace:down # stop
```

### Installation

**Requires [`bun`](https://bun.sh/)**

```sh
curl -fsSL https://bun.sh/install | bash`
```

Download the `git-buddy.tar.gz` from the latest release, open it and then copy the git-buddy file somewhere in your `$PATH`; then run:

```sh
git-buddy --help
```
