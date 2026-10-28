// THE ONLY FILE YOU WRITE. Everything the video says comes from here (QUESTION, ANSWER, NAME at the top of the prompt).
// Write the texts in the language of QUESTION. logo "marque" = the Aura Luna monogram (public/logo-aura-luna.png); accent = the off-white of the interface.
export type Bloc = { type: "p" | "h" | "li"; texte: string }; // p = paragraph · h = small title · li = bullet. **bold** is allowed.
export type Preset = {
  nom: string; logo: "marque" | string; accent: string;
  question: string; precision: string; outil: string;
  panneau: { titre: string; options: { t: string; d: string }[]; choix: number };
  reponse: Bloc[];
};
export const CONTENT: Preset = {
  nom: "Aura Luna",                                 // NAME → « Salut, Aura Luna »
  logo: "marque", accent: "#F3F2EF",                 // brand monogram · off-white accent
  question: "C'est quoi Aura Luna ?",                 // QUESTION
  precision: "Petite précision avant de répondre :",  // translate if QUESTION is not in French
  outil: "Formulation d'une question en cours",        // translate if QUESTION is not in French
  panneau: { titre: "Tu veux savoir quoi ?", choix: 0, options: [   // t = CHOICES (in order) · d = a short line you write · choix = CLICK − 1 (the one the mouse clicks)
    { t: "Ce qu'on fait", d: "Nos expertises, de l'identité à la 3D" },
    { t: "Notre univers", d: "Élégant, minimaliste, esprit Bauhaus" },
    { t: "Nous écrire", d: "Lancer un projet ensemble" },
  ] },
  reponse: [                                          // ANSWER, cut into blocks
    { type: "p", texte: "**Aura Luna** est un **studio créatif** multidisciplinaire, entre imagination, design et technologie." },
    { type: "h", texte: "Nos expertises" },
    { type: "li", texte: "Branding et identité visuelle" },
    { type: "li", texte: "Photographie et vidéographie" },
    { type: "li", texte: "3D et motion design" },
    { type: "p", texte: "Des visions **créatives**. Des univers **singuliers**." },
  ],
};
