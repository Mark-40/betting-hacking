import type { Category, Team } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "innovative",
    label: "Who will win the Most Innovative",
    tagline: "Boldest idea, freshest tech, biggest 'whoa'.",
    accent: "violet",
  },
  {
    id: "organized",
    label: "Who will win the Most Organized",
    tagline: "Tightest plan, cleanest execution, zero chaos.",
    accent: "cyan",
  },
  {
    id: "pitch",
    label: "Who will win the Best Pitch",
    tagline: "Smoothest delivery, sharpest story, sold us in 60s.",
    accent: "magenta",
  },
];

export const TEAMS: Team[] = [
  {
    id: "team-lonely",
    name: "Lonely Team - Wellevate Central",
    tagline: "A centralized dashboard website of the company which connects to all internal apps, onboarding process, automatic time in, and soon AI assistant. It features company related notifs, announcements, and can even link to wellevate socials",
    emoji: "🌌",
    members: [
      { name: "Bimbi", role: "Product / Frontend" },
      { name: "Tom", role: "ML Engineer" },
      { name: "Pauleen", role: "Designer" },
      { name: "Yuan", role: "Backend" },
    ],
  },
  {
    id: "team-office",
    name: "Team Office - WellPlayed",
    tagline: "A wellness monitoring system designed to assess burnout risk, analyze workplace stress factors, and provide AI-generated interpretations and recommendations.",
    emoji: "⚛️",
    members: [
      { name: "JC", role: "Full Stack" },
      { name: "Danzen", role: "Data Eng" },
      { name: "Lea", role: "PM / UX" },
    ],
  },
  {
    id: "team-conference",
    name: "Team Conference - Wellevate Board",
    tagline: "Wellevate Board is a workforce management system that streamlines daily operations by automating task assignments, managing leave requests, and tracking employee attendance — helping teams stay organized and efficient.",
    emoji: "🛰️",
    members: [
      { name: "JP", role: "Founder / Eng" },
      { name: "Sean", role: "Mobile" },
      { name: "Rogena", role: "AI / Research" },
      { name: "Charles", role: "Growth" },
    ],
  },
];

export const TEAM_IDS = TEAMS.map((t) => t.id);
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}
