export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  compare_at_price?: number;
  slug: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category_slug: string;
  image_url: string;
  images: string[];
  materials: string[];
  dimensions_ar: string;
  dimensions_en: string;
  weight_kg: number;
  handmade_time_days: number;
  stock: number;
  is_featured: boolean;
  tags: string[];
  rating: number;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string;
  is_featured: boolean;
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-candles",
    slug: "candles",
    name_ar: "الشموع العطرية الفاخرة",
    name_en: "Artisanal Candles",
    image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    is_featured: true
  },
  {
    id: "cat-ceramics",
    slug: "ceramics",
    name_ar: "الخزف والفخار اليدوي",
    name_en: "Artisan Ceramics",
    image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600",
    is_featured: true
  },
  {
    id: "cat-textiles",
    slug: "textiles",
    name_ar: "المنسوجات والتطريز اليدوي",
    name_en: "Embroidery & Textiles",
    image_url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=600",
    is_featured: true
  },
  {
    id: "cat-wood",
    slug: "woodwork",
    name_ar: "الديكورات الخشبية الفنية",
    name_en: "Artisanal Woodwork",
    image_url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600",
    is_featured: true
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name_ar: "شمعة اللافندر والبرغموت في كوب فخاري",
    name_en: "Lavender & Bergamot Clay Candle",
    description_ar: "شمعة معطرة مصنوعة يدويًا بنسبة 100% من شمع الصويا الطبيعي، مصبوبة بعناية في كوب فخاري تم تشكيله وتلوينه يدويًا. تمنحك رائحة اللافندر المهدئة والبرغموت المنعش أجواء من الراحة التامة.",
    description_en: "A 100% natural soy wax scented candle, hand-poured into a custom handmade ceramic vessel. Infused with soothing lavender and refreshing bergamot essential oils.",
    price: 45.00,
    compare_at_price: 60.00,
    slug: "lavender-bergamot-clay-candle",
    sku: "HM-CAN-01",
    barcode: "8801928374",
    category_id: "cat-candles",
    category_slug: "candles",
    image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596435764253-6160e1f720c9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["شمع الصويا الطبيعي", "زيوت عطرية نقية", "وعاء طين فخاري"],
    dimensions_ar: "ارتفاع 8 سم، قطر 7 سم",
    dimensions_en: "8cm Height, 7cm Diameter",
    weight_kg: 0.350,
    handmade_time_days: 2,
    stock: 15,
    is_featured: true,
    tags: ["شمع", "لافندر", "فخار", "ديكور"],
    rating: 4.8
  },
  {
    id: "prod-2",
    name_ar: "مزهرية ريفية مطلية يدوياً",
    name_en: "Rustic Hand-Painted Vase",
    description_ar: "مزهرية من الطين الطبيعي المجفف بالفرن، تم تشكيلها على عجلة الفخار التقليدية ومطلية يدويًا بزخارف مستوحاة من الطبيعة. كل قطعة فريدة ولا يمكن مطابقتها تمامًا.",
    description_en: "Kiln-fired terracotta clay vase, crafted on a traditional pottery wheel and decorated with organic glaze patterns. Each vase is uniquely styled.",
    price: 95.00,
    slug: "rustic-hand-painted-vase",
    sku: "HM-POT-02",
    category_id: "cat-ceramics",
    category_slug: "ceramics",
    image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["طين أحمر طبيعي", "طلاء زجاجي صديق للبيئة"],
    dimensions_ar: "ارتفاع 22 سم، عرض الفوهة 6 سم",
    dimensions_en: "22cm Height, 6cm Rim Diameter",
    weight_kg: 1.200,
    handmade_time_days: 5,
    stock: 8,
    is_featured: true,
    tags: ["مزهرية", "خزف", "طين", "فن"],
    rating: 5.0
  },
  {
    id: "prod-3",
    name_ar: "وسادة كتان مطرزة بخيوط الحرير",
    name_en: "Silk-Embroidered Linen Cushion",
    description_ar: "وسادة من الكتان العضوي النقي مطرزة يدوياً بالكامل بنقوش زهرية معقدة باستخدام خيوط الحرير الناعمة. تستغرق حياكة هذه القطعة ما يزيد عن 20 ساعة عمل مستمر.",
    description_en: "Organic premium linen cushion cover, hand-embroidered with detailed floral motifs using fine silk threads. Requires over 20 hours of delicate craftwork.",
    price: 65.00,
    compare_at_price: 80.00,
    slug: "silk-embroidered-linen-cushion",
    sku: "HM-TEX-03",
    category_id: "cat-textiles",
    category_slug: "textiles",
    image_url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["كتان بلجيكي طبيعي", "خيوط حريرية ملونة"],
    dimensions_ar: "45 * 45 سم",
    dimensions_en: "45 x 45 cm",
    weight_kg: 0.250,
    handmade_time_days: 4,
    stock: 4,
    is_featured: true,
    tags: ["وسادة", "تطريز", "كتان", "حرير"],
    rating: 4.6
  },
  {
    id: "prod-4",
    name_ar: "صينية تقديم من خشب الزيتون الطبيعي",
    name_en: "Olive Wood Serving Platter",
    description_ar: "صينية تقديم مميزة مقطوعة ومعالجة يدويًا من جذوع خشب الزيتون المعمر. تبرز عروق الخشب الطبيعية المتعرجة تفاصيل عتيقة ودافئة لتقديم الأجبان والمقبلات الفاخرة.",
    description_en: "Serving board cut and treated by hand from solid olive wood stumps. Showcases organic wavy grains, ideal for luxury cheese and charcuterie presentations.",
    price: 110.00,
    slug: "olive-wood-serving-platter",
    sku: "HM-WOD-04",
    category_id: "cat-wood",
    category_slug: "woodwork",
    image_url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["خشب زيتون صلب", "زيوت تلميع طبيعية آمنة للأطعمة"],
    dimensions_ar: "طول 40 سم، عرض 20 سم، سمك 2 سم",
    dimensions_en: "40cm Length, 20cm Width, 2cm Thickness",
    weight_kg: 1.500,
    handmade_time_days: 3,
    stock: 12,
    is_featured: false,
    tags: ["صينية", "خشب", "مطبخ", "تقديم"],
    rating: 4.9
  },
  {
    id: "prod-5",
    name_ar: "فنجان قهوة إسبريسو سيراميك منقوش",
    name_en: "Carved Ceramic Espresso Cup",
    description_ar: "فنجان قهوة صغير ومميز لجرعة الإسبريسو الصباحية، مصنوع يدويًا بالكامل من الفخار المطلي بطبقة زجاجية بيضاء مع قاعدة طينية مكشوفة منقوشة باليد.",
    description_en: "Cozy handmade espresso mug, wheel-thrown and dipped in white matte glaze, featuring an organic hand-carved exposed raw clay base.",
    price: 22.00,
    slug: "carved-ceramic-espresso-cup",
    sku: "HM-POT-05",
    category_id: "cat-ceramics",
    category_slug: "ceramics",
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["طين أبيض ناعم", "طلاء زجاجي مطفي"],
    dimensions_ar: "ارتفاع 6 سم، سعة 80 مل",
    dimensions_en: "6cm Height, 80ml Capacity",
    weight_kg: 0.180,
    handmade_time_days: 2,
    stock: 25,
    is_featured: false,
    tags: ["كوب", "سيراميك", "قهوة", "إسبريسو"],
    rating: 4.7
  },
  {
    id: "prod-6",
    name_ar: "شمعة القرفة والبرتقال الدافئة",
    name_en: "Spiced Cinnamon & Orange Candle",
    description_ar: "شمعة معطرة بنكهات شتوية دافئة تجمع بين القرفة الحارة وقشر البرتقال المجفف. صُبت يدوياً في وعاء زجاجي داكن مع فتيل خشبي يصدر صوت طقطقة هادئة تشبه الموقد.",
    description_en: "Spiced seasonal candle featuring natural cinnamon bark and sweet orange notes, hand-poured in an amber jar with a crackling wooden wick.",
    price: 38.00,
    compare_at_price: 45.00,
    slug: "spiced-cinnamon-orange-candle",
    sku: "HM-CAN-06",
    category_id: "cat-candles",
    category_slug: "candles",
    image_url: "https://images.unsplash.com/photo-1570837124647-a3131377f66a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1570837124647-a3131377f66a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596435764253-6160e1f720c9?auto=format&fit=crop&q=80&w=800"
    ],
    materials: ["شمع الصويا العضوي", "زيوت عطرية", "فتيل خشبي طبيعي"],
    dimensions_ar: "ارتفاع 9 سم، قطر 7.5 سم",
    dimensions_en: "9cm Height, 7.5cm Diameter",
    weight_kg: 0.400,
    handmade_time_days: 1,
    stock: 0, // Out of stock to test filter
    is_featured: false,
    tags: ["شمعة", "برتقال", "قرفة", "دفء"],
    rating: 4.5
  }
];

export const MOCK_HERO_BANNERS = [
  {
    id: "banner-1",
    image_url_ar: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1920",
    image_url_en: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1920",
    title_ar: "أصالة الصناعة اليدوية للمنازل العصرية",
    title_en: "Artisanal Craftsmanship for Modern Homes",
    subtitle_ar: "قطع فنية مصنوعة يدوياً تعكس دفء الطبيعة وشغف الصناع المبدعين",
    subtitle_en: "Exquisite hand-carved details and natural materials crafted by master creators.",
    link_url: "/shop"
  }
];
