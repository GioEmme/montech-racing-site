/* Mon-Tech Racing — dati dei modelli (hero + pagina modello)
   Testi e dati tecnici dalle pagine prodotto di mon-techracing.net. */
(() => {
  /* contact: punti in cui le gomme toccano terra, in px dell'immagine originale
       fn = anteriore lato visibile     rn = posteriore lato visibile
       ff = anteriore lato nascosto     rf = posteriore lato nascosto       */
  const MODELS = [
    {
      id: "camaro", name: "CAMARO", tag: "GT10 · scala 1/10",
      lead: "Muscoli americani, aerodinamica da pista. Una carrozzeria che si fa notare già in griglia.",
      img: "assets/web/camaro.webp", lines: "assets/web/camaro-lines.webp",
      href: "https://mon-techracing.net/camaro",
      accent: [82, 170, 50],
      nat: [1167, 623],
      contact: { fn: [485, 550], rn: [1008, 384], ff: [227, 421], rf: [768, 299] },
    },
    {
      id: "huracan", name: "HURACAN", tag: "GT10 · scala 1/10",
      lead: "Spigoli affilati e ala alta: la supercar italiana nata per tagliare il traguardo per prima.",
      img: "assets/web/huracan.webp", lines: "assets/web/huracan-lines.webp",
      href: "https://mon-techracing.net/huracan",
      accent: [225, 27, 34],
      nat: [1135, 622],
      contact: { fn: [520, 550], rn: [1006, 370], ff: [220, 436], rf: [758, 298] },
    },
    {
      id: "civic-m", name: "CIVIC-M", tag: "Mini · scala 1/10 · 160 mm",
      lead: "Lo spirito hot hatch portato in pista: la compatta più cattiva della categoria Mini.",
      img: "assets/web/civic-m.webp", lines: "assets/web/civic-m-lines.webp",
      href: "https://mon-techracing.net/civic-m",
      accent: [82, 170, 50],
      nat: [992, 532],
      contact: { fn: [495, 490], rn: [915, 335], ff: [150, 420], rf: [605, 288] },
    },
    {
      id: "mustang-gt3", name: "MUSTANG GT3", tag: "GT10 · scala 1/10",
      lead: "La pony car in assetto GT3: muso aggressivo, fiancate larghe e ala da gara.",
      img: "assets/web/mustang-gt3.webp", lines: "assets/web/mustang-gt3-lines.webp",
      href: "https://mon-techracing.net/mustang-gt3",
      accent: [225, 27, 34],
      nat: [1158, 587],
      contact: { fn: [535, 516], rn: [1035, 312], ff: [267, 393], rf: [795, 240] },
    },
    {
      id: "lc-2-112", name: "LC-2 1/12", tag: "Pan car · scala 1/12",
      lead: "Il prototipo endurance anni '80 in scala 1/12, con una livrea che non passa inosservata.",
      img: "assets/web/lc-2-112.webp", lines: "assets/web/lc-2-112-lines.webp",
      href: "https://mon-techracing.net/lc-2-1-12",
      accent: [82, 170, 50],
      nat: [1108, 584],
      contact: { fn: [630, 521], rn: [1020, 331], ff: [300, 439], rf: [730, 271] },
    },
    {
      id: "bm-h-112", name: "BM-H 1/12", tag: "Pan car · scala 1/12",
      lead: "L'hypercar da endurance in formato pan car: carene avvolgenti e ala posteriore.",
      img: "assets/web/bm-h-112.webp", lines: "assets/web/bm-h-112-lines.webp",
      href: "https://mon-techracing.net/bm-h-1-12",
      accent: [225, 27, 34],
      nat: [1232, 585],
      contact: { fn: [660, 530], rn: [1125, 356], ff: [250, 407], rf: [755, 266] },
    },
    {
      id: "bm-h", name: "BM-H", tag: "GT · LMH",
      lead: "Profilo da Le Mans e aerodinamica estrema: l'hypercar LMH in tutta la sua grinta.",
      img: "assets/web/bm-h.webp", lines: "assets/web/bm-h-lines.webp",
      href: "https://mon-techracing.net/bm-h",
      accent: [82, 170, 50],
      nat: [1176, 618],
      contact: { fn: [600, 548], rn: [1060, 356], ff: [250, 436], rf: [760, 281] },
    },
    {
      id: "a-6r", name: "A-6R", tag: "Touring · scala 1/10 · 190 mm",
      lead: "Carrozzeria touring da 190 mm pensata per il cronometro: pulita, filante, efficace.",
      img: "assets/web/a-6r.webp", lines: "assets/web/a-6r-lines.webp",
      href: "https://mon-techracing.net/a-6r",
      accent: [225, 27, 34],
      nat: [1268, 673],
      contact: { fn: [690, 600], rn: [150, 389], ff: [1040, 495], rf: [450, 334] },
    },
    {
      id: "lc-2", name: "LC-2", tag: "Pan car",
      lead: "Il prototipo endurance anni '80 nella versione pan car, con cerchi dorati e livrea da corsa.",
      img: "assets/web/lc-2.webp", lines: "assets/web/lc-2-lines.webp",
      href: "https://mon-techracing.net/lc-2",
      accent: [82, 170, 50],
      nat: [1184, 549],
      contact: { fn: [615, 491], rn: [140, 326], ff: [895, 424], rf: [390, 291] },
    },
  ];
  MODELS.forEach((m) => (m.hero = true));    // i 9 della home sono quelli dell'hero

  /* altre carrozzerie del catalogo (solo pagina Carrozzerie + pagina modello) */
  MODELS.push(
    {
      id: "c-z06", name: "C-Z06", img: "assets/web/c-z06.webp", lines: "assets/web/c-z06-lines.webp",
      href: "https://mon-techracing.net/c-z06", accent: [82, 170, 50], nat: [1226, 502],
      contact: { fn: [700, 455], rn: [150, 342], ff: [1020, 380], rf: [420, 307] },
    },
    {
      id: "499-lm", name: "499 LM", img: "assets/web/499-lm.webp", lines: "assets/web/499-lm-lines.webp",
      href: "https://mon-techracing.net/499-lm", accent: [225, 27, 34], nat: [1303, 621],
      contact: { fn: [480, 556], rn: [1135, 407], ff: [184, 420], rf: [875, 347] },
    },
    {
      id: "c3-rally", name: "C3 RALLY", img: "assets/web/c3-rally.webp", lines: "assets/web/c3-rally-lines.webp",
      href: "https://mon-techracing.net/c3-rally", accent: [82, 170, 50], nat: [1119, 549],
      contact: { fn: [640, 481], rn: [80, 383], ff: [916, 417], rf: [310, 343] },
    },
    {
      id: "gr-c", name: "GR-C", img: "assets/web/gr-c.webp", lines: "assets/web/gr-c-lines.webp",
      href: "https://mon-techracing.net/gr-c", accent: [225, 27, 34], nat: [1158, 619],
      contact: { fn: [625, 549], rn: [100, 396], ff: [929, 473], rf: [350, 351] },
    },
    {
      id: "darlington", name: "DARLINGTON", img: "assets/web/darlington.webp", lines: "assets/web/darlington-lines.webp",
      href: "https://mon-techracing.net/darlington", accent: [82, 170, 50], nat: [892, 353],
      contact: { fn: [390, 319], rn: [780, 243], ff: [170, 219], rf: [600, 198] },
    },
  );

  /* categoria del catalogo (filtri della pagina Carrozzerie), come nel menu del sito */
  const CATEGORY = {
    camaro: "GT", huracan: "GT", "mustang-gt3": "GT", "c-z06": "GT",
    "bm-h": "LMH", "499-lm": "LMH",
    "a-6r": "Touring 1/10", "civic-m": "Mini 1/10", "gr-c": "FWD 1/10", "c3-rally": "Rally",
    darlington: "Oval", "lc-2": "Pan Car", "lc-2-112": "Pan Car 1/12", "bm-h-112": "Pan Car 1/12",
  };
  MODELS.forEach((m) => (m.category = CATEGORY[m.id]));

  /* tutto il resto del catalogo (js/models-more.js, generato): dati, testi e galleria già completi */
  MODELS.push(...(window.MT_MORE || []));
  /* Dati della scheda tecnica: presi dalle pagine prodotto di mon-techracing.net.
     specs: [etichetta, valore, (true = riga intera)]  ·  kit: contenuto della confezione
     La pagina della Huracan non riporta dati: solo la categoria (dalla home).      */
  const SPECS = {
    camaro: {
      tag: "GT · scala 1/10",
      lead: "Ispirata all'iconica muscle car americana, pronta a ricreare in pista le sfide del V8 Supercar.",
      specs: [["Scala", "1/10 GT"], ["Passo", "260 mm"], ["Larghezza", "192 mm"], ["Produzione", "100% Italia"]],
      kit: ["Decalcomanie", "Mascherature vetri", "Minuteria per l'ala posteriore"],
    },
    huracan: {
      tag: "GT · scala 1/10",
      lead: "Spigoli affilati e ala alta: la supercar italiana in versione GT 1/10.",
      specs: [["Categoria", "GT 1/10", true]],
      kit: [],
      note: "Dati tecnici e contenuto del kit non ancora pubblicati sulla scheda prodotto.",
    },
    "civic-m": {
      tag: "Mini · M-Chassis",
      lead: "Dopo il successo della versione FWD 1/10, la carrozzeria dedicata agli M-Chassis.",
      specs: [["Categoria", "M-Chassis"], ["Passo", "225 mm"], ["Materiale", "Policarbonato di prima scelta", true]],
      kit: ["Mascherature finestrini", "Decal di fari e calandre", "Viti per l'ala posteriore"],
    },
    "mustang-gt3": {
      tag: "GT3 · scala 1/10",
      lead: "Dal WEC al Supercars australiano: nata da uno stampo speciale per un dettaglio senza precedenti.",
      specs: [["Passo", "260 mm"], ["Larghezza", "190 mm"], ["Spessore", "0,75 mm"], ["Materiale", "Policarbonato premium"]],
      kit: ["Decalcomanie ad alta definizione", "Maschere finestrini", "Viti per l'alettone posteriore"],
    },
    "lc-2-112": {
      tag: "Pan car · scala 1/12",
      lead: "La Group C degli anni '80 e '90 torna in scala 1/12, fedele alle proporzioni originali.",
      specs: [["Scala", "1/12 pan car"], ["Spessore", "0,75 mm"], ["Versioni", "Standard · La Leggera", true]],
      kit: ["Decalcomanie grafiche", "Maschere finestrini", "Viti per l'alettone posteriore"],
    },
    "bm-h-112": {
      tag: "LMH · pan car 1/12",
      lead: "L'ultima nata della gamma LMH, nella versione progettata per le pan car 1/12.",
      specs: [["Scala", "1/12 pan car"], ["Gamma", "LMH"], ["Disponibile anche", "1/10 · 190 mm", true]],
      kit: ["Decalcomanie grafiche", "Adesivi fari e calandre", "Mascherature vetri", "Viti per l'ala posteriore"],
    },
    "bm-h": {
      tag: "LMH · scala 1/10",
      lead: "Design realistico, qualità costruttiva e aerodinamica: l'ultima nata della gamma LMH.",
      specs: [["Scala", "1/10 · 190 mm"], ["Gamma", "LMH"], ["Disponibile anche", "1/12 pan car", true]],
      kit: ["Decalcomanie grafiche", "Adesivi fari e calandre", "Mascherature vetri", "Viti per l'ala posteriore"],
    },
    "a-6r": {
      tag: "Touring · scala 1/10",
      lead: "L'evoluzione delle Touring 1/10: stabile in velocità, rapida e sicura nei tratti tecnici.",
      specs: [["Peso Standard", "≈ 85 g"], ["Peso La Leggera", "≈ 60 g"], ["Categoria", "Touring 1/10"], ["Omologazione", "EFRA"]],
      kit: ["Mascherature finestrini", "Decal di fari e calandre", "Viti per l'ala posteriore"],
    },
    "lc-2": {
      tag: "Gruppo C · scala 1/10",
      lead: "La replica della leggendaria Gruppo C che ha dominato le piste tra gli anni '80 e '90.",
      specs: [["Larghezza", "200 mm"], ["Passo", "260 / 275 mm"], ["Spessore", "0,75 mm Leggera · 1 mm Standard", true]],
      kit: ["Parabole interne per i fari", "Ala posteriore con derive", "Mascherature finestrini", "Decal fari e calandre", "Grafiche della livrea originale"],
    },
    "c-z06": {
      tag: "GT · scala 1/10",
      lead: "Aerodinamica ulteriormente ottimizzata per la GT 1/10, una delle classi più amate nelle gare RC.",
      specs: [["Scala", "1/10 GT"], ["Spessore", "0,75 mm"], ["Materiale", "Policarbonato di alta qualità", true]],
      kit: ["Mascherature finestrini", "Adesivi fari e calandre", "Viti per l'ala posteriore"],
    },
    "499-lm": {
      tag: "LMH · scala 1/10",
      lead: "Il fac simile dell'auto vincitrice di Le Mans 2023, per telai Touring e F1.",
      specs: [["Larghezza", "190 mm"], ["Passo", "260 mm"], ["Spessore", "0,75 mm"], ["Telai", "Touring · F1"]],
      kit: ["Decal come da foto", "Mascherature finestrini", "Viti di fissaggio dell'ala"],
    },
    "c3-rally": {
      tag: "Rally · FWD",
      lead: "Una carrozzeria inedita per il mondo Rally e FWD, ispirata al celebre modello da gara francese.",
      specs: [["Categoria", "Rally · FWD"], ["Produzione", "100% Italia"], ["Materiale", "Policarbonato trasparente", true]],
      kit: ["Mascherature finestrini", "Foglio adesivi personalizzato", "Viti per ala posteriore e flap anteriori"],
    },
    "gr-c": {
      tag: "FWD · scala 1/10",
      lead: "Stile, prestazioni e controllo totale: costruita per dominare la classe FWD.",
      specs: [["Categoria", "FWD 1/10"], ["Materiale", "Policarbonato di alta qualità"]],
      kit: ["Set completo di adesivi pretagliati", "Mascherature finestrini", "Viti per l'ala posteriore"],
    },
    darlington: {
      tag: "Oval · 200 mm",
      lead: "La Nascar della serie Oval, stampata in versione “Leggera” per le gare in ovale.",
      specs: [["Categoria", "Oval 200 mm"], ["Spessore", "0,75 mm · Leggera"], ["Serie Oval", "Dega · Darlington · Bristol", true]],
      kit: ["Ala posteriore", "Viti di fissaggio", "Decal di fari e griglie", "Mascherature finestrini"],
    },
  };
  MODELS.forEach((m) => SPECS[m.id] && Object.assign(m, SPECS[m.id]));

  /* Contenuti della pagina modello (model.html?m=<id>): testi ufficiali delle
     pagine prodotto, punti di forza e numero di foto in assets/gallery/<id>_N.webp */
  const PAGES = {
    camaro: {
      gallery: 3,
      title: "La categoria GT al livello successivo",
      story: [
        "Mon-tech Racing porta la categoria GT al livello successivo con la nuovissima CAMARO! Ispirata all'iconica muscle car americana e pronta a ricreare in pista le leggendarie sfide del campionato V8 Supercar al fianco della nostra carrozzeria Mustang.",
        "Qualità 100% Made in Italy e dettagli ultra-definiti. Contatta il tuo negozio di modellismo di fiducia o il tuo distributore per ordinarla subito!",
      ],
      highlights: [],
    },
    huracan: { gallery: 3, title: "", story: [], highlights: [] },
    "civic-m": {
      gallery: 3,
      title: "La nuova arma per i telai a passo corto",
      story: [
        "Dopo il clamoroso successo della versione 1/10 nella categoria FWD, Mon-tech Racing presenta la nuova Civic-M, la carrozzeria definitiva dedicata alla categoria M-Chassis (passo 225 mm).",
        "La nuova arma totale per i telai a passo corto è pronta a fare la differenza sul cronometro.",
      ],
      highlights: [
        ["DNA 100% Mon-tech", "Pensata, progettata e stampata interamente all'interno della nostra azienda per garantire standard qualitativi senza compromessi."],
        ["Policarbonato di prima scelta", "Massima robustezza alle sollecitazioni e leggerezza ottimale per garantire la massima agilità nei cambi di direzione."],
        ["Tutto incluso nel kit", "Mascherature per i finestrini, decal dettagliate di fari e calandre e viti per il fissaggio dell'ala posteriore."],
      ],
    },
    "mustang-gt3": {
      gallery: 5,
      title: "La leggenda americana incontra l'eccellenza di Mon-tech Racing",
      story: [
        "Dai leggendari circuiti del WEC nella categoria GT3 alle emozionanti battaglie del Supercars Championship in Australia: il nome Mustang è sinonimo di pura potenza e storia del motorsport. Oggi, Mon-tech Racing è orgogliosa di presentare la replica in scala di questa icona delle corse.",
      ],
      highlights: [
        ["Una sfida tecnica vinta", "Per riprodurre fedelmente le linee muscolose e i complessi dettagli della Mustang GT3 abbiamo sviluppato uno stampo speciale unico: un livello di dettaglio e fedeltà formale senza precedenti nel mondo del modellismo RC."],
        ["100% prodotto in Italia", "Concepita, progettata e realizzata interamente nel nostro stabilimento di Scandiano, con tutta la qualità e la passione dell'artigianalità tecnologica italiana."],
        ["Compatibilità universale", "Dimensioni pensate per tutti i moderni telai RC 1/10: larghezza 190 mm, passo 260 mm."],
      ],
    },
    "lc-2-112": {
      gallery: 4,
      title: "Il ritorno di una leggenda: la Group C in scala 1/12",
      story: [
        "Appassionati di RC motorsport, preparatevi a un salto indietro nel tempo, tra gli anni '80 e '90. Dopo il grande successo della versione in scala maggiore, Mon-tech Racing è orgogliosa di presentare la nuova LC2 in scala 1/12.",
        "Non è solo un modello: è la riproduzione fedele di un'auto che ha alimentato i sogni di intere generazioni di piloti, oggi ricreata con una cura ossessiva per i dettagli e le proporzioni originali.",
      ],
      highlights: [
        ["100% Made in Italy", "Interamente ideata, sviluppata e prodotta in azienda Mon-tech."],
        ["Performance su misura", "Versione Standard per la massima robustezza, oppure “La Leggera” per chi cerca prestazioni estreme in pista."],
        ["Qualità superiore", "Policarbonato di alta qualità da 0,75 mm: il perfetto equilibrio tra leggerezza e resistenza."],
      ],
    },
    "bm-h-112": {
      gallery: 4,
      title: "La BM-H completa la gamma LMH",
      story: [
        "Mon-tech Racing è orgogliosa di annunciare la nuova BM-H, l'ultimo modello che completa la prestigiosa gamma LMH: la perfetta combinazione tra design realistico, elevata qualità costruttiva e prestazioni aerodinamiche.",
        "Come tutti i prodotti Mon-tech Racing, la BM-H è interamente progettata, sviluppata e prodotta in Italia, presso la sede di Scandiano.",
      ],
      highlights: [
        ["Scala 1/12", "La versione appositamente progettata per i modelli Pan Car."],
        ["Scala 1/10 – 190 mm", "Disponibile anche nella versione ideale per i modelli Touring."],
      ],
    },
    "bm-h": {
      gallery: 3,
      title: "La BM-H completa la gamma LMH",
      story: [
        "Mon-tech Racing è orgogliosa di annunciare la nuova BM-H, l'ultimo modello che completa la prestigiosa gamma LMH: la perfetta combinazione tra design realistico, elevata qualità costruttiva e prestazioni aerodinamiche.",
        "Come tutti i prodotti Mon-tech Racing, la BM-H è interamente progettata, sviluppata e prodotta in Italia, presso la sede di Scandiano.",
      ],
      highlights: [
        ["Scala 1/10 – 190 mm", "La versione ideale per i modelli Touring."],
        ["Scala 1/12", "Disponibile anche nella versione progettata per i modelli Pan Car."],
      ],
    },
    "a-6r": {
      gallery: 3,
      title: "L'ultima evoluzione delle Touring 1/10",
      story: [
        "Linee semplici e fluide, ma allo stesso tempo decise, studiate per trasmettere un'immediata sensazione di velocità e stabilità. La A-6R è scesa in pista dimostrando fin da subito prestazioni eccezionali, facendo segnare tempi incredibili sia nel best lap sia nel passo gara.",
        "Scorrevole in curva, estremamente stabile alle alte velocità e rapida e sicura nei tratti più lenti e tecnici: una carrozzeria completa sotto ogni aspetto del comportamento in pista.",
      ],
      highlights: [
        ["Versione Standard", "Peso di circa 85 g."],
        ["Versione “La Leggera”", "Peso di circa 60 g."],
        ["Omologata EFRA", "Pronta per le competizioni."],
      ],
    },
    "lc-2": {
      gallery: 5,
      title: "Un'icona del Gruppo C",
      story: [
        "Una carrozzeria storica e leggendaria, capace di far battere il cuore di ogni appassionato di motorsport: la LC-2, una fedele replica della celebre vettura del Gruppo C che ha dominato le piste internazionali tra gli anni '80 e '90.",
        "Come da tradizione Mon-Tech, la LC-2 è progettata e prodotta interamente in Italia: un concentrato di passione, storia e qualità Made in Italy al 100%. Un modello che unisce storia, design e performance, perfetto per chi vuole portare in pista un'autentica icona del motorsport!",
      ],
      highlights: [
        ["Leggera · 0,75 mm", "La versione per chi cerca il massimo della leggerezza."],
        ["Standard · 1 mm", "La versione più robusta."],
        ["Compatibilità", "Larghezza 200 mm, telai con passo da 260 o 275 mm."],
      ],
    },
    "c-z06": {
      gallery: 3,
      title: "Estetica e prestazioni per la GT 1/10",
      story: [
        "Mon-tech Racing presenta una nuova carrozzeria per la classe GT 1/10, una delle categorie più popolari tra gli appassionati di modellismo e gare RC. I modelli di questa classe si ispirano alle auto da corsa reali, unendo perfettamente estetica e prestazioni.",
        "Con la sua nota attenzione ai dettagli, Mon-tech ha ottimizzato ulteriormente l'aerodinamica della carrozzeria, migliorando le prestazioni in gara. Realizzata in policarbonato di alta qualità con uno spessore di 0,75 mm, offre un equilibrio ideale tra resistenza e leggerezza: un prodotto completo e pronto all'uso.",
      ],
      highlights: [],
    },
    "499-lm": {
      gallery: 3,
      title: "La vincitrice di Le Mans 2023",
      story: [
        "Siamo felici di presentarvi la nuova 499LM: un fac simile dell'auto vincitrice di Le Mans 2023.",
        "La 499LM è in scala 1/10 con larghezza di 190 mm e può essere montata su tutti i telai Touring Car di ultima generazione ed anche sui telai di F1 con passo di 260 mm. È stampata in policarbonato da 0,75 mm di primissima qualità.",
      ],
      highlights: [],
    },
    "c3-rally": {
      gallery: 3,
      title: "Pronta a dare spettacolo, in perfetto stile Rally",
      story: [
        "Arriva la C3 Rally, una carrozzeria inedita pensata per il mondo Rally e FWD. Ispirata al celebre modello da gara della rinomata casa automobilistica francese, si distingue per il design realistico, le linee aggressive e una cura nei dettagli impeccabile, per un look fedele al modello reale e un impatto scenico straordinario in pista.",
        "Come da tradizione Mon-tech Racing, anche questa carrozzeria è progettata e prodotta interamente in Italia, sinonimo di qualità, precisione e performance.",
      ],
      highlights: [],
    },
    "gr-c": {
      gallery: 3,
      title: "Costruita per dominare la classe FWD",
      // il testo sul sito è solo in inglese: questa è una traduzione
      story: [
        "Realizzata in policarbonato di alta qualità e curata in ogni dettaglio, la GR-C unisce prestazioni di altissimo livello a un design aggressivo. Il foglio decal incluso riproduce fari e calandre in modo estremamente realistico, per un look deciso e moderno.",
        "Testata per tutta l'estate, la GR-C ha dimostrato di saper offrire:",
      ],
      highlights: [
        ["Guida facile", "Una carrozzeria semplice da portare al limite."],
        ["Prestazioni costanti", "Lo stesso comportamento giro dopo giro."],
        ["Stabilità ed equilibrio", "Eccellenti in ogni tratto della pista."],
      ],
    },
    darlington: {
      gallery: 2,
      title: "La serie Oval",
      story: [
        "Le nuove carrozzerie per le gare in ovale: la serie Oval comprende tre carrozzerie, due Nascar – Dega e Darlington – e un Pick Up, il Bristol.",
        "Dega e Darlington sono stampate in versione “Leggera” da 0,75 mm; il Bristol in versione Standard da 1 mm.",
      ],
      highlights: [],
    },
  };
  MODELS.forEach((m) => {
    if (PAGES[m.id]) Object.assign(m, PAGES[m.id]);
    m.page = `model.html?m=${m.id}`;
    m.photos = Array.from({ length: m.gallery }, (_, i) => `assets/gallery/${m.id}_${i + 1}.webp`);
  });

  // disegni tecnici rigenerati a tratto sottile: versione nell'indirizzo per superare la cache
  MODELS.forEach((m) => (m.lines += "?v=2"));

  // punti ruota segnati a mano nell'editor (editor.html -> js/contacts-fix.js): hanno la precedenza
  const FIX = window.MT_CONTACTS || {};
  MODELS.forEach((m) => {
    const f = FIX[m.id];
    if (!f) return;
    if (f.nat) m.nat = f.nat;                    // tela allargata nell'editor
    if (f.contact) m.contact = f.contact;
    m.contact2 = f.contact2 || null;
  });

  // immagini web ritagliate dall'editor dopo "Allarga tela": punti e misura passano alle coordinate del ritaglio
  // (l'editor lavora sul file intero e lo salta: window.MT_EDITOR)
  const CROPS = window.MT_CROPS || {};
  if (!window.MT_EDITOR) MODELS.forEach((m) => {
    const c = CROPS[m.id];
    if (!c) return;
    const [x0, y0, w, h] = c;
    for (const ct of [m.contact, m.contact2].filter(Boolean))
      for (const k of ["fn", "rn", "ff", "rf"]) ct[k] = [ct[k][0] - x0, ct[k][1] - y0];
    m.nat = [w, h];
  });

  window.MT_MODELS = MODELS;
})();
