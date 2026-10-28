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
  panneau: { titre: "Tu veux savoir quoi ?", choix: 1, options: [   // t = CHOICES (in order) · d = a short line you write · choix = CLICK − 1 (the one the mouse clicks)
    { t: "Ce qu'on fait", d: "Nos expertises, de l'identité à la 3D" },
    { t: "Notre univers", d: "Élégant, minimaliste, esprit Bauhaus" },
    { t: "Nous écrire", d: "Lancer un projet ensemble" },
  ] },
  reponse: [                                          // ANSWER, cut into blocks
    { type: "p", texte: "**Aura Luna** associe une **esthétique élégante et minimaliste** à une approche contemporaine." },
    { type: "h", texte: "Inspirée du Bauhaus" },
    { type: "li", texte: "Géométrie, lumière et formes" },
    { type: "li", texte: "Contrastes et émotions" },
    { type: "li", texte: "Composition maîtrisée" },
    { type: "p", texte: "Une **idée forte**. Une **identité reconnaissable**." },
  ],
};
