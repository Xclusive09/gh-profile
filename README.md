# gh-profile

Generate a slick GitHub profile README from your public activity.

[![CI](https://github.com/Xclusive09/gh-profile/actions/workflows/ci.yml/badge.svg)](https://github.com/Xclusive09/gh-profile/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What's this?

I got tired of manually updating my GitHub profile README every time I worked on something new. So I built this CLI to do it for me.

It pulls your public GitHub data—repos, languages, contribution stats—and spits out a nice Markdown file you can drop into your profile repo.

## What it does

- Grabs your public repos and stats from GitHub
- Figures out what languages you use most
- Generates a README from templates you can customize
- Writes it to a file, done

## What it won't do

- Touch your private repos (unless you auth and explicitly want that)
- Push anything to GitHub for you
- Send your data anywhere—everything runs locally

## Privacy

Everything runs on your machine. No telemetry, no analytics, nothing phoning home.

If you use a GitHub token, it's only used to hit GitHub's API and nothing else. It's never saved or sent anywhere.

## Install

```bash
git clone https://github.com/Xclusive09/gh-profile.git
cd gh-profile
pnpm install
pnpm build

# optional: make it available globally
pnpm link --global
```

## Usage

> **Heads up:** Still building this out. Here's what's planned:

```bash
# basic
gh-profile generate <username>

# pick a template
gh-profile generate <username> --template minimal

# save somewhere specific
gh-profile generate <username> --output ./my-readme.md

# use a token for better rate limits
gh-profile generate <username> --token <your-token>

# or just export it
export GITHUB_TOKEN=<your-token>
gh-profile generate <username>
```

### Options

| Flag | What it does |
|------|--------------|
| `generate <username>` | Generate README for a user |
| `--template <name>` | Pick a template (default: `default`) |
| `--output <path>` | Where to save it (default: `./README.md`) |
| `--token <token>` | GitHub token for API access |
| `--help` | Show help |
| `--version` | Show version |

## Dev setup

```bash
pnpm install
pnpm dev        # watch mode
pnpm build      # compile
pnpm test       # run tests
pnpm lint       # check code
pnpm format     # format code
```

## Project layout

```
gh-profile/
├── src/
│   ├── cli/           # command handling
│   ├── github/        # API stuff
│   ├── core/          # data processing
│   ├── templates/     # README templates
│   └── output/        # file writing
├── tests/
└── dist/
```

## Contributing

PRs welcome. Check out [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT — do whatever you want with it. See [LICENSE](LICENSE).
