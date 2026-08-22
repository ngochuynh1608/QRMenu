import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type LocaleText = { locale: string; name: string; description?: string };
type ItemSeed = {
  price: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  translations: LocaleText[];
};
type CategorySeed = {
  translations: { locale: string; name: string }[];
  items: ItemSeed[];
};
type VenueSeed = {
  slug: string;
  venueType: "qsr" | "hotel";
  phone?: string;
  address?: string;
  hours?: string;
  logoUrl?: string;
  coverUrl?: string;
  translations: LocaleText[];
  categories: CategorySeed[];
};

const IMG = {
  asian: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop&q=80",
  bikura: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop&q=80",
  beach: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop&q=80",
  spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=400&fit=crop&q=80",
  activities: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop&q=80",
  room: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop&q=80",
  event: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop&q=80",
  transport: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=400&fit=crop&q=80",
  reception: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop&q=80",
  food1: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  food2: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  drink1: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
  coffee: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
  spa1: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  activity1: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
};

const venues: VenueSeed[] = [
  {
    slug: "asian-restaurant",
    venueType: "qsr",
    phone: "+84 235 3838 888",
    address: "Khu ẩm thực chính, tầng 1",
    hours: "06:00 – 22:00",
    logoUrl: IMG.asian,
    coverUrl: IMG.asian,
    translations: [
      { locale: "vi", name: "ASIAN RESTAURANT", description: "Ẩm thực Á Đông — phục vụ nhanh." },
      { locale: "en", name: "ASIAN RESTAURANT", description: "Asian cuisine — quick service." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Món chính" },
          { locale: "en", name: "Mains" },
        ],
        items: [
          {
            price: 185000,
            isFeatured: true,
            imageUrl: IMG.food1,
            translations: [
              { locale: "vi", name: "Cơm gà xối mỡ", description: "Gà chiên, cơm, nước mắm gừng." },
              { locale: "en", name: "Crispy chicken rice", description: "Fried chicken, rice, ginger fish sauce." },
            ],
          },
          {
            price: 165000,
            imageUrl: IMG.food2,
            translations: [
              { locale: "vi", name: "Phở bò tái", description: "Nước dùng ninh xương, bò tái." },
              { locale: "en", name: "Rare beef pho", description: "Bone broth with rare beef." },
            ],
          },
        ],
      },
      {
        translations: [
          { locale: "vi", name: "Đồ uống" },
          { locale: "en", name: "Drinks" },
        ],
        items: [
          {
            price: 45000,
            imageUrl: IMG.drink1,
            translations: [
              { locale: "vi", name: "Trà đá chanh", description: "Trà sen, chanh tươi." },
              { locale: "en", name: "Iced lemon tea", description: "Lotus tea with fresh lemon." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "bikura-restaurant",
    venueType: "qsr",
    phone: "+84 235 3838 889",
    address: "Khu poolside",
    hours: "11:00 – 23:00",
    logoUrl: IMG.bikura,
    coverUrl: IMG.bikura,
    translations: [
      { locale: "vi", name: "BIKURA RESTAURANT", description: "Ẩm thực Nhật Bản & hải sản." },
      { locale: "en", name: "BIKURA RESTAURANT", description: "Japanese cuisine & seafood." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Sushi" },
          { locale: "en", name: "Sushi" },
        ],
        items: [
          {
            price: 289000,
            isFeatured: true,
            imageUrl: IMG.food2,
            translations: [
              { locale: "vi", name: "Sushi set A", description: "8 miếng sushi tổng hợp." },
              { locale: "en", name: "Sushi set A", description: "8-piece assorted sushi." },
            ],
          },
          {
            price: 199000,
            imageUrl: IMG.food1,
            translations: [
              { locale: "vi", name: "Salmon sashimi", description: "Cá hồi Nauy, 8 miếng." },
              { locale: "en", name: "Salmon sashimi", description: "Norwegian salmon, 8 pieces." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "beachside-bar-coffee",
    venueType: "qsr",
    phone: "+84 235 3838 890",
    address: "Bãi biển resort",
    hours: "07:00 – 00:00",
    logoUrl: IMG.beach,
    coverUrl: IMG.beach,
    translations: [
      { locale: "vi", name: "BEACHSIDE BAR & COFFEE", description: "Cà phê, cocktail ven biển." },
      { locale: "en", name: "BEACHSIDE BAR & COFFEE", description: "Coffee and cocktails by the beach." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Cà phê" },
          { locale: "en", name: "Coffee" },
        ],
        items: [
          {
            price: 55000,
            isFeatured: true,
            imageUrl: IMG.coffee,
            translations: [
              { locale: "vi", name: "Cà phê sữa đá", description: "Phin, sữa đặc, đá." },
              { locale: "en", name: "Iced milk coffee", description: "Vietnamese drip, condensed milk." },
            ],
          },
        ],
      },
      {
        translations: [
          { locale: "vi", name: "Cocktail" },
          { locale: "en", name: "Cocktails" },
        ],
        items: [
          {
            price: 165000,
            imageUrl: IMG.drink1,
            translations: [
              { locale: "vi", name: "Sunset mojito", description: "Rum, bạc hà, chanh, soda." },
              { locale: "en", name: "Sunset mojito", description: "Rum, mint, lime, soda." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "zen-spa",
    venueType: "qsr",
    phone: "+84 235 3838 891",
    address: "Tầng spa, villa 12",
    hours: "09:00 – 21:00",
    logoUrl: IMG.spa,
    coverUrl: IMG.spa,
    translations: [
      { locale: "vi", name: "ZEN SPA", description: "Massage & chăm sóc sức khỏe." },
      { locale: "en", name: "ZEN SPA", description: "Massage & wellness treatments." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Liệu trình" },
          { locale: "en", name: "Treatments" },
        ],
        items: [
          {
            price: 890000,
            isFeatured: true,
            imageUrl: IMG.spa1,
            translations: [
              { locale: "vi", name: "Massage thư giãn 60'", description: "Dầu thảo mộc, kỹ thuật Thái." },
              { locale: "en", name: "Relaxing massage 60'", description: "Herbal oil, Thai technique." },
            ],
          },
          {
            price: 1290000,
            imageUrl: IMG.spa1,
            translations: [
              { locale: "vi", name: "Gói couple spa", description: "Massage đôi + trà thảo mộc." },
              { locale: "en", name: "Couple spa package", description: "Duo massage + herbal tea." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "activities",
    venueType: "qsr",
    phone: "+84 235 3838 892",
    address: "Quầy hoạt động, sảnh chính",
    hours: "08:00 – 18:00",
    logoUrl: IMG.activities,
    coverUrl: IMG.activities,
    translations: [
      { locale: "vi", name: "ACTIVITIES", description: "Hoạt động giải trí & thể thao." },
      { locale: "en", name: "ACTIVITIES", description: "Leisure & sports activities." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Trải nghiệm" },
          { locale: "en", name: "Experiences" },
        ],
        items: [
          {
            price: 450000,
            isFeatured: true,
            imageUrl: IMG.activity1,
            translations: [
              { locale: "vi", name: "Tour lặn biển", description: "2 giờ, hướng dẫn viên kèm." },
              { locale: "en", name: "Snorkeling tour", description: "2 hours with guide." },
            ],
          },
          {
            price: 250000,
            imageUrl: IMG.activities,
            translations: [
              { locale: "vi", name: "Thuê kayak", description: "1 giờ / 2 người." },
              { locale: "en", name: "Kayak rental", description: "1 hour / 2 persons." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "room-service",
    venueType: "qsr",
    phone: "+84 235 3838 111",
    address: "Gọi nội bộ máy lẻ 0",
    hours: "24/7",
    logoUrl: IMG.room,
    coverUrl: IMG.room,
    translations: [
      { locale: "vi", name: "ROOM SERVICE", description: "Phục vụ tại phòng 24/7." },
      { locale: "en", name: "ROOM SERVICE", description: "In-room dining 24/7." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Ăn tại phòng" },
          { locale: "en", name: "In-room dining" },
        ],
        items: [
          {
            price: 220000,
            isFeatured: true,
            imageUrl: IMG.food1,
            translations: [
              { locale: "vi", name: "Club sandwich", description: "Gà, bacon, salad, khoai." },
              { locale: "en", name: "Club sandwich", description: "Chicken, bacon, salad, fries." },
            ],
          },
          {
            price: 95000,
            imageUrl: IMG.coffee,
            translations: [
              { locale: "vi", name: "Breakfast set", description: "Trứng, bánh mì, nước ép." },
              { locale: "en", name: "Breakfast set", description: "Eggs, toast, juice." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "event",
    venueType: "hotel",
    phone: "+84 235 3838 200",
    address: "Banquet hall",
    hours: "Theo lịch đặt",
    logoUrl: IMG.event,
    coverUrl: IMG.event,
    translations: [
      { locale: "vi", name: "EVENT", description: "Sự kiện, hội nghị, tiệc cưới." },
      { locale: "en", name: "EVENT", description: "Events, conferences, weddings." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Gói sự kiện" },
          { locale: "en", name: "Event packages" },
        ],
        items: [
          {
            price: 5000000,
            isFeatured: true,
            imageUrl: IMG.event,
            translations: [
              { locale: "vi", name: "Meeting half-day", description: "Phòng họp, trà cà phê, AV." },
              { locale: "en", name: "Meeting half-day", description: "Meeting room, coffee break, AV." },
            ],
          },
          {
            price: 15000000,
            imageUrl: IMG.event,
            translations: [
              { locale: "vi", name: "Wedding reception", description: "Sảnh tiệc, trang trí cơ bản." },
              { locale: "en", name: "Wedding reception", description: "Ballroom with basic décor." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "transportation-services",
    venueType: "hotel",
    phone: "+84 235 3838 300",
    address: "Quầy concierge",
    hours: "05:00 – 23:00",
    logoUrl: IMG.transport,
    coverUrl: IMG.transport,
    translations: [
      { locale: "vi", name: "TRANSPORTATION SERVICES", description: "Đưa đón sân bay & thuê xe." },
      { locale: "en", name: "TRANSPORTATION SERVICES", description: "Airport transfer & car rental." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Đưa đón" },
          { locale: "en", name: "Transfers" },
        ],
        items: [
          {
            price: 850000,
            isFeatured: true,
            imageUrl: IMG.transport,
            translations: [
              { locale: "vi", name: "Airport transfer (sedan)", description: "1 chiều, tối đa 3 khách." },
              { locale: "en", name: "Airport transfer (sedan)", description: "One way, up to 3 guests." },
            ],
          },
          {
            price: 1200000,
            imageUrl: IMG.transport,
            translations: [
              { locale: "vi", name: "Airport transfer (van)", description: "1 chiều, tối đa 7 khách." },
              { locale: "en", name: "Airport transfer (van)", description: "One way, up to 7 guests." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "reception-front-office",
    venueType: "hotel",
    phone: "+84 235 3838 000",
    address: "Sảnh chính",
    hours: "24/7",
    logoUrl: IMG.reception,
    coverUrl: IMG.reception,
    translations: [
      { locale: "vi", name: "RECEPTION - FRONT OFFICE", description: "Lễ tân & hỗ trợ khách 24/7." },
      { locale: "en", name: "RECEPTION - FRONT OFFICE", description: "Front desk & guest support 24/7." },
    ],
    categories: [
      {
        translations: [
          { locale: "vi", name: "Dịch vụ" },
          { locale: "en", name: "Services" },
        ],
        items: [
          {
            price: 0,
            isFeatured: true,
            imageUrl: IMG.reception,
            translations: [
              { locale: "vi", name: "Hỗ trợ check-in / check-out", description: "Liên hệ lễ tân để được hỗ trợ." },
              { locale: "en", name: "Check-in / check-out support", description: "Contact front desk for assistance." },
            ],
          },
          {
            price: 0,
            imageUrl: IMG.reception,
            translations: [
              { locale: "vi", name: "Đổi tiền & thông tin tour", description: "Hỏi tại quầy lễ tân." },
              { locale: "en", name: "Currency & tour info", description: "Ask at the front desk." },
            ],
          },
        ],
      },
    ],
  },
];

async function seedVenue(venue: VenueSeed, sortOrder: number) {
  const restaurant = await prisma.restaurant.create({
    data: {
      slug: venue.slug,
      venueType: venue.venueType,
      phone: venue.phone ?? null,
      address: venue.address ?? null,
      hours: venue.hours ?? null,
      logoUrl: venue.logoUrl ?? null,
      coverUrl: venue.coverUrl ?? null,
      currency: "VND",
      defaultLang: "en",
      isActive: true,
      sortOrder,
      translations: {
        create: venue.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description ?? null,
        })),
      },
    },
  });

  for (let c = 0; c < venue.categories.length; c++) {
    const cat = venue.categories[c];
    const category = await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        sortOrder: c,
        translations: {
          create: cat.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
          })),
        },
      },
    });

    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i];
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          price: item.price,
          imageUrl: item.imageUrl ?? null,
          isFeatured: item.isFeatured ?? false,
          isAvailable: item.isAvailable ?? true,
          sortOrder: i,
          translations: {
            create: item.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              description: t.description ?? null,
            })),
          },
        },
      });
    }
  }
}

async function main() {
  await prisma.menuItemTranslation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurantTranslation.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.adSlide.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.language.deleteMany();
  await prisma.adminUser.deleteMany();

  await prisma.adminUser.create({
    data: {
      username: "admin",
      email: "admin@qrmenu.local",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
    },
  });

  await prisma.language.createMany({
    data: [
      { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", isEnabled: true, sortOrder: 0 },
      { code: "en", name: "English", nativeName: "English", isEnabled: true, sortOrder: 1 },
      { code: "ja", name: "Japanese", nativeName: "日本語", isEnabled: true, sortOrder: 2 },
      { code: "ko", name: "Korean", nativeName: "한국어", isEnabled: true, sortOrder: 3 },
      { code: "zh", name: "Chinese", nativeName: "中文", isEnabled: false, sortOrder: 4 },
    ],
  });

  await prisma.siteSettings.create({
    data: {
      id: "default",
      siteName: "QRMenu",
      primaryColor: "#DC2626",
      secondaryColor: "#F87171",
      ctaColor: "#CA8A04",
      backgroundColor: "#FEF2F2",
      textColor: "#450A0A",
      adsEnabled: false,
      adsIdleSeconds: 10,
      adsSlideSeconds: 8,
      displayLang: "vi",
      translateLang: "vi",
    },
  });

  for (const [index, venue] of venues.entries()) {
    await seedVenue(venue, index);
  }

  console.log("Seeded: admin / admin123 (hoặc admin@qrmenu.local)");
  console.log(`Restaurants: ${venues.map((v) => v.slug).join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
