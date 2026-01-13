import { Octokit } from 'octokit';
import type {
  GitHubUser,
  GitHubRepo,
  GitHubData,
  GitHubClientOptions,
} from './types.js';

export class GitHubClient {
  private octokit: Octokit;

  constructor(options: GitHubClientOptions = {}) {
    this.octokit = new Octokit({
      auth: options.token,
    });
  }

  async getUser(username: string): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getByUsername({
      username,
    });

    return data as GitHubUser;
  }

  async getRepos(username: string): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      });

      if (data.length === 0) break;

      repos.push(...(data as GitHubRepo[]));

      if (data.length < perPage) break;
      page++;
    }

    return repos;
  }

  async fetchAll(username: string): Promise<GitHubData> {
    const [user, repos] = await Promise.all([
      this.getUser(username),
      this.getRepos(username),
    ]);

    return { user, repos };
  }
}
