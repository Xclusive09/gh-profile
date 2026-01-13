export interface Profile {
  username: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter: string | null;
  email: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: Date;
}

export interface Repository {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  topics: string[];
  homepage: string | null;
  isFork: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date;
}

export interface LanguageStats {
  name: string;
  count: number;
  percentage: number;
}

export interface ProfileStats {
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  languages: LanguageStats[];
  topRepos: Repository[];
  recentRepos: Repository[];
}

export interface NormalizedData {
  profile: Profile;
  repos: Repository[];
  stats: ProfileStats;
}
