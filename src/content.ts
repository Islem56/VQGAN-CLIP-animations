// THE ONLY FILE YOU WRITE. Everything the video says comes from here (QUESTION, ANSWER, NAME at the top of the prompt).
// Write the texts in the language of QUESTION. logo "marque" = the Aura Luna monogram (public/logo-aura-luna.png); accent = the off-white of the interface.
export type Bloc = { type: "p" | "h" | "li"; texte: string }; // p = paragraph · h = small title · li = bullet. **bold** is allowed.
export type Preset = {
  nom: string; logo: "marque" | string; accent: string;
  question: string; precision: string; outil: string;
  panneau: { titre: string; options: { t: string; d: string }[]; choix: number };
  reponse: Bloc[];
  effet: "impact" | "cine"; // word animation + sound design: "impact" (blur pop, punchy) or "cine" (mask reveal, cinematic)
};
export const CONTENT: Preset = {
  nom: "Aura Luna",                                 // NAME → « Salut, Aura Luna »
  logo: "marque", accent: "#F3F2EF",                 // brand monogram · off-white accent
  question: "C'est quoi Aura Luna ?",                 // QUESTION
  precision: "Petite précision avant de répondre :",  // translate if QUESTION is not in French
  outil: "Formulation d'une question en cours",        // translate if QUESTION is not in French
  panneau: { titre: "Tu veux savoir quoi ?", choix: 2, options: [   // t = CHOICES (in order) · d = a short line you write · choix = CLICK − 1 (the one the mouse clicks)
    { t: "Ce qu'on fait", d: "Nos expertises, de l'identité à la 3D" },
    { t: "Notre univers", d: "Élégant, minimaliste, esprit Bauhaus" },
    { t: "Nous écrire", d: "Lancer un projet ensemble" },
  ] },
  effet: "cine",                                       // look and sound of the answer
  reponse: [                                          // ANSWER, cut into blocks
    { type: "p", texte: "Un **projet en tête** ? Racontez-nous votre **idée**." },
    { type: "h", texte: "Écrivez-nous pour" },
    { type: "li", texte: "Une identité de marque" },
    { type: "li", texte: "Une campagne ou des visuels" },
    { type: "li", texte: "Une vidéo ou une animation 3D" },
    { type: "p", texte: "Donnons une **présence forte** à votre marque." },
  ],
};
