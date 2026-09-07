export type DepartmentId = "Graphics" | "Marketing" | "Tech" | "Operations" | "Secretariat"

export type Department = {
  id: DepartmentId
  tagline: string
  description: string
  focus: string[]
}

export const DEPARTMENTS: Department[] = [
  {
    id: "Graphics",
    tagline: "Design the visual identity of ICPEP.",
    description:
      "Craft posters, motion graphics, and branding that make our events unforgettable.",
    focus: ["Poster & layout design", "Motion / video editing", "Brand & visual identity"],
  },
  {
    id: "Marketing",
    tagline: "Tell our story and grow the community.",
    description:
      "Run campaigns, manage socials, and connect with partners and sponsors.",
    focus: ["Social media & content", "Campaigns & copywriting", "Partnerships & sponsorship"],
  },
  {
    id: "Tech",
    tagline: "Build the systems that power the org.",
    description:
      "Develop web apps, maintain tooling, and lead technical workshops.",
    focus: ["Web / app development", "Systems & automation", "Workshops & dev support"],
  },
  {
    id: "Operations",
    tagline: "Keep everything running on the ground.",
    description:
      "Coordinate logistics, events, and internal processes end to end.",
    focus: ["Event logistics", "Documentation & finance", "Member coordination"],
  },
  {
    id: "Secretariat",
    tagline: "Keep the org organized and on record.",
    description:
      "Manage records, minutes, and communications that keep the team aligned.",
    focus: ["Minutes & documentation", "Records & correspondence", "Membership database"],
  },
]

export const DEPARTMENT_IDS = DEPARTMENTS.map((d) => d.id) as DepartmentId[]

export const DEPARTMENT_POSITIONS: Record<DepartmentId, readonly string[]> = {
  Graphics: ["Graphic Designer", "Video Editor", "Photographer", "Videographer"],
  Marketing: ["Prod Committee", "Social Media Manager"],
  Tech: ["Software Engineering Head", "Cybersecurity Head", "Networking Head", "Software Engineer Apprentice", "Cybersecurity Apprentice", "Networking Apprentice"],
  Operations: ["Floor Director", "Registration/Usher", "Hosts", "Technical Committee", "Program Coordinator", "Speaker Coordinator"],
  Secretariat: ["Meeting and Documentation Officer", "Liason Officer"],
} as const

export const STATUS_OPTIONS = ["pending", "reviewed", "accepted", "rejected"] as const
export type ApplicationStatus = (typeof STATUS_OPTIONS)[number]

export function isTechHeadPosition(department: DepartmentId | null, position: string) {
  return department === "Tech" && position.includes("Head")
}
