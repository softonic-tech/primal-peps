/**
 * Product catalog — research-use compounds.
 * Specs and research framing adapted for Primal Peps (original copy).
 * Reference catalogs reviewed: aussiepeptides.au, peplab.ai
 */
export const PRODUCTS = [
  {
    id: 'reta',
    name: 'Retatrutide',
    aka: ['Reta', 'LY3437943'],
    sub: 'Triple GLP-1 / GIP / glucagon receptor agonist for metabolic research.',
    tag: 'Best seller',
    cat: 'metabolic',
    categoryLabel: 'Metabolic Research',
    cas: '2381089-83-2',
    mw: '4,731 Da',
    lot: 'PP-2026-001',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Triple-receptor (GLP-1 / GIP / glucagon)',
      'Metabolic & adiposity models',
      'Comparative incretin research',
    ],
    researchFocus: [
      'Fat-metabolism and visceral adiposity models',
      'Appetite and caloric-intake signalling',
      'Metabolic markers (lipids, waist, energy expenditure)',
      'Comparison with dual- and mono-agonist incretin peptides',
    ],
    description:
      'Retatrutide is a synthetic tri-agonist research peptide that engages GLP-1, GIP, and glucagon receptors in a single molecule. That three-pathway profile distinguishes it from earlier incretin tools such as semaglutide (GLP-1 only) and tirzepatide (GLP-1/GIP), and is why it is widely used in metabolic, appetite, and body-composition research models. Supplied as a lyophilised vial for laboratory reconstitution.',
    story:
      'The triple-receptor research peptide at the centre of modern metabolic and incretin signalling studies.',
    hue: '#f7c04a',
    variants: [
      { id: '5mg', label: '5MG', price: 109, img: 'primal-peps-transparent-vials/retatrutide-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 135, img: 'primal-peps-transparent-vials/retatrutide-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'mots',
    name: 'MOTS-C',
    aka: ['MOTS-c', 'Mitochondrial ORF of the Twelve S rRNA type-c'],
    sub: 'Mitochondrial-derived peptide for cellular energy and metabolic research.',
    tag: 'Cellular',
    cat: 'metabolic',
    categoryLabel: 'Mitochondrial Research',
    cas: '1627580-64-6',
    mw: '1,697 Da',
    lot: 'PP-2026-002',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Mitochondrial-encoded peptide',
      'Cellular energy & metabolism',
      'Longevity pathway models',
    ],
    researchFocus: [
      'Cellular energy regulation',
      'Metabolic flexibility and AMPK-linked models',
      'Exercise and stress-adaptation research',
      'Ageing and mitochondrial signalling studies',
    ],
    description:
      'MOTS-C is an endogenous mitochondrial-derived peptide (MDP) encoded in the mitochondrial genome — unusual among mammalian peptides, which are typically nuclear-encoded. First characterised in 2015, it has become a core tool for labs studying cellular energy regulation, metabolic function, and longevity-linked mitochondrial signalling. Supplied lyophilised for in-vitro research use.',
    story:
      'A mitochondrial-derived peptide at the forefront of cellular metabolism and energy-pathway research.',
    hue: '#e8a020',
    variants: [
      { id: '5mg', label: '5MG', price: 69, img: 'primal-peps-transparent-vials/mots-c-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 80, img: 'primal-peps-transparent-vials/mots-c-10mg.png', stock: 100 },
      { id: '20mg', label: '20MG', price: 110, img: 'primal-peps-transparent-vials/mots-c-20mg.png', stock: 100 },
      { id: '40mg', label: '40MG', price: 145, img: 'primal-peps-transparent-vials/mots-c-40mg.png', stock: 100 },
    ],
  },
  {
    id: 'cjc',
    name: 'CJC + IPA',
    aka: ['CJC-1295 no DAC + Ipamorelin', 'CJC/IPA blend'],
    sub: 'Dual GH-axis secretagogue blend for endocrine pathway research.',
    tag: 'Research duo',
    cat: 'growth',
    categoryLabel: 'Growth Hormone Research',
    cas: null,
    mw: 'Blend',
    lot: 'PP-2026-003',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    composition: [
      { name: 'CJC-1295 (no DAC)', note: 'GHRH analogue component' },
      { name: 'Ipamorelin', note: 'Selective GHS-R agonist component' },
    ],
    perks: [
      'GH-axis signalling',
      'Pulsatile secretagogue models',
      'Endocrine pathway research',
    ],
    researchFocus: [
      'Growth-hormone release dynamics',
      'GHRH + ghrelin-receptor co-stimulation models',
      'IGF-1 pathway research',
      'Recovery and conditioning study designs',
    ],
    description:
      'CJC + IPA combines CJC-1295 without DAC (a GHRH analogue) with Ipamorelin (a selective growth-hormone secretagogue receptor agonist) in one research vial. The blend is used to study synergistic GH-axis signalling — GHRH-pathway stimulation plus ghrelin-receptor activation — without the extended half-life of DAC-modified CJC. Ideal for labs running pulsatile GH and endocrine pathway protocols.',
    story:
      'The dual secretagogue blend trusted for GH-axis signalling and endocrine pathway research.',
    hue: '#f7c04a',
    variants: [
      { id: '5mg', label: '5MG', price: 79, img: 'primal-peps-transparent-vials/cjc-ipa-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 115, img: 'primal-peps-transparent-vials/cjc-ipa-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'ghk',
    name: 'GHK-Cu',
    aka: ['Copper tripeptide-1', 'Glycyl-L-histidyl-L-lysine copper'],
    sub: 'Endogenous copper tripeptide for matrix signalling and dermal research.',
    tag: 'Copper',
    cat: 'repair',
    categoryLabel: 'Skin & Cellular Research',
    cas: '49557-75-7',
    mw: '340 Da',
    lot: 'PP-2026-004',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Collagen & elastin signalling',
      'Wound-healing models',
      'Gene-expression research',
    ],
    researchFocus: [
      'Collagen and elastin synthesis in dermal fibroblasts',
      'Wound healing and epidermal repair models',
      'Inflammatory signalling in ageing tissue',
      'Gene-expression modulation linked to cellular renewal',
    ],
    description:
      'GHK-Cu is a naturally occurring copper tripeptide whose plasma concentration declines with age. It is studied for collagen and elastin synthesis, wound healing, inflammatory modulation, and broad gene-expression effects in dermal and tissue-repair research. Research-grade lyophilised peptide supports controlled laboratory protocols beyond low-dose cosmetic formulations.',
    story:
      'The copper-binding tripeptide essential for matrix signalling and cellular repair research.',
    hue: '#d98e1b',
    variants: [
      { id: '50mg', label: '50MG', price: 70, img: 'primal-peps-transparent-vials/ghk-cu-50mg.png', stock: 100 },
      { id: '100mg', label: '100MG', price: 88, img: 'primal-peps-transparent-vials/ghk-cu-100mg.png', stock: 0 },
    ],
  },
  {
    id: 'tesa',
    name: 'Tesamorelin',
    aka: ['GHRH analogue', 'TH9507'],
    sub: 'Stabilised GHRH analogue for visceral adiposity and GH-axis research.',
    tag: 'GHRH',
    cat: 'growth',
    categoryLabel: 'Metabolic Research',
    cas: '218949-48-5',
    mw: '5,135 Da',
    lot: 'PP-2026-005',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Visceral adipose research',
      'GH / IGF-1 axis',
      'Body-composition models',
    ],
    researchFocus: [
      'Visceral adipose tissue (VAT) reduction models',
      'Body recomposition vs gross weight change',
      'Endogenous GH and IGF-1 elevation',
      'Recovery and conditioning pathway studies',
    ],
    description:
      'Tesamorelin is a stabilised analogue of growth hormone-releasing hormone (GHRH). Research interest centres on its preferential effect on visceral adipose tissue rather than broad appetite suppression — distinguishing it from GLP-1-class compounds. It is widely used in body-composition, GH/IGF-1 axis, and metabolic distribution studies.',
    story:
      'A GHRH analogue widely used in lipid-metabolism and endocrine signalling research.',
    hue: '#e8a020',
    variants: [
      { id: '5mg', label: '5MG', price: 85, img: 'primal-peps-transparent-vials/tesamorelin-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 130, img: 'primal-peps-transparent-vials/tesamorelin-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'klow',
    name: 'KLOW',
    aka: ['KLOW blend', 'GHK-Cu / BPC-157 / TB-500 / KPV'],
    sub: 'Four-peptide blend for tissue repair, inflammation, and recovery research.',
    tag: 'Signature',
    cat: 'recovery',
    categoryLabel: 'Tissue Repair Research',
    cas: null,
    mw: 'Blend',
    lot: 'PP-2026-006',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    composition: [
      { name: 'GHK-Cu', amount: '50 mg' },
      { name: 'BPC-157', amount: '10 mg' },
      { name: 'TB-500', amount: '10 mg' },
      { name: 'KPV', amount: '10 mg' },
    ],
    perks: [
      'Structural repair + inflammation',
      'Multi-pathway stack',
      'Gut-barrier & recovery models',
    ],
    researchFocus: [
      'Tissue regeneration and remodelling',
      'Anti-inflammatory and immune-modulation models',
      'Gut-barrier and barrier-integrity research',
      'Combined dermal + systemic recovery protocols',
    ],
    description:
      'KLOW is a four-peptide research blend combining GHK-Cu, BPC-157, TB-500, and KPV in a single vial. Where GLOW is positioned around dermal and structural repair, KLOW extends the stack with KPV for broader anti-inflammatory, gut-barrier, and recovery research. Designed for protocols that need structural repair and inflammation control together.',
    story:
      'Our signature multi-peptide blend for advanced cellular signalling and recovery research.',
    hue: '#f7c04a',
    variants: [
      { id: '70mg', label: '70MG', price: 75, img: 'primal-peps-transparent-vials/klow-70mg.png', stock: 0 },
      { id: '80mg', label: '80MG', price: 185, img: 'primal-peps-transparent-vials/klow-80mg.png', stock: 100 },
    ],
  },
  {
    id: 'tb',
    name: 'TB-500',
    aka: ['Thymosin beta-4 fragment', 'TB4 fragment'],
    sub: 'Thymosin β4 fragment for actin regulation and tissue research models.',
    tag: 'Tissue models',
    cat: 'recovery',
    categoryLabel: 'Tissue Repair Research',
    cas: '77591-33-4',
    mw: '4,963 Da',
    lot: 'PP-2026-007',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Actin regulation',
      'Cell-migration studies',
      'Angiogenic research models',
    ],
    researchFocus: [
      'Actin binding and cytoskeletal dynamics',
      'Cell migration and tissue remodelling',
      'Angiogenesis and wound-healing models',
      'Soft-tissue and connective-tissue research',
    ],
    description:
      'TB-500 is a synthetic fragment related to thymosin beta-4, studied for actin regulation, cell migration, and tissue-remodelling pathways. It is a staple compound in angiogenesis, wound-healing, and connective-tissue research models, often paired with BPC-157 in multi-pathway repair protocols.',
    story:
      'The thymosin beta-4 fragment essential for actin regulation and tissue research models.',
    hue: '#d98e1b',
    variants: [
      { id: '5mg', label: '5MG', price: 65, img: 'primal-peps-transparent-vials/tb-500-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 115, img: 'primal-peps-transparent-vials/tb-500-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'bpc',
    name: 'BPC-157',
    aka: ['Body Protection Compound-157', 'PL 14736'],
    sub: 'Gastric pentadecapeptide for angiogenic and tissue-repair research.',
    tag: 'Popular',
    cat: 'repair',
    categoryLabel: 'Tissue Repair Research',
    cas: '137525-51-0',
    mw: '1,419 Da',
    lot: 'PP-2026-008',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Multi-tissue repair models',
      'Angiogenic pathway research',
      'GI & musculoskeletal studies',
    ],
    researchFocus: [
      'Muscle, tendon, and ligament repair models',
      'Gastrointestinal tissue research',
      'Angiogenesis and cytoprotection',
      'Inflammatory signalling in injury models',
    ],
    description:
      'BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide derived from a sequence found in gastric juice. It is one of the most extensively studied repair compounds in peptide research, with activity across musculoskeletal, gastrointestinal, and angiogenic models — valued for multi-system tissue-repair protocols rather than a single-target pathway.',
    story:
      'The gastric pentadecapeptide at the centre of angiogenic pathway and tissue research.',
    hue: '#e8a020',
    variants: [
      { id: '5mg', label: '5MG', price: 59, img: 'primal-peps-transparent-vials/bpc-157-5mg.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 80, img: 'primal-peps-transparent-vials/bpc-157-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'cagri',
    name: 'Cagrilintide',
    aka: ['Long-acting amylin analogue'],
    sub: 'Long-acting amylin analogue for satiety and metabolic pathway research.',
    tag: 'New drop',
    cat: 'metabolic',
    categoryLabel: 'Metabolic Research',
    cas: null,
    mw: '4,409 Da',
    lot: 'PP-2026-009',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Amylin receptor pathway',
      'Satiety & gastric-emptying models',
      'Combination metabolic research',
    ],
    researchFocus: [
      'Appetite and satiety signalling via amylin',
      'Body-weight reduction models (mono & combo)',
      'Complementary mechanism to GLP-1 agonists',
      'Post-meal glycaemic and gastric-emptying studies',
    ],
    description:
      'Cagrilintide is a long-acting analogue of amylin — a pancreatic hormone co-secreted with insulin that contributes to satiety, gastric emptying, and post-meal glucose control. Unlike native amylin, it is engineered for extended research dosing. Primary interest is as a complementary mechanism to GLP-1 agonists (separate amylin pathway), including combination designs studied in modern weight-management research.',
    story:
      'A long-acting amylin analogue advancing metabolic and appetite-pathway research models.',
    hue: '#f7c04a',
    variants: [
      { id: '10mg', label: '10MG', price: 115, img: 'primal-peps-transparent-vials/cagrilintide-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'mt2',
    name: 'MT-2',
    aka: ['Melanotan II', 'Melanotan 2', 'MT-II'],
    sub: 'Non-selective melanocortin agonist for pigmentation and receptor research.',
    tag: 'New drop',
    cat: 'recovery',
    categoryLabel: 'Melanocortin Research',
    cas: '121062-08-6',
    mw: '1,024 Da',
    lot: 'PP-2026-010',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Melanogenesis models',
      'MC1R–MC5R signalling',
      'Appetite & arousal pathway research',
    ],
    researchFocus: [
      'Melanin synthesis and pigmentation models',
      'Melanocortin receptor pharmacology (MC1R–MC5R)',
      'Appetite modulation research',
      'Central melanocortin system studies',
    ],
    description:
      'Melanotan II (MT-2) is a synthetic analogue of α-melanocyte-stimulating hormone (α-MSH). As a non-selective melanocortin receptor agonist, it is studied for melanogenesis, appetite signalling, and broader melanocortin pharmacology. Distinct from Melanotan I (afamelanotide), which is more MC1R-selective.',
    story:
      'The melanocortin analogue used widely in pigmentation and receptor-pathway research.',
    hue: '#d98e1b',
    variants: [
      { id: '10mg', label: '10MG', price: 65, img: 'primal-peps-transparent-vials/mt-2-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'bac',
    name: 'BAC Water',
    aka: ['Bacteriostatic water', '0.9% benzyl alcohol water'],
    sub: 'Bacteriostatic water for laboratory reconstitution of lyophilised peptides.',
    tag: 'Essential',
    cat: 'repair',
    categoryLabel: 'Lab Supplies',
    cas: null,
    mw: 'N/A',
    lot: 'PP-2026-011',
    form: 'Sterile solution',
    purity: 'USP-grade solvent',
    storageLyophilised: 'Room temperature — protect from light',
    storageReconstituted: 'N/A — use as directed for reconstitution',
    reconstitution: 'Use to reconstitute lyophilised research peptides',
    perks: [
      'Peptide reconstitution',
      'Lab preparation essential',
      'Sterile research solvent',
    ],
    researchFocus: [
      'Reconstitution of lyophilised peptides',
      'Standard laboratory sample preparation',
    ],
    description:
      'Bacteriostatic water is sterile water containing 0.9% benzyl alcohol as a preservative. It is the standard solvent for reconstituting lyophilised research peptides in the lab. Pair with any Primal Peps vial before assay or protocol work.',
    story:
      'The essential bacteriostatic water for reconstituting lyophilised research peptides.',
    hue: '#e8a020',
    variants: [
      { id: 'std', label: '3ML', price: 10, img: 'primal-peps-transparent-vials/bac-water-3ml.png', stock: 100 },
    ],
  },
  {
    id: 'glow',
    name: 'GLOW',
    aka: ['GLOW blend', 'GHK-Cu / BPC-157 / TB-500'],
    sub: 'Three-peptide blend for skin, matrix, and structural repair research.',
    tag: 'Blend',
    cat: 'repair',
    categoryLabel: 'Tissue Repair Research',
    cas: null,
    mw: 'Blend',
    lot: 'PP-2026-012',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    composition: [
      { name: 'GHK-Cu', amount: '50 mg' },
      { name: 'BPC-157', amount: '10 mg' },
      { name: 'TB-500', amount: '10 mg' },
    ],
    perks: [
      'Dermal structural repair',
      'Collagen + angiogenesis stack',
      'Pre-blended research convenience',
    ],
    researchFocus: [
      'Skin rejuvenation and dermal matrix models',
      'Collagen / elastin signalling (GHK-Cu)',
      'Cytoprotection and inflammation (BPC-157)',
      'Cell migration and angiogenic remodelling (TB-500)',
    ],
    description:
      'GLOW combines GHK-Cu, BPC-157, and TB-500 in one pre-blended research vial. Each component covers a distinct pathway — structural protein signalling, cytoprotection / inflammatory modulation, and angiogenic cell-migration — for labs studying skin, matrix, and structural repair without compounding three separate vials.',
    story:
      'A multi-peptide blend formulated for advanced skin, matrix, and cellular repair research.',
    hue: '#f7c04a',
    variants: [
      { id: '70mg', label: '70MG', price: 155, img: 'primal-peps-transparent-vials/glow-70mg.png', stock: 100 },
    ],
  },
  {
    id: 'nad',
    name: 'NAD+',
    aka: ['Nicotinamide adenine dinucleotide', 'β-NAD'],
    sub: 'Essential coenzyme for cellular energy and redox-pathway research.',
    tag: 'Cellular',
    cat: 'metabolic',
    categoryLabel: 'Mitochondrial Research',
    cas: '53-84-9',
    mw: '663 Da',
    lot: 'PP-2026-013',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Cellular energy metabolism',
      'Redox & sirtuin pathways',
      'Mitochondrial research staple',
    ],
    researchFocus: [
      'Cellular energy and ATP-linked pathways',
      'Redox balance and electron-transfer research',
      'Sirtuin and NAD+-dependent enzyme studies',
      'Ageing and metabolic stress models',
    ],
    description:
      'NAD+ (nicotinamide adenine dinucleotide) is a central coenzyme in cellular energy metabolism and redox chemistry. Research use spans mitochondrial function, sirtuin activity, and metabolic stress models. Supplied as a high-purity lyophilised research compound for laboratory reconstitution.',
    story:
      'The essential coenzyme at the centre of cellular energy and redox-pathway research.',
    hue: '#e8a020',
    variants: [
      { id: '500mg', label: '500MG', price: 115, img: 'primal-peps-transparent-vials/nad-plus-500mg.png', stock: 100 },
    ],
  },
  {
    id: 'semax',
    name: 'Semax',
    aka: ['Met-Glu-His-Phe-Pro-Gly-Pro', 'ACTH(4-10) analogue'],
    sub: 'Synthetic heptapeptide for nootropic and neuroprotection research.',
    tag: 'Cognitive',
    cat: 'recovery',
    categoryLabel: 'Neurological Research',
    cas: '80714-61-0',
    mw: '813.9 Da',
    lot: 'PP-2026-014',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Cognitive & memory models',
      'Neuroprotection research',
      'BDNF / NGF pathway studies',
    ],
    researchFocus: [
      'Learning and memory models',
      'Neurotrophic factor signalling (BDNF, NGF)',
      'Ischaemia and neuroprotection assays',
      'Attention and cognitive performance research',
    ],
    description:
      'Semax is a synthetic heptapeptide analogue of ACTH(4–10), developed for neurological research. It is studied in models of cognitive function, neurotrophic signalling, and neuroprotection. Unlike many ACTH fragments, Semax is formulated without strong hormonal ACTH activity and is used as a research tool for CNS peptide pharmacology. Supplied lyophilised for laboratory reconstitution.',
    story:
      'A widely referenced cognitive-research peptide for neurotrophic and neuroprotection models.',
    hue: '#6ea8dc',
    variants: [
      { id: '10mg', label: '10MG', price: 55, img: 'primal-peps-transparent-vials/semax-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'selank',
    name: 'Selank',
    aka: ['Thr-Lys-Pro-Arg-Pro-Gly-Pro', 'Tuftsin analogue'],
    sub: 'Synthetic heptapeptide for anxiolytic and cognitive research.',
    tag: 'Cognitive',
    cat: 'recovery',
    categoryLabel: 'Neurological Research',
    cas: '129954-34-3',
    mw: '751.9 Da',
    lot: 'PP-2026-015',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Anxiolytic pathway models',
      'Cognitive & memory research',
      'Immune-modulation studies',
    ],
    researchFocus: [
      'Anxiety and stress-response models',
      'Learning and memory assays',
      'GABAergic and serotonergic signalling',
      'Immune peptide pharmacology',
    ],
    description:
      'Selank is a synthetic heptapeptide analogue of tuftsin studied for anxiolytic, cognitive, and immunomodulatory research. Supplied lyophilised for laboratory reconstitution.',
    story:
      'A tuftsin-analogue research peptide for anxiety and cognitive pathway models.',
    hue: '#6ea8dc',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/selank-10mg.png', stock: 0 },
    ],
  },
  {
    id: 'bpctb',
    name: 'BPC + TB-500',
    aka: ['BPC-157 / TB-500 blend', 'Repair blend'],
    sub: 'Two-peptide blend for tissue repair and recovery research.',
    tag: 'Blend',
    cat: 'repair',
    categoryLabel: 'Tissue Repair Research',
    cas: null,
    mw: 'Blend',
    lot: 'PP-2026-016',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    composition: [
      { name: 'BPC-157', amount: '5 mg' },
      { name: 'TB-500', amount: '5 mg' },
    ],
    perks: [
      'Combined repair pathways',
      'Cytoprotection + cell migration',
      'Pre-blended research convenience',
    ],
    researchFocus: [
      'Tissue repair and wound-healing models',
      'Inflammatory modulation (BPC-157)',
      'Cell migration and angiogenesis (TB-500)',
    ],
    description:
      'BPC + TB-500 combines BPC-157 and TB-500 in one research vial for labs studying structural repair, cytoprotection, and angiogenic cell-migration together.',
    story:
      'A dual-peptide blend for advanced tissue-repair and recovery research.',
    hue: '#d98e1b',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/bpc-tb-500-10mg.png', stock: 0 },
    ],
  },
  {
    id: 'ahk',
    name: 'AHK-Cu',
    aka: ['Copper tripeptide AHK', 'Alanyl-histidyl-lysine copper'],
    sub: 'Copper-binding tripeptide for dermal and follicle research.',
    tag: 'Copper',
    cat: 'repair',
    categoryLabel: 'Skin & Cellular Research',
    cas: null,
    mw: '404 Da',
    lot: 'PP-2026-017',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Dermal matrix signalling',
      'Follicle research models',
      'Copper-peptide pathways',
    ],
    researchFocus: [
      'Dermal fibroblast and matrix models',
      'Hair follicle signalling research',
      'Copper-dependent peptide pharmacology',
    ],
    description:
      'AHK-Cu is a copper-binding tripeptide studied alongside GHK-Cu in dermal matrix, follicle, and skin-repair research models. Supplied lyophilised for laboratory use.',
    story:
      'A copper tripeptide tool for dermal and follicle signalling research.',
    hue: '#d98e1b',
    variants: [
      { id: '50mg', label: '50MG', price: 88, img: 'primal-peps-transparent-vials/ahk-cu-50mg.png', stock: 0 },
    ],
  },
  {
    id: 'kpv',
    name: 'KPV',
    aka: ['Lys-Pro-Val', 'α-MSH (11-13)'],
    sub: 'Tripeptide fragment for anti-inflammatory and barrier research.',
    tag: 'Repair',
    cat: 'repair',
    categoryLabel: 'Tissue Repair Research',
    cas: '67724-08-7',
    mw: '342.4 Da',
    lot: 'PP-2026-018',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Anti-inflammatory models',
      'Gut-barrier research',
      'α-MSH fragment studies',
    ],
    researchFocus: [
      'Inflammatory signalling modulation',
      'Intestinal barrier and colitis models',
      'Melanocortin-related peptide pharmacology',
    ],
    description:
      'KPV is the C-terminal tripeptide of α-MSH, studied for anti-inflammatory and epithelial-barrier research without the pigmentation activity of full-length melanocortin peptides.',
    story:
      'A compact α-MSH fragment for inflammation and barrier-pathway research.',
    hue: '#e8a020',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/kpv-10mg.png', stock: 0 },
    ],
  },
  {
    id: 'adamax',
    name: 'Adamax',
    aka: ['N-acetyl Semax amidate', 'Semax analogue'],
    sub: 'Acetylated Semax analogue for cognitive and neurotrophic research.',
    tag: 'Cognitive',
    cat: 'recovery',
    categoryLabel: 'Neurological Research',
    cas: null,
    mw: '869 Da',
    lot: 'PP-2026-019',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Enhanced Semax analogue',
      'Cognitive pathway models',
      'Neurotrophic research',
    ],
    researchFocus: [
      'Learning and memory models',
      'Neurotrophic factor signalling',
      'CNS peptide stability and pharmacology',
    ],
    description:
      'Adamax is an N-acetylated, amidated Semax analogue designed for improved stability in cognitive and neurotrophic research models. Supplied lyophilised for laboratory reconstitution.',
    story:
      'A stabilised Semax analogue for advanced cognitive-research protocols.',
    hue: '#6ea8dc',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/adamax-10mg.png', stock: 0 },
    ],
  },
  {
    id: 'igf1',
    name: 'IGF-1 LR3',
    aka: ['Long Arg3 IGF-1', 'IGF-1 Long R3'],
    sub: 'Extended IGF-1 analogue for growth-factor and anabolic research.',
    tag: 'Growth',
    cat: 'growth',
    categoryLabel: 'Growth Factor Research',
    cas: '143045-27-6',
    mw: '9,111 Da',
    lot: 'PP-2026-020',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'IGF receptor signalling',
      'Anabolic & hypertrophy models',
      'Extended half-life analogue',
    ],
    researchFocus: [
      'IGF-1 receptor pathway studies',
      'Muscle and tissue growth models',
      'Cell proliferation and differentiation assays',
    ],
    description:
      'IGF-1 LR3 is a recombinant analogue of insulin-like growth factor-1 with an N-terminal extension and Arg substitution at position 3, studied for prolonged IGF receptor signalling in growth and metabolic research.',
    story:
      'A long-acting IGF-1 analogue for growth-factor and anabolic pathway research.',
    hue: '#f7c04a',
    variants: [
      { id: '1mg', label: '1MG', price: 88, img: 'primal-peps-transparent-vials/igf-1-lr3-1mg.png', stock: 0 },
    ],
  },
  {
    id: 'mt1',
    name: 'MT-1',
    aka: ['Melanotan I', 'Afamelanotide', 'NDP-MSH'],
    sub: 'MC1R-selective α-MSH analogue for pigmentation research.',
    tag: 'Pigment',
    cat: 'recovery',
    categoryLabel: 'Pigmentation Research',
    cas: '75921-69-6',
    mw: '1,646.9 Da',
    lot: 'PP-2026-021',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 8–12 weeks',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'MC1R-selective agonist',
      'Melanogenesis models',
      'Photoprotection research',
    ],
    researchFocus: [
      'Melanin synthesis and pigmentation models',
      'MC1R receptor pharmacology',
      'UV-response and photoprotection assays',
    ],
    description:
      'Melanotan I (MT-1 / afamelanotide) is a synthetic α-MSH analogue with preferential MC1R activity, studied for melanogenesis and photoprotection research. Distinct from the broader receptor profile of Melanotan II.',
    story:
      'The MC1R-focused melanocortin analogue for pigmentation pathway research.',
    hue: '#d98e1b',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/mt-1-10mg.png', stock: 0 },
    ],
  },
  {
    id: 'tirz',
    name: 'Tirzepatide',
    aka: ['LY3298176', 'Dual GIP / GLP-1 agonist'],
    sub: 'Dual GIP / GLP-1 receptor agonist for metabolic research.',
    tag: 'Metabolic',
    cat: 'metabolic',
    categoryLabel: 'Metabolic Research',
    cas: '2023788-19-2',
    mw: '4,813 Da',
    lot: 'PP-2026-022',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Dual GIP / GLP-1 agonist',
      'Metabolic & appetite models',
      'Incretin pathway research',
    ],
    researchFocus: [
      'Appetite and caloric-intake signalling',
      'Glycaemic and metabolic marker studies',
      'Comparison with mono- and tri-agonist incretin peptides',
    ],
    description:
      'Tirzepatide is a dual GIP and GLP-1 receptor agonist researched extensively in metabolic, appetite, and body-composition models. Supplied lyophilised for laboratory reconstitution.',
    story:
      'The dual-incretin research peptide widely used in modern metabolic studies.',
    hue: '#f7c04a',
    variants: [
      { id: '10mg', label: '10MG', price: 88, img: 'primal-peps-transparent-vials/tirzepatide-10mg.png', stock: 0 },
      { id: '20mg', label: '20MG', price: 88, img: 'primal-peps-transparent-vials/tirzepatide-20mg.png', stock: 0 },
    ],
  },
  {
    id: 'sema',
    name: 'Semaglutide',
    aka: ['Sema', 'GLP-1 receptor agonist'],
    sub: 'Long-acting GLP-1 receptor agonist for metabolic research.',
    tag: 'Metabolic',
    cat: 'metabolic',
    categoryLabel: 'Metabolic Research',
    cas: '910463-68-2',
    mw: '4,113.6 Da',
    lot: 'PP-2026-023',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Selective GLP-1 receptor agonist',
      'Metabolic & appetite models',
      'Incretin pathway research',
    ],
    researchFocus: [
      'Appetite and caloric-intake signalling',
      'Glycaemic and metabolic marker studies',
      'Comparison with dual- and tri-agonist incretin peptides',
    ],
    description:
      'Semaglutide is a long-acting GLP-1 receptor agonist widely used in metabolic, appetite, and body-composition research models. As a mono-agonist GLP-1 tool, it is commonly compared with dual agonists such as tirzepatide and tri-agonists such as retatrutide. Supplied lyophilised for laboratory reconstitution.',
    story:
      'The foundational GLP-1 research peptide used across modern metabolic and incretin studies.',
    hue: '#f7c04a',
    variants: [
      { id: '10mg', label: '10MG', price: 99, img: 'primal-peps-transparent-vials/semaglutide-10mg.png', stock: 100 },
      { id: '20mg', label: '20MG', price: 149, img: 'primal-peps-transparent-vials/semaglutide-20mg.png', stock: 100 },
     ],
  },
  {
    id: '5amino',
    name: '5-Amino',
    aka: ['5-Amino-1MQ', '5-Amino-1-methylquinolinium'],
    sub: 'NNMT inhibitor tool compound for metabolic and NAD+ pathway research.',
    tag: 'New drop',
    cat: 'metabolic',
    categoryLabel: 'Metabolic Research',
    cas: '42464-96-0',
    mw: '159 Da',
    lot: 'PP-2026-024',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'NNMT pathway research',
      'NAD+ / metabolic models',
      'Adipocyte signalling studies',
    ],
    researchFocus: [
      'Nicotinamide N-methyltransferase (NNMT) inhibition models',
      'Cellular NAD+ and energy metabolism',
      'Adipocyte size and metabolic signalling',
      'Comparative metabolic pathway research',
    ],
    description:
      '5-Amino (5-Amino-1MQ) is a membrane-permeable research compound studied as an inhibitor of nicotinamide N-methyltransferase (NNMT). Labs use it to probe NAD+ salvage, adipocyte metabolism, and energy-pathway signalling in controlled in-vitro models. Supplied lyophilised for laboratory reconstitution.',
    story:
      'A compact NNMT-pathway tool compound for modern metabolic and NAD+ research.',
    hue: '#f7c04a',
    variants: [
      { id: '10mg', label: '10MG', price: 75, img: 'primal-peps-transparent-vials/5-amino-10mg.png', stock: 100 },
      { id: '50mg', label: '50MG', price: 145, img: 'primal-peps-transparent-vials/5-amino-50mg.png', stock: 100 },
    ],
  },
  {
    id: 'cjcdac',
    name: 'CJC With DAC',
    aka: ['CJC-1295 with DAC', 'DAC-CJC-1295', 'Drug Affinity Complex CJC'],
    sub: 'Long-acting GHRH analogue with Drug Affinity Complex for sustained GH-axis research.',
    tag: 'New drop',
    cat: 'growth',
    categoryLabel: 'Growth Hormone Research',
    cas: '863288-34-0',
    mw: '3,648 Da',
    lot: 'PP-2026-025',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Extended half-life GHRH model',
      'Sustained GH-axis signalling',
      'Endocrine pathway research',
    ],
    researchFocus: [
      'Prolonged GHRH-receptor activation',
      'Sustained GH and IGF-1 dynamics',
      'Comparison with non-DAC CJC analogues',
      'Long-interval endocrine research protocols',
    ],
    description:
      'CJC with DAC is a modified GHRH analogue carrying a Drug Affinity Complex (DAC) that extends circulating half-life relative to non-DAC CJC-1295. It is used in laboratory models that require sustained GH-axis stimulation rather than short pulsatile pulses. Supplied as a lyophilised research vial.',
    story:
      'The long-acting CJC analogue for sustained GH-axis and endocrine pathway studies.',
    hue: '#e8a020',
    variants: [
      { id: '10mg', label: '10MG', price: 95, img: 'primal-peps-transparent-vials/cjc-with-dac-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'cjcnodac',
    name: 'CJC Without DAC',
    aka: ['CJC-1295 no DAC', 'Mod GRF 1-29', 'CJC-1295 without DAC'],
    sub: 'Short-acting GHRH analogue for pulsatile GH-axis research protocols.',
    tag: 'New drop',
    cat: 'growth',
    categoryLabel: 'Growth Hormone Research',
    cas: '863288-34-0',
    mw: '3,368 Da',
    lot: 'PP-2026-026',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Pulsatile GHRH signalling',
      'Often paired with GHS analogues',
      'Endocrine timing studies',
    ],
    researchFocus: [
      'Short-duration GHRH receptor activation',
      'Pulsatile GH release dynamics',
      'Co-administration models with Ipamorelin and related GHS',
      'Comparison with DAC-extended CJC analogues',
    ],
    description:
      'CJC without DAC (often called Mod GRF 1-29) is a GHRH analogue designed for shorter-acting, pulsatile GH-axis research — without the albumin-binding DAC extension. It is frequently studied alongside growth-hormone secretagogues such as Ipamorelin. Supplied lyophilised for in-vitro research use.',
    story:
      'The classic short-acting CJC analogue for pulsatile GH-axis research.',
    hue: '#d98e1b',
    variants: [
      { id: '10mg', label: '10MG', price: 85, img: 'primal-peps-transparent-vials/cjc-without-dac-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'ipa',
    name: 'Ipamorelin',
    aka: ['IPA', 'NNC 26-0161'],
    sub: 'Selective ghrelin-receptor (GHS-R) agonist for GH secretagogue research.',
    tag: 'New drop',
    cat: 'growth',
    categoryLabel: 'Growth Hormone Research',
    cas: '170851-70-4',
    mw: '711 Da',
    lot: 'PP-2026-027',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Selective GHS-R agonist',
      'Pulsatile GH models',
      'Often stacked with GHRH analogues',
    ],
    researchFocus: [
      'Ghrelin-receptor mediated GH release',
      'Selectivity vs broader GHS peptides',
      'Pulsatile endocrine signalling',
      'Combinatorial protocols with CJC / GHRH analogues',
    ],
    description:
      'Ipamorelin is a pentapeptide growth-hormone secretagogue that selectively targets the ghrelin receptor (GHS-R1a). It is widely used in GH-axis research for its focused secretagogue profile and is commonly paired with GHRH analogues such as CJC without DAC. Supplied lyophilised for laboratory reconstitution.',
    story:
      'A selective GH secretagogue staple for endocrine and recovery-pathway research.',
    hue: '#f7c04a',
    variants: [
      { id: '10mg', label: '10MG', price: 75, img: 'primal-peps-transparent-vials/ipamorelin-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'dsip',
    name: 'DSIP',
    aka: ['Delta Sleep-Inducing Peptide'],
    sub: 'Nonapeptide studied in sleep architecture and stress-adaptation models.',
    tag: 'New drop',
    cat: 'recovery',
    categoryLabel: 'Neuromodulation Research',
    cas: '62568-57-4',
    mw: '849 Da',
    lot: 'PP-2026-028',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Sleep-architecture models',
      'Stress-adaptation research',
      'CNS signalling studies',
    ],
    researchFocus: [
      'Delta-wave and sleep-stage research models',
      'Stress and recovery signalling',
      'Hypothalamic peptide pathway studies',
      'Neuroendocrine adaptation protocols',
    ],
    description:
      'DSIP (Delta Sleep-Inducing Peptide) is a nonapeptide originally isolated from cerebral venous blood and studied for its associations with sleep architecture, stress adaptation, and related neuroendocrine signalling. Supplied as a lyophilised research peptide for controlled laboratory use.',
    story:
      'A classic CNS-linked nonapeptide for sleep and stress-adaptation research models.',
    hue: '#e8a020',
    variants: [
      { id: '10mg', label: '10MG', price: 70, img: 'primal-peps-transparent-vials/dsip-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'hcg',
    name: 'HCG',
    aka: ['Human Chorionic Gonadotropin', 'hCG'],
    sub: 'Glycoprotein hormone for LH-receptor and reproductive-axis research.',
    tag: 'New drop',
    cat: 'growth',
    categoryLabel: 'Endocrine Research',
    cas: '9002-61-3',
    mw: '~36.7 kDa',
    lot: 'PP-2026-029',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'LH-receptor pathway research',
      'Reproductive-axis models',
      'Gonadotropin signalling studies',
    ],
    researchFocus: [
      'LH / hCG receptor activation models',
      'Gonadal steroidogenesis research',
      'Reproductive endocrinology pathways',
      'Comparative gonadotropin signalling',
    ],
    description:
      'HCG (human chorionic gonadotropin) is a glycoprotein hormone that engages LH/hCG receptors and is used extensively in reproductive and endocrine pathway research. This research-grade lyophilised preparation is intended for controlled laboratory protocols only.',
    story:
      'A foundational gonadotropin for LH-receptor and reproductive-axis research.',
    hue: '#d98e1b',
    variants: [
      { id: '10000iu', label: '10000IU', price: 95, img: 'primal-peps-transparent-vials/hcg-10000iu.png', stock: 100 },
    ],
  },
  {
    id: 'glutathione',
    name: 'Glutathione',
    aka: ['GSH', 'L-Glutathione', 'γ-L-Glutamyl-L-cysteinylglycine'],
    sub: 'Endogenous tripeptide antioxidant for redox and detoxification research.',
    tag: 'New drop',
    cat: 'repair',
    categoryLabel: 'Cellular Research',
    cas: '70-18-8',
    mw: '307 Da',
    lot: 'PP-2026-030',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Cellular redox models',
      'Detoxification pathway research',
      'Oxidative-stress studies',
    ],
    researchFocus: [
      'Glutathione redox cycle and antioxidant capacity',
      'Phase II detoxification signalling',
      'Oxidative stress and cellular resilience',
      'Comparative antioxidant pathway research',
    ],
    description:
      'Glutathione (GSH) is the principal intracellular thiol antioxidant — a tripeptide of glutamate, cysteine, and glycine. Research applications span redox balance, detoxification, and oxidative-stress models. Supplied lyophilised at research purity for laboratory reconstitution.',
    story:
      'The core cellular antioxidant tripeptide for redox and detoxification research.',
    hue: '#f7c04a',
    variants: [
      { id: '1500mg', label: '1500MG', price: 65, img: 'primal-peps-transparent-vials/glutathione-1500mg.png', stock: 100 },
    ],
  },
  {
    id: 'kisspeptin',
    name: 'Kisspeptin',
    aka: ['Kisspeptin-10', 'Metastin', 'Kp-10'],
    sub: 'KISS1R agonist peptide for reproductive neuroendocrine research.',
    tag: 'New drop',
    cat: 'growth',
    categoryLabel: 'Endocrine Research',
    cas: '374675-50-6',
    mw: '1,302 Da',
    lot: 'PP-2026-031',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'GnRH / HPG-axis research',
      'KISS1R signalling',
      'Reproductive neuroendocrine models',
    ],
    researchFocus: [
      'Kisspeptin receptor (KISS1R) activation',
      'GnRH pulse-generator upstream signalling',
      'Hypothalamic–pituitary–gonadal axis models',
      'Comparative reproductive neuroendocrine research',
    ],
    description:
      'Kisspeptin (commonly studied as Kisspeptin-10) is a KISS1-gene product that activates the kisspeptin receptor (KISS1R) and sits upstream of GnRH release in reproductive neuroendocrine research. Supplied lyophilised for controlled laboratory use.',
    story:
      'A key upstream peptide for GnRH-axis and reproductive neuroendocrine studies.',
    hue: '#e8a020',
    variants: [
      { id: '10mg', label: '10MG', price: 80, img: 'primal-peps-transparent-vials/kisspeptin-10mg.png', stock: 100 },
    ],
  },
  {
    id: 'epithalon',
    name: 'Epithalon',
    aka: ['Epitalon', 'Ala-Glu-Asp-Gly', 'Epithalone'],
    sub: 'Synthetic tetrapeptide for telomerase and ageing-pathway research.',
    tag: 'New drop',
    cat: 'metabolic',
    categoryLabel: 'Longevity Research',
    cas: '307297-39-8',
    mw: '390 Da',
    lot: 'PP-2026-032',
    form: 'Lyophilised powder',
    purity: '99%+',
    storageLyophilised: '-20 °C — protect from light & moisture',
    storageReconstituted: '2–8 °C — use within 28 days',
    reconstitution: 'Bacteriostatic water (recommended)',
    perks: [
      'Telomerase pathway models',
      'Ageing & pineal research',
      'Cellular longevity studies',
    ],
    researchFocus: [
      'Telomerase activity and telomere-length models',
      'Pineal and circadian peptide research',
      'Cellular senescence and ageing pathways',
      'Comparative longevity-peptide protocols',
    ],
    description:
      'Epithalon (Epitalon) is a synthetic tetrapeptide analogue related to epithalamin, studied in telomerase regulation, pineal signalling, and cellular ageing research models. Supplied as a lyophilised vial for laboratory reconstitution.',
    story:
      'A compact longevity-research tetrapeptide centred on telomerase and ageing pathways.',
    hue: '#d98e1b',
    variants: [
      { id: '10mg', label: '10MG', price: 75, img: 'primal-peps-transparent-vials/epithalon-10mg.png', stock: 100 },
    ],
  },
]

export const SPOTLIGHT_IDS = ['reta', 'mots', 'cjc']
export const PTS_PER_DOLLAR = 2
export const PROMO = 'PRIMAL15'

export const ANNOUNCE_MSGS = [
  'Free shipping on orders over $150',
  'Research use only · Not for human or veterinary consumption',
  '18+ to purchase · Pay by PayID',
  'Every batch third-party lab tested',
]

export const FILTERS = [
  { cat: 'all', label: 'All' },
  { cat: 'metabolic', label: 'Metabolic' },
  { cat: 'recovery', label: 'Recovery' },
  { cat: 'growth', label: 'Growth' },
  { cat: 'repair', label: 'Repair' },
]

export const imgSrc = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path
  return (
    '/' +
    String(path)
      .split('/')
      .map(encodeURIComponent)
      .join('/')
  )
}

export const fmt = (n) => '$' + Number(n || 0).toFixed(2)

/** Display-only compare-at markup. Checkout still uses the current price. */
export const SALE_OFF_PERCENT = 20

export function listPrice(price) {
  return Math.round(Number(price) * (1 + SALE_OFF_PERCENT / 100) * 100) / 100
}

/** True when stock is unknown (static catalog) or greater than zero. */
export const isInStock = (variant) =>
  variant != null &&
  (variant.stock === undefined ||
    variant.stock === null ||
    Number(variant.stock) > 0)

/** Prefer an in-stock variant; fall back to first listed. */
export const defaultVariant = (product) => {
  const variants = product?.variants || []
  return variants.find(isInStock) || variants[0]
}

export const findVariant = (product, variantId) =>
  product?.variants?.find((v) => v.id === variantId) || defaultVariant(product)

export const productHasStock = (product) =>
  (product?.variants || []).some(isInStock)

/** Resolve a product image path from catalog (for orders / history). */
export const orderItemImg = (item, catalog = PRODUCTS) => {
  if (item?.img && (/^https?:\/\//i.test(item.img) || item.img.startsWith('/'))) {
    return item.img
  }
  const product = (catalog || []).find((p) => p.id === item?.productId)
  if (!product) return item?.img || ''
  const byLabel = product.variants.find((v) => v.label === item.variantLabel)
  const byId = item.variantId
    ? product.variants.find((v) => v.id === item.variantId)
    : null
  return (byLabel || byId || product.variants[0])?.img || item?.img || ''
}

export const cartKey = (productId, variantId) => `${productId}::${variantId}`

export const parseCartKey = (key) => {
  const [productId, variantId] = key.split('::')
  return { productId, variantId }
}
