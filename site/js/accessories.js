/* Mon-Tech Racing — BlacKollection e Option Parts
   Testi e dati dalle pagine prodotto di mon-techracing.net (dove esistono).
   cut: immagine scontornata (solo BlacKollection) · photo: foto della card
   photos: quante foto in assets/acc/<id>_N.webp                              */
(() => {
  const P = (id, n) => Array.from({ length: n }, (_, i) => `assets/acc/${id}_${i + 1}.webp`);

  const BLACK = [
    {
      id: "bag-trolley", name: "Bag Trolley", cat: "Borse", photos: P("bag-trolley", 3),
      href: "https://mon-techracing.net/bag-trolley",
      text: [
        "Una borsa con tre cassetti in plastica rigida, dove trovano posto il tuo modello e tutti gli accessori che servono.",
        "Il carrello con 4 robuste ruote è posizionato nella parte larga della borsa, per una maggiore stabilità durante il trasporto.",
      ],
      features: ["Tre cassetti in plastica rigida", "Due tasche laterali per il piano di riscontro", "Carrello con 4 ruote", "Si sovrappone alla Bag 3 Boxes"],
    },
    {
      id: "bag-3-boxes", name: "Bag 3 Boxes", cat: "Borse", photos: P("bag-3-boxes", 4),
      href: "https://mon-techracing.net/bag-3-boxes",
      text: ["La borsa a cassetti della linea BlacKollection: si sovrappone al Bag Trolley per il trasporto."],
      features: [],
    },
    {
      id: "bag-car", name: "Bag Car", cat: "Borse", photos: P("bag-car", 3),
      href: "https://mon-techracing.net/bag-car",
      text: ["Pensata per contenere la macchina con la scocca. Come le altre della linea è testata e prodotta tutta in Italia, per mantenere la qualità al 100%."],
      specs: [["Misure", "44 × 13 × 25 cm"]],
      features: [],
    },
    {
      id: "bag-car-1_12", name: "Bag Car 1/12", cat: "Borse", photos: P("bag-car-1_12", 5),
      href: "https://mon-techracing.net/bag-car-1_12",
      text: ["La Bag Car per le auto in scala 1/12: contiene 1-2 modelli senza carrozzeria oppure 1 modello con carrozzeria."],
      specs: [["Misure", "38 × 21 × 10 cm"]],
      features: [],
    },
    {
      id: "bag-bodies", name: "Bag Bodies", cat: "Borse", photos: P("bag-bodies", 5),
      href: "https://mon-techracing.net/bag-bodies",
      text: [], features: [],
    },
    {
      id: "body-checker", name: "Body Checker", cat: "Attrezzatura", photos: P("body-checker", 2),
      href: "https://mon-techracing.net/body-checker",
      text: [
        "Indispensabile, da aggiungere alla tua attrezzatura: ti permette di controllare la carrozzeria prima di andare in gara.",
        "Realizzato in alluminio, con tutte le misure marcate al laser.",
      ],
      features: [
        "Altezza massima della carrozzeria · Touring 1/10",
        "Larghezza massima · Touring 1/10",
        "Dimensione e posizione dell'ala posteriore · Touring 1/10",
        "Taglio posteriore della carrozzeria · Touring 1/10",
        "Altezza massima della carrozzeria · Pan car 1/12",
      ],
      featuresTitle: "Cosa puoi verificare",
    },
    {
      id: "top", name: "Top", cat: "Attrezzatura", photos: P("top", 4),
      href: "https://mon-techracing.net/top",
      text: ["Il piano di riscontro della linea BlacKollection, con la sua borsa dedicata."],
      features: [],
    },
    {
      id: "piano-1-8-on-road", name: "Piano 1/8 On Road", cat: "Attrezzatura", photos: P("piano-1-8-on-road", 3),
      href: "https://mon-techracing.net/piano-1-8-on-road",
      text: [], features: [],
    },
    {
      id: "lipo-bag", name: "Lipo Bag", cat: "Borse", photos: P("lipo-bag", 1),
      href: "https://mon-techracing.net/lipo-bag",
      text: [], features: [],
    },
    {
      id: "blackmat", name: "Black Mat", cat: "Attrezzatura", photos: P("blackmat", 2),
      href: "https://mon-techracing.net/blackmat",
      text: [], features: [],
    },
  ];
  BLACK.forEach((p) => (p.cut = `assets/acc/${p.id}.webp`));

  const OPTION = [
    {
      id: "combo-wing-tc", name: "Combo Wing TC", cat: "Ali", photos: P("combo-wing-tc", 3), photo: 2,
      href: "https://mon-techracing.net/combo-wing-tc",
      text: [
        "Due ali nuove per Touring, una ad alto carico e una a medio carico.",
        "Leggere ma allo stesso tempo rigide, per essere il più efficienti possibile e dare al tuo modello scorrevolezza e stabilità.",
      ],
      specs: [["Spessore", "0,75 mm"], ["Categoria", "Touring"]],
      features: ["Ala ad alto carico", "Ala a medio carico", "Viti di fissaggio e rondelle in plastica nera"], featuresTitle: "Nel kit",
    },
    {
      id: "formula-wings-2022", name: "Formula Wings 2022", cat: "Ali", photos: P("formula-wings-2022", 10), photo: 7,
      href: "https://mon-techracing.net/formula-wings-2022",
      text: [
        "Le nuove ali per la categoria Formula 1: quasi un anno di lavoro tra disegni, stampate e prove in pista.",
        "L'ala anteriore ha due tipi di flap aggiuntivi, per tre configurazioni: basso, medio e alto carico aerodinamico. L'ala posteriore è sviluppata per il massimo carico con la minore resistenza all'avanzamento.",
      ],
      specs: [["Categoria", "Formula 1"], ["Configurazioni", "3"]],
      features: ["Montabili su tutti i modelli di Formula 1 in commercio"],
    },
    {
      id: "wing-f1-2017-white", name: "Wing F1 2017", cat: "Ali", photos: P("wing-f1-2017-white", 4), photo: 2,
      href: "https://mon-techracing.net/wing-f1-2017-white",
      text: [
        "Ali anteriori per Formula 1 in stile 2017, con carico aerodinamico variabile secondo i flap montati: ala singola per molto grip, 2 flap per grip medio, 3 flap per poco grip.",
      ],
      specs: [["Colori", "Bianco · Nero"], ["Versioni", "3 nel set"]],
      features: ["Tutte e tre le versioni", "Viti per il montaggio", "Blister di adesivi"], featuresTitle: "Nel set",
    },
    {
      id: "cockpit", name: "Cockpit", cat: "Carrozzeria", photos: P("cockpit", 4), photo: 1,
      href: "https://mon-techracing.net/cockpit",
      text: ["Cockpit per carrozzerie, in tre versioni secondo l'abitacolo del tuo modello. Stampato in policarbonato da 0,75 mm."],
      specs: [["Spessore", "0,75 mm"], ["Versioni", "A · B · C"]],
      features: [
        "A · Crawler, Scaler, abitacoli piccoli (es. Pick Up “T”)",
        "B · Rally, Touring, GT, abitacoli grandi (es. RS GT3)",
        "C · Crawler, Scaler, Rally, abitacoli medi (es. Mont-Rock)",
        "Caschi con visiera, viti e decal di cruscotto, cinture e note del navigatore",
      ],
      featuresTitle: "Versioni e kit",
    },
    {
      id: "sbs", name: "SBS · Silent Body Spacers", cat: "Carrozzeria", photos: P("sbs", 2), photo: 1,
      href: "https://mon-techracing.net/sbs",
      text: [
        "Elimina rumori e vibrazioni indesiderati per una guida più fluida e piacevole.",
        "In morbido neoprene, i distanziatori si inseriscono nei montanti della carrozzeria e ammortizzano la scocca, prevenendo i fastidiosi rumori.",
      ],
      specs: [["Materiale", "Neoprene"], ["Confezione", "Blister da 8"]],
      features: [],
    },
    {
      id: "prot-hole", name: "Prot Hole", cat: "Carrozzeria", photos: P("prot-hole", 1), photo: 1,
      href: "https://mon-techracing.net/prot-hole",
      text: ["Rondelle adesive per i fori della carrozzeria."],
      features: [],
    },
    {
      id: "wing-support-alluminium-7075-t6", name: "Wing Support 7075 T6", cat: "Telaio", photos: P("wing-support-alluminium-7075-t6", 2), photo: 2,
      href: "https://mon-techracing.net/wing-support-alluminium-7075-t6",
      text: ["Optional per Xray X1: supporto ala in Ergal 7075 T6 da 3 mm, scaricato nella parte centrale. Abbassa l'ala posteriore di 6 mm e aumenta la rigidità del gruppo banchino posteriore, favorendo una migliore trazione."],
      specs: [["Materiale", "Ergal 7075 T6"], ["Spessore", "3 mm"], ["Per", "Xray X1"]],
      features: [],
    },
    {
      id: "cover", name: "Protective Cover", cat: "Protezione", photos: P("cover", 2), photo: 2,
      href: "https://mon-techracing.net/cover",
      text: ["Guscio di protezione per elettronica e meccanica, indicato per l'utilizzo su fondi bagnati."],
      features: [],
    },
  ];
  OPTION.forEach((p) => (p.img = p.photos[(p.photo || 1) - 1]));

  window.MT_ACCESSORIES = { black: BLACK, option: OPTION };
})();
