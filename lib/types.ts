export type CategoryId = "innovative" | "organized" | "pitch";

export interface Category {
  id: CategoryId;
  label: string;
  tagline: string;
  accent: "violet" | "cyan" | "magenta";
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  members: TeamMember[];
}

export type VoteCounts = Record<CategoryId, Record<string, number>>;

export interface VotesData {
  isOpen: boolean;
  votes: VoteCounts;
  totalVotes: number;
  updatedAt: string;
}

export interface VoteSubmission {
  categoryId: CategoryId;
  teamId: string;
}

export interface RankedTeam {
  team: Team;
  count: number;
  rank: number;
}
