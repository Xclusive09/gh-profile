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

# make it available globally
pnpm setup              # first time only, then restart terminal
pnpm link --global
```

## Usage

```bash
# generate README for a GitHub user
gh-profile generate <username>

# save to a specific file
gh-profile generate <username> --output ./profile-readme.md

# use a GitHub token for better rate limits
gh-profile generate <username> --token <your-token>

# or set it as an env variable
export GITHUB_TOKEN=<your-token>
gh-profile generate <username>

# force overwrite existing file
gh-profile generate <username> --force
```

### Options

| Flag | What it does |
|------|--------------|
| `generate <username>` | Generate README for a user |
| `-t, --template <name>` | Pick a template (default: `default`) |
| `-o, --output <path>` | Where to save it (default: `./README.md`) |
| `--token <token>` | GitHub token for API access |
| `-f, --force` | Overwrite existing file |
| `--help` | Show help |
| `--version` | Show version |

### Example output

Running `gh-profile generate octocat` generates something like:

```markdown
# Hi, I'm The Octocat 👋

## About

- 📍 San Francisco

## Stats

| Metric | Count |
|--------|-------|
| Public Repos | 8 |
| Total Stars | 420 |
| Total Forks | 120 |
| Followers | 9500 |
| Following | 9 |

## Languages

- **Ruby**: 3 repos (38%)
- **JavaScript**: 2 repos (25%)

## Top Repositories

### [hello-world](https://github.com/octocat/hello-world)
My first repository on GitHub!

⭐ 2500 • 🍴 800

---

📫 Find me on [GitHub](https://github.com/octocat)
```

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
