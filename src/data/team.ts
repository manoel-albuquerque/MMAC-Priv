export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string; // fallback when photo fails to load
  photoUrl: string; // path relative to /public
};

// Fictional finance team — five delegate targets matched to the prototype's
// photo roster at /public/avatars/. Names are chosen to reflect the cropped
// headshots; roles cover the major workflow owners so any delegation surface
// has a credible destination. The controller is the current user, so no
// controller role appears here.
export const teamRoster: TeamMember[] = [
  {
    id: "tm-okonkwo",
    name: "Naomi Okonkwo",
    role: "Assistant Controller",
    initials: "NO",
    photoUrl: "/avatars/okonkwo.png",
  },
  {
    id: "tm-park",
    name: "Kenji Park",
    role: "AR Clerk",
    initials: "KP",
    photoUrl: "/avatars/park.png",
  },
  {
    id: "tm-delgado",
    name: "Marco Delgado",
    role: "Senior Accountant",
    initials: "MD",
    photoUrl: "/avatars/delgado.png",
  },
  {
    id: "tm-natarajan",
    name: "Priya Natarajan",
    role: "FP&A Analyst",
    initials: "PN",
    photoUrl: "/avatars/natarajan.png",
  },
  {
    id: "tm-whitaker",
    name: "Helen Whitaker",
    role: "AP Manager",
    initials: "HW",
    photoUrl: "/avatars/whitaker.png",
  },
];
