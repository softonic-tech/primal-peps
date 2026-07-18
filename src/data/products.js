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
      { id: '5mg', label: '5MG', price: 119, img: 'products/RETATRUTIDE.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 145, img: 'products/RETATRUTIDE-10MG.png', stock: 100 },
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
      { id: '5mg', label: '5MG', price: 79, img: 'products/MOTS-C.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 90, img: 'products/MOTS-C-10MG.png', stock: 100 },
      { id: '40mg', label: '40MG', price: 155, img: 'products/MOTS-C-10MG.png', stock: 100 },
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
      { id: '5mg', label: '5MG', price: 89, img: 'products/CJC-IPA.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 125, img: 'products/CJC-IPA-10MG.png', stock: 100 },
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
      { id: '50mg', label: '50MG', price: 80, img: 'products/GHK-CU.png', stock: 100 },
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
      { id: '5mg', label: '5MG', price: 95, img: 'products/TESAMORELIN.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 140, img: 'products/TESAMORELIN-10MG.png', stock: 100 },
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
      { id: '70mg', label: '70MG', price: 85, img: 'products/KLOW-70.png', stock: 0 },
      { id: '80mg', label: '80MG', price: 195, img: 'products/KLOW-80.png', stock: 100 },
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
      { id: '5mg', label: '5MG', price: 75, img: 'products/TB-500.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 125, img: 'products/TB-500-10MG.png', stock: 100 },
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
      { id: '5mg', label: '5MG', price: 69, img: 'products/BPC-157.png', stock: 0 },
      { id: '10mg', label: '10MG', price: 90, img: 'products/BPC-157-10MG.png', stock: 100 },
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
      { id: '10mg', label: '10MG', price: 125, img: 'products/CAGRILINTIDE.png', stock: 100 },
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
      { id: '10mg', label: '10MG', price: 75, img: 'products/MT-2.png', stock: 100 },
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
      { id: 'std', label: '3ML', price: 10, img: 'products/BAC-WATER.png', stock: 100 },
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
      { id: '70mg', label: '70MG', price: 165, img: 'products/GLOW.png', stock: 100 },
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
      { id: '500mg', label: '500MG', price: 125, img: 'products/NAD.png', stock: 100 },
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
      { id: '10mg', label: '10MG', price: 65, img: 'products/SEMAX.png', stock: 100 },
    ],
  },
]

export const SPOTLIGHT_IDS = ['reta', 'mots', 'cjc']
export const PTS_PER_DOLLAR = 2
export const PROMO = 'PRIMAL15'

export const ANNOUNCE_MSGS = [
  'Free shipping on orders over $150',
  'Research use only · Not for human or veterinary consumption',
  '18+ to purchase · Pay by bank transfer',
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
