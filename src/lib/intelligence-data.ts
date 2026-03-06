import { architects, products, projects, brands } from "./mock-data";

// ─── Activity Feed ───────────────────────────────────────────────────────────

export type ActivityType =
  | "product_saved"
  | "spec_downloaded"
  | "board_add"
  | "website_visit"
  | "enquiry"
  | "project_tagged";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: string;
  actor: { name: string; role: "architect" | "homeowner" | "brand" };
  productName?: string;
  productId?: string;
  projectName?: string;
  projectId?: string;
  boardName?: string;
  architectName?: string;
  brandName?: string;
  message?: string;
}

const now = Date.now();
const min = (m: number) => new Date(now - m * 60_000).toISOString();

export const activityFeed: ActivityEvent[] = [
  { id: "act-1", type: "product_saved", timestamp: min(1), actor: { name: "Elena Vasquez", role: "architect" }, productName: "Pendant Light — Arc", productId: "prod-2", brandName: "Flōra Lighting" },
  { id: "act-2", type: "spec_downloaded", timestamp: min(3), actor: { name: "Sarah Mitchell", role: "homeowner" }, productName: "Engineered Oak Panel", productId: "prod-3", brandName: "DuraLux Surfaces" },
  { id: "act-3", type: "board_add", timestamp: min(5), actor: { name: "James Chen", role: "architect" }, productName: "Lounge Chair — Miro", productId: "prod-4", boardName: "Te Aro Loft — Living" },
  { id: "act-4", type: "enquiry", timestamp: min(8), actor: { name: "Tom Henderson", role: "homeowner" }, productName: "Standing Seam Panel", productId: "prod-5", brandName: "CoverVault Roofing", message: "Requesting sample and pricing for 120m² roof area" },
  { id: "act-5", type: "website_visit", timestamp: min(11), actor: { name: "Marcus Reid", role: "architect" }, brandName: "Akaroa Kitchens", productName: "Island Benchtop 3m", productId: "prod-7" },
  { id: "act-6", type: "project_tagged", timestamp: min(14), actor: { name: "Sophie Müller", role: "architect" }, productName: "Composite Deck Board", productId: "prod-6", projectName: "Garden Pavilion", projectId: "proj-3" },
  { id: "act-7", type: "product_saved", timestamp: min(18), actor: { name: "Rebecca Liu", role: "homeowner" }, productName: "Wall Sconce — Halo", productId: "prod-8", brandName: "Flōra Lighting" },
  { id: "act-8", type: "spec_downloaded", timestamp: min(22), actor: { name: "Aroha Tane", role: "architect" }, productName: "Concrete Look Tile", productId: "prod-9", brandName: "DuraLux Surfaces" },
  { id: "act-9", type: "board_add", timestamp: min(27), actor: { name: "Elena Vasquez", role: "architect" }, productName: "Matte Black Pull Handle", productId: "prod-1", boardName: "Coastal Retreat — Kitchen" },
  { id: "act-10", type: "enquiry", timestamp: min(31), actor: { name: "David Park", role: "homeowner" }, productName: "Pergola Kit 4x3", productId: "prod-11", brandName: "TerraRange", message: "Can this be customised to 5x4 metres?" },
  { id: "act-11", type: "product_saved", timestamp: min(35), actor: { name: "Oliver Park", role: "architect" }, productName: "Flat Roof Membrane", productId: "prod-12", brandName: "CoverVault Roofing" },
  { id: "act-12", type: "website_visit", timestamp: min(42), actor: { name: "Sophie Müller", role: "architect" }, brandName: "Southmade Furniture", productName: "Dining Table — Niko", productId: "prod-10" },
  { id: "act-13", type: "spec_downloaded", timestamp: min(48), actor: { name: "James Chen", role: "architect" }, productName: "Pendant Light — Arc", productId: "prod-2", brandName: "Flōra Lighting" },
  { id: "act-14", type: "project_tagged", timestamp: min(55), actor: { name: "Marcus Reid", role: "architect" }, productName: "Dining Table — Niko", productId: "prod-10", projectName: "Mountain House", projectId: "proj-4" },
  { id: "act-15", type: "board_add", timestamp: min(62), actor: { name: "Aroha Tane", role: "architect" }, productName: "Engineered Oak Panel", productId: "prod-3", boardName: "Community Centre — Main Hall" },
  { id: "act-16", type: "product_saved", timestamp: min(70), actor: { name: "Lucy Tan", role: "homeowner" }, productName: "Pendant Light — Arc", productId: "prod-2", brandName: "Flōra Lighting" },
  { id: "act-17", type: "enquiry", timestamp: min(78), actor: { name: "Elena Vasquez", role: "architect" }, productName: "Engineered Oak Panel", productId: "prod-3", brandName: "DuraLux Surfaces", message: "Need 85m² for Coastal Retreat project — bulk pricing?" },
  { id: "act-18", type: "spec_downloaded", timestamp: min(90), actor: { name: "Oliver Park", role: "architect" }, productName: "Matte Black Pull Handle", productId: "prod-1", brandName: "Akaroa Kitchens" },
  { id: "act-19", type: "website_visit", timestamp: min(105), actor: { name: "Rebecca Liu", role: "homeowner" }, brandName: "Flōra Lighting", productName: "Pendant Light — Arc", productId: "prod-2" },
  { id: "act-20", type: "board_add", timestamp: min(120), actor: { name: "Marcus Reid", role: "architect" }, productName: "Standing Seam Panel", productId: "prod-5", boardName: "Mountain House — Exterior" },
];

// ─── Architect Influence Scores ──────────────────────────────────────────────

export interface ArchitectInfluence {
  architectId: string;
  name: string;
  firm: string;
  avatar: string;
  influenceScore: number;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  metrics: {
    productDiscoveries: number;
    productSaves: number;
    specDownloads: number;
    enquiriesGenerated: number;
    boardsCreated: number;
    projectsPublished: number;
  };
  monthlyTrend: { month: string; score: number }[];
  topInfluencedProducts: { productId: string; productName: string; brand: string; influence: number }[];
  topInfluencedBrands: { brandId: string; brandName: string; influence: number }[];
}

export const architectInfluenceData: ArchitectInfluence[] = [
  {
    architectId: "arch-1",
    name: "Elena Vasquez",
    firm: "Vasquez Studio",
    avatar: architects[0].avatar,
    influenceScore: 94,
    tier: "Platinum",
    metrics: { productDiscoveries: 1247, productSaves: 389, specDownloads: 267, enquiriesGenerated: 48, boardsCreated: 12, projectsPublished: 12 },
    monthlyTrend: [{ month: "Jul", score: 78 }, { month: "Aug", score: 82 }, { month: "Sep", score: 85 }, { month: "Oct", score: 88 }, { month: "Nov", score: 91 }, { month: "Dec", score: 94 }],
    topInfluencedProducts: [
      { productId: "prod-2", productName: "Pendant Light — Arc", brand: "Flōra Lighting", influence: 89 },
      { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", influence: 76 },
      { productId: "prod-1", productName: "Matte Black Pull Handle", brand: "Akaroa Kitchens", influence: 64 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-2", brandName: "Flōra Lighting", influence: 92 },
      { brandId: "brand-3", brandName: "DuraLux Surfaces", influence: 78 },
      { brandId: "brand-1", brandName: "Akaroa Kitchens", influence: 65 },
    ],
  },
  {
    architectId: "arch-4",
    name: "Marcus Reid",
    firm: "Reid Architecture",
    avatar: architects[3].avatar,
    influenceScore: 87,
    tier: "Platinum",
    metrics: { productDiscoveries: 982, productSaves: 312, specDownloads: 198, enquiriesGenerated: 37, boardsCreated: 9, projectsPublished: 10 },
    monthlyTrend: [{ month: "Jul", score: 72 }, { month: "Aug", score: 75 }, { month: "Sep", score: 79 }, { month: "Oct", score: 82 }, { month: "Nov", score: 85 }, { month: "Dec", score: 87 }],
    topInfluencedProducts: [
      { productId: "prod-5", productName: "Standing Seam Panel", brand: "CoverVault Roofing", influence: 82 },
      { productId: "prod-10", productName: "Dining Table — Niko", brand: "Southmade Furniture", influence: 71 },
      { productId: "prod-2", productName: "Pendant Light — Arc", brand: "Flōra Lighting", influence: 58 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-5", brandName: "CoverVault Roofing", influence: 85 },
      { brandId: "brand-4", brandName: "Southmade Furniture", influence: 72 },
      { brandId: "brand-2", brandName: "Flōra Lighting", influence: 61 },
    ],
  },
  {
    architectId: "arch-3",
    name: "Sophie Müller",
    firm: "Müller Atelier",
    avatar: architects[2].avatar,
    influenceScore: 81,
    tier: "Gold",
    metrics: { productDiscoveries: 856, productSaves: 278, specDownloads: 187, enquiriesGenerated: 29, boardsCreated: 14, projectsPublished: 15 },
    monthlyTrend: [{ month: "Jul", score: 69 }, { month: "Aug", score: 72 }, { month: "Sep", score: 74 }, { month: "Oct", score: 77 }, { month: "Nov", score: 79 }, { month: "Dec", score: 81 }],
    topInfluencedProducts: [
      { productId: "prod-4", productName: "Lounge Chair — Miro", brand: "Southmade Furniture", influence: 78 },
      { productId: "prod-7", productName: "Island Benchtop 3m", brand: "Akaroa Kitchens", influence: 65 },
      { productId: "prod-11", productName: "Pergola Kit 4x3", brand: "TerraRange", influence: 53 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-4", brandName: "Southmade Furniture", influence: 80 },
      { brandId: "brand-1", brandName: "Akaroa Kitchens", influence: 68 },
      { brandId: "brand-6", brandName: "TerraRange", influence: 55 },
    ],
  },
  {
    architectId: "arch-2",
    name: "James Chen",
    firm: "Chen & Associates",
    avatar: architects[1].avatar,
    influenceScore: 74,
    tier: "Gold",
    metrics: { productDiscoveries: 621, productSaves: 198, specDownloads: 142, enquiriesGenerated: 22, boardsCreated: 7, projectsPublished: 8 },
    monthlyTrend: [{ month: "Jul", score: 58 }, { month: "Aug", score: 62 }, { month: "Sep", score: 65 }, { month: "Oct", score: 68 }, { month: "Nov", score: 71 }, { month: "Dec", score: 74 }],
    topInfluencedProducts: [
      { productId: "prod-8", productName: "Wall Sconce — Halo", brand: "Flōra Lighting", influence: 72 },
      { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", influence: 61 },
      { productId: "prod-9", productName: "Concrete Look Tile", brand: "DuraLux Surfaces", influence: 48 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-2", brandName: "Flōra Lighting", influence: 74 },
      { brandId: "brand-3", brandName: "DuraLux Surfaces", influence: 63 },
    ],
  },
  {
    architectId: "arch-5",
    name: "Aroha Tane",
    firm: "Tane Design Collective",
    avatar: architects[4].avatar,
    influenceScore: 68,
    tier: "Silver",
    metrics: { productDiscoveries: 487, productSaves: 156, specDownloads: 98, enquiriesGenerated: 18, boardsCreated: 6, projectsPublished: 7 },
    monthlyTrend: [{ month: "Jul", score: 52 }, { month: "Aug", score: 55 }, { month: "Sep", score: 58 }, { month: "Oct", score: 62 }, { month: "Nov", score: 65 }, { month: "Dec", score: 68 }],
    topInfluencedProducts: [
      { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", influence: 64 },
      { productId: "prod-6", productName: "Composite Deck Board", brand: "TerraRange", influence: 55 },
      { productId: "prod-11", productName: "Pergola Kit 4x3", brand: "TerraRange", influence: 42 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-3", brandName: "DuraLux Surfaces", influence: 66 },
      { brandId: "brand-6", brandName: "TerraRange", influence: 58 },
    ],
  },
  {
    architectId: "arch-6",
    name: "Oliver Park",
    firm: "Park Studio",
    avatar: architects[5].avatar,
    influenceScore: 59,
    tier: "Silver",
    metrics: { productDiscoveries: 398, productSaves: 124, specDownloads: 87, enquiriesGenerated: 14, boardsCreated: 5, projectsPublished: 9 },
    monthlyTrend: [{ month: "Jul", score: 44 }, { month: "Aug", score: 47 }, { month: "Sep", score: 50 }, { month: "Oct", score: 53 }, { month: "Nov", score: 56 }, { month: "Dec", score: 59 }],
    topInfluencedProducts: [
      { productId: "prod-1", productName: "Matte Black Pull Handle", brand: "Akaroa Kitchens", influence: 56 },
      { productId: "prod-12", productName: "Flat Roof Membrane", brand: "CoverVault Roofing", influence: 48 },
      { productId: "prod-8", productName: "Wall Sconce — Halo", brand: "Flōra Lighting", influence: 39 },
    ],
    topInfluencedBrands: [
      { brandId: "brand-1", brandName: "Akaroa Kitchens", influence: 58 },
      { brandId: "brand-5", brandName: "CoverVault Roofing", influence: 50 },
    ],
  },
];

// ─── Product Momentum ────────────────────────────────────────────────────────

export interface ProductMomentum {
  productId: string;
  productName: string;
  brand: string;
  brandId: string;
  image: string;
  momentumScore: number;
  trend: "surging" | "rising" | "steady" | "cooling";
  metrics: {
    views: number;
    viewsGrowth: number;
    saves: number;
    savesGrowth: number;
    boards: number;
    boardsGrowth: number;
    specs: number;
    specsGrowth: number;
    projectTags: number;
    projectTagsGrowth: number;
  };
  weeklyData: { day: string; views: number; saves: number }[];
  taggedInProjects: string[];
  savedByArchitects: string[];
}

const prodImgFn = (i: number) =>
  `https://placehold.co/400x400/fafafa/737373?text=Product+${i + 1}`;

export const productMomentumData: ProductMomentum[] = [
  {
    productId: "prod-2", productName: "Pendant Light — Arc", brand: "Flōra Lighting", brandId: "brand-2", image: prodImgFn(1),
    momentumScore: 96, trend: "surging",
    metrics: { views: 3842, viewsGrowth: 47, saves: 189, savesGrowth: 62, boards: 34, boardsGrowth: 41, specs: 156, specsGrowth: 38, projectTags: 8, projectTagsGrowth: 33 },
    weeklyData: [{ day: "Mon", views: 420, saves: 18 }, { day: "Tue", views: 510, saves: 24 }, { day: "Wed", views: 580, saves: 31 }, { day: "Thu", views: 620, saves: 28 }, { day: "Fri", views: 690, saves: 36 }, { day: "Sat", views: 540, saves: 27 }, { day: "Sun", views: 482, saves: 25 }],
    taggedInProjects: ["proj-1", "proj-4"],
    savedByArchitects: ["arch-1", "arch-2", "arch-4"],
  },
  {
    productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", brandId: "brand-3", image: prodImgFn(2),
    momentumScore: 88, trend: "surging",
    metrics: { views: 2956, viewsGrowth: 38, saves: 142, savesGrowth: 45, boards: 28, boardsGrowth: 52, specs: 121, specsGrowth: 29, projectTags: 6, projectTagsGrowth: 50 },
    weeklyData: [{ day: "Mon", views: 340, saves: 14 }, { day: "Tue", views: 390, saves: 18 }, { day: "Wed", views: 450, saves: 22 }, { day: "Thu", views: 470, saves: 21 }, { day: "Fri", views: 520, saves: 27 }, { day: "Sat", views: 410, saves: 20 }, { day: "Sun", views: 376, saves: 20 }],
    taggedInProjects: ["proj-1", "proj-2", "proj-5"],
    savedByArchitects: ["arch-1", "arch-2", "arch-5"],
  },
  {
    productId: "prod-4", productName: "Lounge Chair — Miro", brand: "Southmade Furniture", brandId: "brand-4", image: prodImgFn(3),
    momentumScore: 79, trend: "rising",
    metrics: { views: 2180, viewsGrowth: 28, saves: 98, savesGrowth: 35, boards: 19, boardsGrowth: 26, specs: 87, specsGrowth: 22, projectTags: 4, projectTagsGrowth: 100 },
    weeklyData: [{ day: "Mon", views: 260, saves: 10 }, { day: "Tue", views: 290, saves: 12 }, { day: "Wed", views: 320, saves: 15 }, { day: "Thu", views: 340, saves: 16 }, { day: "Fri", views: 360, saves: 18 }, { day: "Sat", views: 310, saves: 14 }, { day: "Sun", views: 300, saves: 13 }],
    taggedInProjects: ["proj-3"],
    savedByArchitects: ["arch-3", "arch-2"],
  },
  {
    productId: "prod-1", productName: "Matte Black Pull Handle", brand: "Akaroa Kitchens", brandId: "brand-1", image: prodImgFn(0),
    momentumScore: 72, trend: "rising",
    metrics: { views: 1890, viewsGrowth: 22, saves: 78, savesGrowth: 28, boards: 15, boardsGrowth: 20, specs: 92, specsGrowth: 18, projectTags: 5, projectTagsGrowth: 25 },
    weeklyData: [{ day: "Mon", views: 220, saves: 8 }, { day: "Tue", views: 250, saves: 10 }, { day: "Wed", views: 280, saves: 12 }, { day: "Thu", views: 290, saves: 13 }, { day: "Fri", views: 310, saves: 14 }, { day: "Sat", views: 270, saves: 11 }, { day: "Sun", views: 270, saves: 10 }],
    taggedInProjects: ["proj-1", "proj-6"],
    savedByArchitects: ["arch-1", "arch-6"],
  },
  {
    productId: "prod-5", productName: "Standing Seam Panel", brand: "CoverVault Roofing", brandId: "brand-5", image: prodImgFn(4),
    momentumScore: 65, trend: "steady",
    metrics: { views: 1540, viewsGrowth: 12, saves: 56, savesGrowth: 15, boards: 11, boardsGrowth: 10, specs: 78, specsGrowth: 14, projectTags: 3, projectTagsGrowth: 0 },
    weeklyData: [{ day: "Mon", views: 200, saves: 7 }, { day: "Tue", views: 210, saves: 7 }, { day: "Wed", views: 220, saves: 8 }, { day: "Thu", views: 230, saves: 9 }, { day: "Fri", views: 240, saves: 9 }, { day: "Sat", views: 220, saves: 8 }, { day: "Sun", views: 220, saves: 8 }],
    taggedInProjects: ["proj-4"],
    savedByArchitects: ["arch-4", "arch-6"],
  },
  {
    productId: "prod-10", productName: "Dining Table — Niko", brand: "Southmade Furniture", brandId: "brand-4", image: prodImgFn(9),
    momentumScore: 61, trend: "rising",
    metrics: { views: 1320, viewsGrowth: 31, saves: 67, savesGrowth: 42, boards: 12, boardsGrowth: 50, specs: 54, specsGrowth: 35, projectTags: 3, projectTagsGrowth: 50 },
    weeklyData: [{ day: "Mon", views: 140, saves: 6 }, { day: "Tue", views: 170, saves: 8 }, { day: "Wed", views: 200, saves: 11 }, { day: "Thu", views: 210, saves: 12 }, { day: "Fri", views: 230, saves: 13 }, { day: "Sat", views: 190, saves: 9 }, { day: "Sun", views: 180, saves: 8 }],
    taggedInProjects: ["proj-4"],
    savedByArchitects: ["arch-4", "arch-3"],
  },
  {
    productId: "prod-8", productName: "Wall Sconce — Halo", brand: "Flōra Lighting", brandId: "brand-2", image: prodImgFn(7),
    momentumScore: 54, trend: "steady",
    metrics: { views: 1180, viewsGrowth: 8, saves: 45, savesGrowth: 12, boards: 9, boardsGrowth: 12, specs: 41, specsGrowth: 10, projectTags: 3, projectTagsGrowth: 0 },
    weeklyData: [{ day: "Mon", views: 160, saves: 5 }, { day: "Tue", views: 165, saves: 6 }, { day: "Wed", views: 170, saves: 7 }, { day: "Thu", views: 175, saves: 7 }, { day: "Fri", views: 180, saves: 7 }, { day: "Sat", views: 170, saves: 7 }, { day: "Sun", views: 160, saves: 6 }],
    taggedInProjects: ["proj-2", "proj-6"],
    savedByArchitects: ["arch-2", "arch-6"],
  },
  {
    productId: "prod-11", productName: "Pergola Kit 4x3", brand: "TerraRange", brandId: "brand-6", image: prodImgFn(10),
    momentumScore: 47, trend: "cooling",
    metrics: { views: 890, viewsGrowth: -5, saves: 32, savesGrowth: -8, boards: 6, boardsGrowth: 0, specs: 29, specsGrowth: -3, projectTags: 2, projectTagsGrowth: 0 },
    weeklyData: [{ day: "Mon", views: 140, saves: 5 }, { day: "Tue", views: 135, saves: 5 }, { day: "Wed", views: 130, saves: 4 }, { day: "Thu", views: 125, saves: 4 }, { day: "Fri", views: 120, saves: 5 }, { day: "Sat", views: 120, saves: 5 }, { day: "Sun", views: 120, saves: 4 }],
    taggedInProjects: ["proj-3", "proj-5"],
    savedByArchitects: ["arch-3", "arch-5"],
  },
];

// ─── Product Influence Network ───────────────────────────────────────────────

export interface NetworkNode {
  id: string;
  label: string;
  type: "project" | "architect" | "product" | "board" | "brand";
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
  type: "tagged_in" | "saved_by" | "specified_in" | "supplied_by" | "created_by" | "enquired";
}

export const networkNodes: NetworkNode[] = [
  // Projects (top area)
  { id: "proj-1", label: "Coastal Retreat", type: "project", x: 200, y: 80, size: 36, color: "#0a0a0a" },
  { id: "proj-4", label: "Mountain House", type: "project", x: 520, y: 60, size: 32, color: "#0a0a0a" },
  { id: "proj-3", label: "Garden Pavilion", type: "project", x: 820, y: 90, size: 30, color: "#0a0a0a" },
  // Architects (left side)
  { id: "arch-1", label: "Elena Vasquez", type: "architect", x: 60, y: 260, size: 38, color: "#404040" },
  { id: "arch-4", label: "Marcus Reid", type: "architect", x: 80, y: 420, size: 34, color: "#404040" },
  { id: "arch-3", label: "Sophie Müller", type: "architect", x: 100, y: 560, size: 30, color: "#404040" },
  // Products (center)
  { id: "prod-2", label: "Pendant Light — Arc", type: "product", x: 380, y: 280, size: 42, color: "#737373" },
  { id: "prod-3", label: "Oak Panel", type: "product", x: 560, y: 340, size: 38, color: "#737373" },
  { id: "prod-5", label: "Standing Seam", type: "product", x: 440, y: 460, size: 30, color: "#737373" },
  { id: "prod-4", label: "Lounge Chair", type: "product", x: 700, y: 400, size: 28, color: "#737373" },
  { id: "prod-1", label: "Pull Handle", type: "product", x: 300, y: 440, size: 26, color: "#737373" },
  // Brands (right side)
  { id: "brand-2", label: "Flōra Lighting", type: "brand", x: 880, y: 260, size: 32, color: "#a3a3a3" },
  { id: "brand-3", label: "DuraLux", type: "brand", x: 900, y: 400, size: 30, color: "#a3a3a3" },
  { id: "brand-5", label: "CoverVault", type: "brand", x: 860, y: 530, size: 26, color: "#a3a3a3" },
  // Boards (bottom area)
  { id: "board-coastal", label: "Coastal Kitchen", type: "board", x: 220, y: 600, size: 22, color: "#d4d4d4" },
  { id: "board-mountain", label: "Mountain Ext.", type: "board", x: 500, y: 600, size: 22, color: "#d4d4d4" },
  { id: "board-garden", label: "Garden Living", type: "board", x: 740, y: 580, size: 22, color: "#d4d4d4" },
];

export const networkEdges: NetworkEdge[] = [
  // Architect → Product (saved)
  { source: "arch-1", target: "prod-2", strength: 0.9, type: "saved_by" },
  { source: "arch-1", target: "prod-3", strength: 0.8, type: "saved_by" },
  { source: "arch-1", target: "prod-1", strength: 0.7, type: "saved_by" },
  { source: "arch-4", target: "prod-5", strength: 0.85, type: "saved_by" },
  { source: "arch-4", target: "prod-2", strength: 0.6, type: "saved_by" },
  { source: "arch-3", target: "prod-4", strength: 0.8, type: "saved_by" },
  { source: "arch-3", target: "prod-3", strength: 0.5, type: "saved_by" },
  // Product → Project (tagged)
  { source: "prod-2", target: "proj-1", strength: 0.9, type: "tagged_in" },
  { source: "prod-2", target: "proj-4", strength: 0.7, type: "tagged_in" },
  { source: "prod-3", target: "proj-1", strength: 0.8, type: "tagged_in" },
  { source: "prod-5", target: "proj-4", strength: 0.85, type: "tagged_in" },
  { source: "prod-4", target: "proj-3", strength: 0.8, type: "tagged_in" },
  { source: "prod-1", target: "proj-1", strength: 0.6, type: "tagged_in" },
  // Product → Brand (supplied)
  { source: "prod-2", target: "brand-2", strength: 1, type: "supplied_by" },
  { source: "prod-3", target: "brand-3", strength: 1, type: "supplied_by" },
  { source: "prod-5", target: "brand-5", strength: 1, type: "supplied_by" },
  { source: "prod-4", target: "brand-3", strength: 0.5, type: "supplied_by" },
  // Product → Board (specified)
  { source: "prod-1", target: "board-coastal", strength: 0.7, type: "specified_in" },
  { source: "prod-2", target: "board-coastal", strength: 0.6, type: "specified_in" },
  { source: "prod-5", target: "board-mountain", strength: 0.8, type: "specified_in" },
  { source: "prod-4", target: "board-garden", strength: 0.7, type: "specified_in" },
  // Architect → Project (created)
  { source: "arch-1", target: "proj-1", strength: 1, type: "created_by" },
  { source: "arch-4", target: "proj-4", strength: 1, type: "created_by" },
  { source: "arch-3", target: "proj-3", strength: 1, type: "created_by" },
];

// ─── Design Boards ───────────────────────────────────────────────────────────

export interface DesignBoard {
  id: string;
  name: string;
  description: string;
  owner: { name: string; role: "architect" | "homeowner"; avatar: string };
  projectId?: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
  collaborators: { name: string; avatar: string }[];
  isPublic: boolean;
}

export const designBoards: DesignBoard[] = [
  {
    id: "board-1",
    name: "Coastal Retreat — Kitchen",
    description: "Material and product selections for the kitchen and scullery of the Piha coastal home.",
    owner: { name: "Elena Vasquez", role: "architect", avatar: architects[0].avatar },
    projectId: "proj-1",
    productIds: ["prod-1", "prod-3", "prod-7"],
    createdAt: "2024-10-15T09:00:00Z",
    updatedAt: "2024-12-18T14:30:00Z",
    collaborators: [{ name: "Sarah Mitchell", avatar: `https://placehold.co/40x40/e5e5e5/737373?text=SM` }],
    isPublic: true,
  },
  {
    id: "board-2",
    name: "Coastal Retreat — Living",
    description: "Lighting, furniture and surface products for the open-plan living and dining area.",
    owner: { name: "Elena Vasquez", role: "architect", avatar: architects[0].avatar },
    projectId: "proj-1",
    productIds: ["prod-2", "prod-3", "prod-4", "prod-6"],
    createdAt: "2024-10-15T09:30:00Z",
    updatedAt: "2024-12-20T11:15:00Z",
    collaborators: [{ name: "Sarah Mitchell", avatar: `https://placehold.co/40x40/e5e5e5/737373?text=SM` }],
    isPublic: true,
  },
  {
    id: "board-3",
    name: "Mountain House — Exterior",
    description: "Roofing, cladding and outdoor products for the Arrowtown alpine residence.",
    owner: { name: "Marcus Reid", role: "architect", avatar: architects[3].avatar },
    projectId: "proj-4",
    productIds: ["prod-5", "prod-6", "prod-12"],
    createdAt: "2024-11-02T10:00:00Z",
    updatedAt: "2024-12-19T16:45:00Z",
    collaborators: [],
    isPublic: true,
  },
  {
    id: "board-4",
    name: "Mountain House — Interior",
    description: "Furniture, lighting and surface selections for the double-height living spaces.",
    owner: { name: "Marcus Reid", role: "architect", avatar: architects[3].avatar },
    projectId: "proj-4",
    productIds: ["prod-2", "prod-10", "prod-3", "prod-8"],
    createdAt: "2024-11-02T10:30:00Z",
    updatedAt: "2024-12-21T09:00:00Z",
    collaborators: [{ name: "Tom Henderson", avatar: `https://placehold.co/40x40/e5e5e5/737373?text=TH` }],
    isPublic: false,
  },
  {
    id: "board-5",
    name: "Garden Pavilion — Living",
    description: "Products for the garden pavilion studio and guest suite addition.",
    owner: { name: "Sophie Müller", role: "architect", avatar: architects[2].avatar },
    projectId: "proj-3",
    productIds: ["prod-4", "prod-7", "prod-11", "prod-8"],
    createdAt: "2024-09-20T08:00:00Z",
    updatedAt: "2024-12-15T13:20:00Z",
    collaborators: [{ name: "Lucy Tan", avatar: `https://placehold.co/40x40/e5e5e5/737373?text=LT` }],
    isPublic: true,
  },
  {
    id: "board-6",
    name: "My Dream Kitchen",
    description: "Collecting ideas for our kitchen renovation — modern minimalist style.",
    owner: { name: "Rebecca Liu", role: "homeowner", avatar: `https://placehold.co/40x40/e5e5e5/737373?text=RL` },
    productIds: ["prod-1", "prod-7", "prod-2", "prod-9"],
    createdAt: "2024-12-01T15:00:00Z",
    updatedAt: "2024-12-22T10:30:00Z",
    collaborators: [],
    isPublic: false,
  },
];

// ─── Specifications ──────────────────────────────────────────────────────────

export interface SpecRoom {
  id: string;
  name: string;
  items: SpecItem[];
}

export interface SpecItem {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string;
  status: "specified" | "ordered" | "delivered" | "installed";
}

export interface Specification {
  id: string;
  projectId: string;
  projectName: string;
  architect: string;
  architectId: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "review" | "approved" | "final";
  rooms: SpecRoom[];
}

export const specifications: Specification[] = [
  {
    id: "spec-1",
    projectId: "proj-1",
    projectName: "Coastal Retreat",
    architect: "Elena Vasquez",
    architectId: "arch-1",
    createdAt: "2024-10-20T09:00:00Z",
    updatedAt: "2024-12-22T14:00:00Z",
    status: "review",
    rooms: [
      {
        id: "room-1",
        name: "Kitchen",
        items: [
          { productId: "prod-1", productName: "Matte Black Pull Handle", brand: "Akaroa Kitchens", category: "Hardware", quantity: 24, unit: "pcs", notes: "All cabinet and drawer handles", status: "ordered" },
          { productId: "prod-7", productName: "Island Benchtop 3m", brand: "Akaroa Kitchens", category: "Kitchen", quantity: 1, unit: "pc", notes: "3m island with waterfall edge", status: "specified" },
          { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", category: "Surfaces", quantity: 18, unit: "m²", notes: "Flooring — herringbone pattern", status: "ordered" },
        ],
      },
      {
        id: "room-2",
        name: "Living Room",
        items: [
          { productId: "prod-2", productName: "Pendant Light — Arc", brand: "Flōra Lighting", category: "Lighting", quantity: 3, unit: "pcs", notes: "Cluster above dining table", status: "delivered" },
          { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", category: "Surfaces", quantity: 42, unit: "m²", notes: "Continuous flooring from kitchen", status: "ordered" },
          { productId: "prod-4", productName: "Lounge Chair — Miro", brand: "Southmade Furniture", category: "Furniture", quantity: 2, unit: "pcs", notes: "Pair flanking fireplace", status: "specified" },
        ],
      },
      {
        id: "room-3",
        name: "Outdoor Deck",
        items: [
          { productId: "prod-6", productName: "Composite Deck Board", brand: "TerraRange", category: "Decking", quantity: 65, unit: "m", notes: "Wrap-around deck — charcoal", status: "installed" },
        ],
      },
    ],
  },
  {
    id: "spec-2",
    projectId: "proj-4",
    projectName: "Mountain House",
    architect: "Marcus Reid",
    architectId: "arch-4",
    createdAt: "2024-11-10T09:00:00Z",
    updatedAt: "2024-12-21T16:00:00Z",
    status: "draft",
    rooms: [
      {
        id: "room-4",
        name: "Great Room",
        items: [
          { productId: "prod-2", productName: "Pendant Light — Arc", brand: "Flōra Lighting", category: "Lighting", quantity: 5, unit: "pcs", notes: "Linear arrangement at 2.8m drop", status: "specified" },
          { productId: "prod-10", productName: "Dining Table — Niko", brand: "Southmade Furniture", category: "Furniture", quantity: 1, unit: "pc", notes: "2.4m version in walnut", status: "specified" },
          { productId: "prod-3", productName: "Engineered Oak Panel", brand: "DuraLux Surfaces", category: "Surfaces", quantity: 85, unit: "m²", notes: "Feature wall + flooring throughout", status: "specified" },
        ],
      },
      {
        id: "room-5",
        name: "Roof & Exterior",
        items: [
          { productId: "prod-5", productName: "Standing Seam Panel", brand: "CoverVault Roofing", category: "Roofing", quantity: 320, unit: "m²", notes: "Living roof sections + flat roof areas", status: "specified" },
          { productId: "prod-12", productName: "Flat Roof Membrane", brand: "CoverVault Roofing", category: "Roofing", quantity: 45, unit: "m²", notes: "Under living roof substrate", status: "specified" },
        ],
      },
    ],
  },
  {
    id: "spec-3",
    projectId: "proj-3",
    projectName: "Garden Pavilion",
    architect: "Sophie Müller",
    architectId: "arch-3",
    createdAt: "2024-09-25T09:00:00Z",
    updatedAt: "2024-12-18T11:00:00Z",
    status: "approved",
    rooms: [
      {
        id: "room-6",
        name: "Studio",
        items: [
          { productId: "prod-4", productName: "Lounge Chair — Miro", brand: "Southmade Furniture", category: "Furniture", quantity: 1, unit: "pc", notes: "Reading corner", status: "delivered" },
          { productId: "prod-8", productName: "Wall Sconce — Halo", brand: "Flōra Lighting", category: "Lighting", quantity: 4, unit: "pcs", notes: "Either side of windows", status: "installed" },
        ],
      },
      {
        id: "room-7",
        name: "Kitchen Nook",
        items: [
          { productId: "prod-7", productName: "Island Benchtop 3m", brand: "Akaroa Kitchens", category: "Kitchen", quantity: 1, unit: "pc", notes: "Compact 1.8m version", status: "installed" },
        ],
      },
      {
        id: "room-8",
        name: "Garden & Pergola",
        items: [
          { productId: "prod-11", productName: "Pergola Kit 4x3", brand: "TerraRange", category: "Outdoor", quantity: 1, unit: "pc", notes: "Connecting walkway cover", status: "installed" },
        ],
      },
    ],
  },
];
