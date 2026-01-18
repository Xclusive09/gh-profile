# gh-profile

Generate a slick GitHub profile README from your public activity.

[![CI](https://github.com/Xclusive09/gh-profile/actions/workflows/ci.yml/badge.svg)](https://github.com/Xclusive09/gh-profile/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What's this?

I got tired of manually updating my GitHub profile README every time I worked on something new.  
So I built this CLI to do it for me.

It pulls your public GitHub data (repos, languages, stats) and generates a beautiful Markdown file you can drop straight into your profile repository.

## Features

- Fetches your public GitHub data (repos, stars, languages, etc.)
- Supports multiple beautiful templates
- Runs completely locally — no data leaves your machine
- Customizable via config file
- CLI-first experience with great error messages

## What it won't do

- Access private repos (unless you explicitly provide a token)
- Push anything to GitHub for you
- Collect telemetry or send data anywhere

## Privacy

Everything runs **locally** on your machine.  
No tracking, no analytics, no phoning home.

Your GitHub token (if provided) is only used to call GitHub's API — never stored or transmitted.

## Installation

```bash
# Clone the repo
git clone https://github.com/Xclusive09/gh-profile.git
cd gh-profile

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Link globally (run once)
pnpm link --global

# Optional: run setup script (first time only)
pnpm setup
# then restart your terminal          # first time only, then restart terminal
```

## Usage

```bash
# generate README for a GitHub user
gh-profile generate <username>

# Specific template
gh-profile generate <username> --template showcase
gh-profile generate <username> --template stats-heavy

# Force overwrite existing file
gh-profile generate <username> --force

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
