export interface Architect {
  id: string;
  name: string;
  firm: string;
  location: string;
  avatar: string;
  coverImage: string;
  bio: string;
  projectCount: number;
  specialties: string[];
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  logo: string;
  coverImage: string;
  description: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  category: string;
  image: string;
  price: string;
  specSheet: boolean;
}

export interface Project {
  id: string;
  title: string;
  architect: string;
  architectId: string;
  location: string;
  year: number;
  images: string[];
  description: string;
  tags: string[];
  products: string[];
}

export interface AnalyticsData {
  views: number;
  specDownloads: number;
  engagement: number;
  viewsChange: number;
  downloadsChange: number;
  engagementChange: number;
  monthlyViews: { month: string; value: number }[];
  topProjects: { name: string; views: number }[];
  topProducts: { name: string; downloads: number }[];
}

// Placeholder image generators using solid color blocks
const img = (w: number, h: number, seed: number) => {
  const hues = [0, 30, 60, 120, 200, 220, 260, 300, 340];
  const hue = hues[seed % hues.length];
  return `https://placehold.co/${w}x${h}/${hue === 0 ? "1a1a1a" : `hsl(${hue},20,85)`.replace(/[(),%\s]/g, "")}/333?text=+`;
};

const archImg = (i: number) =>
  `https://placehold.co/400x400/e5e5e5/737373?text=Architect+${i + 1}`;
const projImg = (i: number, j: number) =>
  `https://placehold.co/800x600/${["f5f5f5", "e5e5e5", "d4d4d4", "fafafa"][j % 4]}/737373?text=Project+${i + 1}`;
const prodImg = (i: number) =>
  `https://placehold.co/400x400/fafafa/737373?text=Product+${i + 1}`;
const brandImg = (i: number) =>
  `https://placehold.co/200x200/0a0a0a/ffffff?text=${["AK", "FL", "DL", "SM", "CV", "TR", "BN", "MX"][i % 8]}`;
const brandCover = (i: number) =>
  `https://placehold.co/800x400/${["f5f5f5", "e8e8e8", "ebebeb", "f0f0f0"][i % 4]}/737373?text=Brand+${i + 1}`;

export const architects: Architect[] = [
  {
    id: "arch-1",
    name: "Elena Vasquez",
    firm: "Vasquez Studio",
    location: "Auckland, NZ",
    avatar: archImg(0),
    coverImage: projImg(0, 0),
    bio: "Award-winning architect specialising in sustainable residential design with a focus on natural materials and indoor-outdoor flow.",
    projectCount: 12,
    specialties: ["Residential", "Sustainable", "Interior"],
  },
  {
    id: "arch-2",
    name: "James Chen",
    firm: "Chen & Associates",
    location: "Wellington, NZ",
    avatar: archImg(1),
    coverImage: projImg(1, 1),
    bio: "Commercial and hospitality architect known for bold geometric forms and innovative use of light.",
    projectCount: 8,
    specialties: ["Commercial", "Hospitality", "Urban"],
  },
  {
    id: "arch-3",
    name: "Sophie Müller",
    firm: "Müller Atelier",
    location: "Christchurch, NZ",
    avatar: archImg(2),
    coverImage: projImg(2, 2),
    bio: "Heritage restoration specialist with a passion for blending historic architecture with contemporary living.",
    projectCount: 15,
    specialties: ["Heritage", "Residential", "Restoration"],
  },
  {
    id: "arch-4",
    name: "Marcus Reid",
    firm: "Reid Architecture",
    location: "Queenstown, NZ",
    avatar: archImg(3),
    coverImage: projImg(3, 3),
    bio: "Luxury residential architect creating homes that respond to New Zealand's dramatic landscapes.",
    projectCount: 10,
    specialties: ["Luxury", "Residential", "Landscape"],
  },
  {
    id: "arch-5",
    name: "Aroha Tane",
    firm: "Tane Design Collective",
    location: "Tauranga, NZ",
    avatar: archImg(4),
    coverImage: projImg(4, 0),
    bio: "Community-focused architect integrating Māori design principles with modern sustainable architecture.",
    projectCount: 7,
    specialties: ["Community", "Cultural", "Sustainable"],
  },
  {
    id: "arch-6",
    name: "Oliver Park",
    firm: "Park Studio",
    location: "Hamilton, NZ",
    avatar: archImg(5),
    coverImage: projImg(5, 1),
    bio: "Minimalist architect focused on compact urban living solutions and prefabricated construction methods.",
    projectCount: 9,
    specialties: ["Minimalist", "Urban", "Prefab"],
  },
];

export const brands: Brand[] = [
  {
    id: "brand-1",
    name: "Akaroa Kitchens",
    category: "Kitchen & Bath",
    logo: brandImg(0),
    coverImage: brandCover(0),
    description: "Premium kitchen systems and cabinetry crafted in New Zealand.",
    productCount: 45,
  },
  {
    id: "brand-2",
    name: "Flōra Lighting",
    category: "Lighting",
    logo: brandImg(1),
    coverImage: brandCover(1),
    description: "Architectural lighting designed for residential and hospitality spaces.",
    productCount: 62,
  },
  {
    id: "brand-3",
    name: "DuraLux Surfaces",
    category: "Surfaces",
    logo: brandImg(2),
    coverImage: brandCover(2),
    description: "Engineered stone, timber, and composite surface solutions.",
    productCount: 38,
  },
  {
    id: "brand-4",
    name: "Southmade Furniture",
    category: "Furniture",
    logo: brandImg(3),
    coverImage: brandCover(3),
    description: "Handcrafted contemporary furniture from sustainably sourced timber.",
    productCount: 29,
  },
  {
    id: "brand-5",
    name: "CoverVault Roofing",
    category: "Roofing & Cladding",
    logo: brandImg(4),
    coverImage: brandCover(4),
    description: "Innovative roofing and cladding systems for modern architecture.",
    productCount: 21,
  },
  {
    id: "brand-6",
    name: "TerraRange",
    category: "Outdoor & Landscape",
    logo: brandImg(5),
    coverImage: brandCover(5),
    description: "Outdoor living products including decking, pergolas, and landscape elements.",
    productCount: 34,
  },
];

export const products: Product[] = [
  { id: "prod-1", name: "Matte Black Pull Handle", brand: "Akaroa Kitchens", brandId: "brand-1", category: "Hardware", image: prodImg(0), price: "$48", specSheet: true },
  { id: "prod-2", name: "Pendant Light — Arc", brand: "Flōra Lighting", brandId: "brand-2", category: "Lighting", image: prodImg(1), price: "$320", specSheet: true },
  { id: "prod-3", name: "Engineered Oak Panel", brand: "DuraLux Surfaces", brandId: "brand-3", category: "Surfaces", image: prodImg(2), price: "$185/m²", specSheet: true },
  { id: "prod-4", name: "Lounge Chair — Miro", brand: "Southmade Furniture", brandId: "brand-4", category: "Furniture", image: prodImg(3), price: "$1,290", specSheet: true },
  { id: "prod-5", name: "Standing Seam Panel", brand: "CoverVault Roofing", brandId: "brand-5", category: "Roofing", image: prodImg(4), price: "$95/m²", specSheet: true },
  { id: "prod-6", name: "Composite Deck Board", brand: "TerraRange", brandId: "brand-6", category: "Decking", image: prodImg(5), price: "$72/m", specSheet: true },
  { id: "prod-7", name: "Island Benchtop 3m", brand: "Akaroa Kitchens", brandId: "brand-1", category: "Kitchen", image: prodImg(6), price: "$2,400", specSheet: true },
  { id: "prod-8", name: "Wall Sconce — Halo", brand: "Flōra Lighting", brandId: "brand-2", category: "Lighting", image: prodImg(7), price: "$210", specSheet: true },
  { id: "prod-9", name: "Concrete Look Tile", brand: "DuraLux Surfaces", brandId: "brand-3", category: "Surfaces", image: prodImg(8), price: "$120/m²", specSheet: false },
  { id: "prod-10", name: "Dining Table — Niko", brand: "Southmade Furniture", brandId: "brand-4", category: "Furniture", image: prodImg(9), price: "$2,800", specSheet: true },
  { id: "prod-11", name: "Pergola Kit 4x3", brand: "TerraRange", brandId: "brand-6", category: "Outdoor", image: prodImg(10), price: "$4,500", specSheet: true },
  { id: "prod-12", name: "Flat Roof Membrane", brand: "CoverVault Roofing", brandId: "brand-5", category: "Roofing", image: prodImg(11), price: "$65/m²", specSheet: true },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    title: "Coastal Retreat",
    architect: "Elena Vasquez",
    architectId: "arch-1",
    location: "Piha, Auckland",
    year: 2024,
    images: [projImg(0, 0), projImg(0, 1), projImg(0, 2), projImg(0, 3)],
    description: "A 280m² beachside home designed to frame ocean views through floor-to-ceiling glazing. Rammed earth walls and recycled timber create a warm, grounded aesthetic that contrasts with the wild coastal landscape.",
    tags: ["Residential", "Coastal", "Sustainable"],
    products: ["prod-1", "prod-2", "prod-3", "prod-6"],
  },
  {
    id: "proj-2",
    title: "Urban Loft Conversion",
    architect: "James Chen",
    architectId: "arch-2",
    location: "Te Aro, Wellington",
    year: 2024,
    images: [projImg(1, 0), projImg(1, 1), projImg(1, 2)],
    description: "A heritage warehouse transformed into a mixed-use development with six loft apartments and ground-floor retail. Exposed steel structure and polished concrete celebrate the building's industrial past.",
    tags: ["Commercial", "Heritage", "Urban"],
    products: ["prod-3", "prod-8", "prod-9"],
  },
  {
    id: "proj-3",
    title: "Garden Pavilion",
    architect: "Sophie Müller",
    architectId: "arch-3",
    location: "Merivale, Christchurch",
    year: 2023,
    images: [projImg(2, 0), projImg(2, 1), projImg(2, 2), projImg(2, 3)],
    description: "An addition to a 1920s bungalow — a freestanding garden pavilion that serves as a studio, guest suite, and indoor-outdoor entertaining space connected by a covered walkway.",
    tags: ["Residential", "Heritage", "Garden"],
    products: ["prod-4", "prod-7", "prod-11"],
  },
  {
    id: "proj-4",
    title: "Mountain House",
    architect: "Marcus Reid",
    architectId: "arch-4",
    location: "Arrowtown, Queenstown",
    year: 2024,
    images: [projImg(3, 0), projImg(3, 1), projImg(3, 2)],
    description: "A 450m² luxury residence nestled into the hillside with a living roof that mirrors the surrounding tussock landscape. Double-height spaces and schist stone walls anchor the home to its alpine setting.",
    tags: ["Luxury", "Residential", "Alpine"],
    products: ["prod-2", "prod-5", "prod-10"],
  },
  {
    id: "proj-5",
    title: "Community Centre",
    architect: "Aroha Tane",
    architectId: "arch-5",
    location: "Mount Maunganui, Tauranga",
    year: 2023,
    images: [projImg(4, 0), projImg(4, 1), projImg(4, 2)],
    description: "A multi-purpose community hub designed with local iwi, featuring traditional carving integrated with contemporary timber construction. The building opens to a central courtyard for gatherings.",
    tags: ["Community", "Cultural", "Public"],
    products: ["prod-3", "prod-6", "prod-11"],
  },
  {
    id: "proj-6",
    title: "Compact Urban House",
    architect: "Oliver Park",
    architectId: "arch-6",
    location: "Grey Lynn, Auckland",
    year: 2024,
    images: [projImg(5, 0), projImg(5, 1), projImg(5, 2), projImg(5, 3)],
    description: "A 120m² infill home on a narrow site that maximises space through split levels, built-in furniture, and a rooftop terrace. Prefabricated panels reduced construction time to 12 weeks.",
    tags: ["Residential", "Urban", "Compact"],
    products: ["prod-1", "prod-8", "prod-9", "prod-12"],
  },
];

export const analyticsData: AnalyticsData = {
  views: 24830,
  specDownloads: 1247,
  engagement: 68.4,
  viewsChange: 12.3,
  downloadsChange: 8.7,
  engagementChange: -2.1,
  monthlyViews: [
    { month: "Jul", value: 3200 },
    { month: "Aug", value: 3800 },
    { month: "Sep", value: 3100 },
    { month: "Oct", value: 4200 },
    { month: "Nov", value: 4800 },
    { month: "Dec", value: 5730 },
  ],
  topProjects: [
    { name: "Coastal Retreat", views: 4820 },
    { name: "Mountain House", views: 3910 },
    { name: "Garden Pavilion", views: 3400 },
    { name: "Urban Loft Conversion", views: 2890 },
    { name: "Compact Urban House", views: 2340 },
  ],
  topProducts: [
    { name: "Pendant Light — Arc", downloads: 312 },
    { name: "Engineered Oak Panel", downloads: 245 },
    { name: "Lounge Chair — Miro", downloads: 198 },
    { name: "Matte Black Pull Handle", downloads: 167 },
    { name: "Standing Seam Panel", downloads: 142 },
  ],
};

export const briefQuestions = [
  {
    id: "q1",
    question: "What type of project are you planning?",
    options: ["New build", "Renovation", "Extension", "Interior refresh", "Landscape"],
  },
  {
    id: "q2",
    question: "What is your estimated budget range?",
    options: ["Under $200k", "$200k – $500k", "$500k – $1M", "$1M – $2M", "$2M+"],
  },
  {
    id: "q3",
    question: "How would you describe your style?",
    options: ["Minimalist", "Contemporary", "Heritage", "Industrial", "Coastal", "Rustic"],
  },
  {
    id: "q4",
    question: "How many bedrooms do you need?",
    options: ["1–2", "3", "4", "5+"],
  },
  {
    id: "q5",
    question: "Which features are most important to you?",
    options: ["Indoor-outdoor flow", "Natural light", "Storage", "Entertaining", "Home office", "Sustainability"],
  },
  {
    id: "q6",
    question: "Where is your project located?",
    options: ["Urban", "Suburban", "Rural", "Coastal"],
  },
];
