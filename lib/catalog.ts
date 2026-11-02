// Static catalog. Wig shapes are YouCam hair-transfer templates (filled from GET /v2.1/task/template/hair-transfer);
// head-covering photos live in public/products and are used as the try-on reference image.
export type Tone = "warm" | "cool" | "neutral";
export type Fit = "f" | "m";
// for: which style set shows it (feminine or masculine); no value = shown in both.
export type Product = { id: string; name: string; price: number; detail: string; ref: string; thumb?: string; for?: Fit };

export const SHADES: { name: string; hex: string; tone: Tone }[] = [
  { name: "Soft black", hex: "#1f1a17", tone: "neutral" },
  { name: "Espresso", hex: "#3b2a20", tone: "warm" },
  { name: "Cool brown", hex: "#4a3c36", tone: "cool" },
  { name: "Chestnut", hex: "#6a3f26", tone: "warm" },
  { name: "Auburn", hex: "#7f3a22", tone: "warm" },
  { name: "Honey", hex: "#b08048", tone: "warm" },
  { name: "Ash blonde", hex: "#a89a80", tone: "cool" },
  { name: "Silver", hex: "#b7b4ae", tone: "cool" },
];

// ref = template_id for wigs, image path for head coverings.
export const CATALOG: Record<"wig" | "cover", Product[]> = {
  wig: [
    { id: "w1", name: "Isla pixie", price: 189, detail: "Synthetic · basic cap", ref: "all_pixie", thumb: "https://app-cdn.makeupar.com/cms/66060d01-0427-4bdd-8942-5bca565cfcbd/1775101460877/file.jpg", for: "f" },
    { id: "w2", name: "Maren French bob", price: 249, detail: "Synthetic · lace front", ref: "all_french_bob", thumb: "https://app-cdn.makeupar.com/cms/3ec08a45-89a4-4855-a51e-144caa2870a3/1770091312495/file.jpg", for: "f" },
    { id: "w3", name: "Noor wavy lob", price: 420, detail: "Heat-friendly · monofilament top", ref: "female_modern_wavy_lob", thumb: "https://app-cdn.makeupar.com/cms/6f5ed48c-541f-4a22-b967-b3f77f50fb68/1773991575084/file.jpg", for: "f" },
    { id: "w4", name: "Tamsin shag", price: 360, detail: "Synthetic · lace front", ref: "all_face_framing_shag_cut", thumb: "https://app-cdn.makeupar.com/cms/2ead8fe5-76f3-4233-94f2-98684a3f9d41/1770007724171/file.jpg", for: "f" },
    { id: "w5", name: "Adaeze afro", price: 980, detail: "Human hair · hand-tied", ref: "female_afro", thumb: "https://app-cdn.makeupar.com/cms/bceafb66-3743-42c1-989f-842a480fe93e/1778749474456/file.jpg", for: "f" },
    { id: "w6", name: "Priya long straight", price: 1450, detail: "Human hair · monofilament top", ref: "female_long_straight", thumb: "https://app-cdn.makeupar.com/cms/e9dae350-1313-46a2-9cad-1f94988da1e2/1770194631310/file.jpg", for: "f" },
    { id: "w7", name: "Rosa loose waves", price: 1180, detail: "Human hair · lace front", ref: "all_loose_waves", thumb: "https://app-cdn.makeupar.com/cms/092c4759-b384-4502-8de4-62f2a8437074/1773303942050/file.jpg", for: "f" },
    { id: "w8", name: "June spiral curls", price: 2200, detail: "Remy human hair · hand-tied", ref: "female_long_spiral_curls", thumb: "https://app-cdn.makeupar.com/cms/d8ebd3f0-503f-4ad3-baf6-11ba77b2d756/1775543705441/file.jpg", for: "f" },
    { id: "m1", name: "Theo textured crop", price: 299, detail: "Synthetic · lace base", ref: "male_textured_crop", thumb: "https://app-cdn.makeupar.com/cms/430a5763-f41c-4ea6-a9c8-7c64b9b3b942/1778665908784/file.jpg", for: "m" },
    { id: "m2", name: "Sami comma fringe", price: 340, detail: "Synthetic · skin base", ref: "male_textured_comma", thumb: "https://app-cdn.makeupar.com/cms/ceea0fd7-a766-4d39-a067-625f4638954c/1778825131587/file.jpg", for: "m" },
    { id: "m3", name: "Kofi short curls", price: 380, detail: "Synthetic · lace base", ref: "male_short_curly", thumb: "https://app-cdn.makeupar.com/cms/47633eff-2086-4791-b454-825aa6f9e160/1780481384535/file.jpg", for: "m" },
    { id: "m4", name: "Malik afro", price: 890, detail: "Human hair · hand-tied", ref: "male_afro", thumb: "https://app-cdn.makeupar.com/cms/59db293e-2053-4c7a-90a1-70781e8b7949/1778750239189/file.jpg", for: "m" },
    { id: "m5", name: "Arjun wavy undercut", price: 420, detail: "Heat-friendly · lace front", ref: "male_wavy_undercut", thumb: "https://app-cdn.makeupar.com/cms/f9bb06a7-fd1b-42ae-938d-275f3fde65cc/1770112938420/file.jpg", for: "m" },
    { id: "m6", name: "Leo side-swept", price: 460, detail: "Human hair · skin base", ref: "all_side_swept_undercut", thumb: "https://app-cdn.makeupar.com/cms/b7554bb7-a51e-413c-89c3-e36e71df51bc/1770086982870/file.jpg", for: "m" },
    { id: "m7", name: "Walter silver taper", price: 520, detail: "Human hair · lace base", ref: "male_gray_taper_fade", thumb: "https://app-cdn.makeupar.com/cms/02a90e43-398a-4eda-b0bc-e9595d75430f/1778825209411/file.jpg", for: "m" },
    { id: "m8", name: "Nico locs", price: 1250, detail: "Human hair · hand-tied", ref: "all_dreadlocks", thumb: "https://app-cdn.makeupar.com/cms/ee789d47-c009-4bde-b585-5cb76dc02576/1774603196507/file.jpg", for: "m" },
  ],
  cover: [
    { id: "s1", name: "Cotton wrap, clay", price: 28, detail: "Breathable cotton", ref: "products/scarf-1.jpg", for: "f" },
    { id: "s2", name: "Bamboo turban, sage", price: 34, detail: "Soft on a sensitive scalp", ref: "products/scarf-2.jpg", for: "f" },
    { id: "s3", name: "Botanical print turban", price: 46, detail: "Silk-lined, pre-shaped", ref: "products/scarf-3.jpg", for: "f" },
    { id: "s4", name: "Jersey head wrap", price: 24, detail: "Stretch, no knots", ref: "products/scarf-4.jpg", for: "f" },
    { id: "h1", name: "Knit beanie", price: 22, detail: "For sleep and cold days", ref: "products/hat-1.jpg" },
    { id: "h2", name: "Sun bucket hat", price: 30, detail: "UPF 50 for a bare scalp", ref: "products/hat-2.jpg" },
    { id: "c1", name: "Cotton skull cap", price: 18, detail: "Soft seams for sleep", ref: "products/cap-1.jpg", for: "m" },
    { id: "c2", name: "Plain six-panel cap", price: 26, detail: "Unstructured, no logo", ref: "products/cap-2.jpg", for: "m" },
    { id: "c3", name: "Silky durag", price: 16, detail: "Smooth on a sensitive scalp", ref: "products/cap-3.jpg", for: "m" },
    { id: "c4", name: "Wool flat cap", price: 38, detail: "Warm, keeps its shape", ref: "products/cap-4.jpg", for: "m" },
  ],
};
