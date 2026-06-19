export const defaultBannerSlides = [
  {
    title: 'Yaz Kampanyası %30 İndirim',
    subtitle: 'Yeni üyelik fırsatlarını kaçırma',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80'
  },
  {
    title: 'Yeni Pilates Grubu Başlıyor',
    subtitle: 'Esneklik ve dengeyi birlikte güçlendir',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80'
  },
  {
    title: 'Premium PT Deneyimi',
    subtitle: 'Kişisel plan, ölçüm ve takip desteği',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80'
  }
];

export const defaultContent = {
  brand: {
    name: 'PEAKSPORTS CENTER',
    shortName: 'PEAKSPORTS',
    slogan: 'Kocaeli Premium Fitness Merkezi',
    logoMark: '▲',
    logoUrl: '/logo-circle.png?v=6'
  },
  hero: {
    title: 'HEDEFİNE ULAŞ\nZİRVEYİ YAŞA!',
    subtitle: 'Profesyonel ekipmanlar, uzman eğitmenler ve modern tesislerle hedeflerine ulaş.',
    primaryCta: 'ÜYE OL',
    secondaryCta: 'SALONU KEŞFET',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80'
  },
  bannerSlides: defaultBannerSlides,
  whatsapp: {
    number: '+905555555555',
    text: 'Merhaba, PEAKSPOR hakkında bilgi almak istiyorum.',
    label: 'WhatsApp'
  },
  seo: {
    title: 'PEAKSPORTS CENTER | Kocaeli Fitness ve Spor Salonu',
    description: 'Kocaeli\'nin premium fitness ve spor merkezi PEAKSPORTS CENTER. Kişisel antrenman, pilates, crossfit, grup dersleri ve üyelik paketleri. Türkiye\'nin modern spor salonu deneyimi.',
    keywords: 'kocaeli spor salonu, kocaeli fitness, peak spor center, türkiye fitness, gym kocaeli, fitness merkezi kocaeli, personal training, pilates kocaeli, crossfit kocaeli, spor merkezi türkiye',
    siteUrl: '',
    city: 'Kocaeli',
    region: 'Kocaeli',
    country: 'TR',
    countryName: 'Türkiye',
    socialLinks: []
  },
  theme: {
    monochrome: true,
    primary: '#FFFFFF',
    secondary: '#E5E5E5',
    accentLight: '#FFFFFF',
    background: '#000000',
    surface: '#0A0A0A',
    panel: '#141414',
    text: '#FFFFFF',
    muted: '#B3B3B3'
  },
  assistant: {
    welcome: 'PEAKSPOR AI Asistan',
    message: 'Merhaba, ben PEAKSPOR yapay zeka asistanıyım. Size nasıl yardımcı olabilirim?',
    buttons: ['Üyelik Bilgileri', 'Paket Fiyatları', 'Ders Programları', 'Kampanyalar', 'WhatsApp Destek']
  },
  stats: [
    { id: 'stat-1', label: 'Aktif Üye', value: '5.000+', icon: 'users', accentColor: '', bgColor: '', valueColor: '', labelColor: '', visible: true },
    { id: 'stat-2', label: 'Uzman Eğitmen', value: '25', icon: 'coach', accentColor: '', bgColor: '', valueColor: '', labelColor: '', visible: true },
    { id: 'stat-3', label: 'Grup Dersi', value: '100+', icon: 'class', accentColor: '', bgColor: '', valueColor: '', labelColor: '', visible: true },
    { id: 'stat-4', label: 'Yıllık Deneyim', value: '10+', icon: 'years', accentColor: '', bgColor: '', valueColor: '', labelColor: '', visible: true }
  ],
  homeCards: {
    selectedService: {
      visible: true,
      label: 'Seçili Hizmet',
      buttonText: 'Paketleri Gör',
      accent: '',
      background: '',
      text: '',
      muted: ''
    },
    selectedPackage: {
      visible: true,
      label: 'Seçili Paket',
      accent: '',
      background: '',
      text: '',
      muted: '',
      showPrice: true
    },
    heroFloating: {
      visible: true,
      statIndex: 0
    }
  },
  admin: {
    email: 'admin@peakspor.com',
    password: 'Admin1234!'
  }
};

export const defaultServices = [
  {
    title: 'Fitness',
    category: 'Salon',
    description: 'Kardiyo, ağırlık ve fonksiyonel alanlarla tam kapsamlı çalışma.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    accent: '',
    imageFit: 'cover',
    featured: true
  },
  {
    title: 'Body Building',
    category: 'Güç',
    description: 'Kas gelişimi ve performans hedefleri için profesyonel programlar.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Crossfit',
    category: 'Performans',
    description: 'Yüksek yoğunluklu işlevsel antrenman deneyimi.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Pilates',
    category: 'Denge',
    description: 'Core, esneklik ve vücut kontrolünü güçlendiren özel dersler.',
    image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Yoga',
    category: 'Rahatlama',
    description: 'Nefes, esneklik ve zihinsel denge için modern yoga seansları.',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Kick Box',
    category: 'Savaşçı',
    description: 'Kondisyon ve teknik odaklı kick box dersleri.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Personal Trainer',
    category: 'VIP',
    description: 'Size özel planlama, takip ve birebir koçluk desteği.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  },
  {
    title: 'Functional Training',
    category: 'Dinamik',
    description: 'Günlük performansı artıran modern fonksiyonel antrenmanlar.',
    image: 'https://images.unsplash.com/photo-1526401485004-2aa7f3b1b4da?auto=format&fit=crop&w=1200&q=80',
    accent: '',
  }
];

export const defaultGalleryCategories = ['Salon', 'Videolar', 'Etkinlikler'];

export const defaultAnalytics = {
  totalVisits: 0,
  totalClicks: 0,
  uniqueVisitors: 0,
  visitorIds: [],
  visitsByDay: {},
  clicksByTarget: {},
  pageViews: {}
};

export const defaultPackages = [
  {
    title: 'STARTER',
    subtitle: 'Yeni başlayanlar için',
    price: 499,
    originalPrice: 699,
    discountLabel: 'İndirim',
    period: '/ay',
    accent: '',
    priceColor: '',
    textColor: '',
    titleColor: '',
    mutedColor: '',
    bgColor: '',
    borderColor: '',
    features: [
      { text: 'Fitness kullanımı', included: true },
      { text: '1 grup dersi', included: true },
      { text: 'Vücut analizi', included: true },
      { text: 'Diyet listesi', included: true },
      { text: 'Personal antrenör', included: false }
    ],
    cta: 'Başla',
    featured: true
  },
  {
    title: 'PRO PLAN',
    subtitle: 'Daha yoğun ilerleme',
    price: 799,
    originalPrice: null,
    discountLabel: 'Popüler',
    period: '/ay',
    accent: '',
    priceColor: '',
    textColor: '',
    titleColor: '',
    mutedColor: '',
    bgColor: '',
    borderColor: '',
    features: [
      { text: 'Sınırsız salon erişimi', included: true },
      { text: 'Grup dersleri', included: true },
      { text: 'Kardiyo alanı', included: true },
      { text: 'Soyunma odası', included: true },
      { text: 'Ücretsiz otopark', included: true }
    ],
    cta: 'Seç',
    featured: true
  },
  {
    title: 'PREMIUM',
    subtitle: 'VIP deneyim',
    price: 1199,
    originalPrice: null,
    discountLabel: '',
    period: '/ay',
    accent: '',
    priceColor: '',
    textColor: '',
    titleColor: '',
    mutedColor: '',
    bgColor: '',
    borderColor: '',
    features: [
      { text: 'Sınırsız salon erişimi', included: true },
      { text: 'Sınırsız grup dersi', included: true },
      { text: 'Vücut analizi', included: true },
      { text: 'Beslenme planı', included: true },
      { text: 'Personal antrenör', included: true }
    ],
    cta: 'Premium Ol',
    featured: true
  },
  {
    title: 'ELITE',
    subtitle: 'Tam kapsamlı paket',
    price: 1499,
    originalPrice: null,
    discountLabel: '',
    period: '/ay',
    accent: '',
    priceColor: '',
    textColor: '',
    titleColor: '',
    mutedColor: '',
    bgColor: '',
    borderColor: '',
    features: [
      { text: 'Sınırsız salon', included: true },
      { text: 'PT desteği', included: true },
      { text: 'Beslenme planı', included: true },
      { text: 'Sauna & buhar', included: true },
      { text: 'VIP alan', included: true }
    ],
    cta: 'Elite Ol',
    featured: true
  }
];

export const defaultGallery = [
  {
    id: 'gallery-1',
    title: 'Cardio Alanı',
    category: 'Salon',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-2',
    title: 'Ağırlık Bölümü',
    category: 'Salon',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-3',
    title: 'Antrenman Videosu',
    category: 'Videolar',
    type: 'video',
    image: '',
    videoUrl: 'https://www.youtube.com/watch?v=dlQ7MzS7Lk8',
    featured: true
  },
  {
    id: 'gallery-4',
    title: 'Fonksiyonel Alan',
    category: 'Salon',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1526401485004-2aa7f3b1b4da?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-5',
    title: 'Pilates Stüdyo',
    category: 'Salon',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-6',
    title: 'Crossfit Köşesi',
    category: 'Salon',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-7',
    title: 'Yaz Maratonu',
    category: 'Etkinlikler',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618d88?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  },
  {
    id: 'gallery-8',
    title: 'Üye Buluşması',
    category: 'Etkinlikler',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    videoUrl: '',
    featured: true
  }
];

export const defaultAnnouncements = [
  { message: 'Yaz Kampanyası %30 İndirim', color: '', weight: '700' },
  { message: 'Yeni Pilates Grubu Başlıyor', color: '', weight: '600' },
  { message: 'Bayramda 09:00 - 18:00 arası hizmetinizdeyiz.', color: '', weight: '600' },
  { message: 'Arkadaşını Getir %25 İndirim Kazan', color: '', weight: '700' }
];

export const defaultTrainers = [
  {
    id: 'coach-1',
    name: 'Ece Demir',
    specialty: 'Kuvvet & Kondisyon',
    experience: '8 yıllık deneyim. Functional training ve vücut kompozisyonu uzmanı.',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'coach-2',
    name: 'Mert Kaya',
    specialty: 'Crossfit Coach',
    experience: '6 yıllık deneyim. HIIT, crossfit ve performans antrenmanları.',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'coach-3',
    name: 'Selin Arslan',
    specialty: 'Pilates & Esneklik',
    experience: '5 yıllık deneyim. Reformer pilates ve postür düzeltme programları.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'coach-4',
    name: 'Burak Yıldız',
    specialty: 'Personal Training',
    experience: '10 yıllık deneyim. Kişisel hedef odaklı premium antrenman planları.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
    featured: true
  }
];

export const defaultAbout = {
  title: 'Hakkımızda',
  subtitle: 'Kocaeli\'nin premium fitness deneyimi',
  heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
  paragraphs: [
    'PEAKSPORTS CENTER, modern ekipmanlar, uzman eğitmen kadrosu ve premium tesis konforuyla Kocaeli\'de fark yaratan bir fitness merkezidir.',
    'Amacımız her üyemizin hedeflerine güvenli, sürdürülebilir ve keyifli bir şekilde ulaşmasını sağlamaktır. Kişisel antrenman, grup dersleri, pilates, crossfit ve daha fazlası tek çatı altında.',
    'Temiz alanlarımız, profesyonel ekibimiz ve esnek üyelik paketlerimizle sizi zirveye taşımaya hazırız.'
  ],
  highlights: [
    { title: 'Premium Tesis', text: 'Geniş salon, modern ekipman ve konforlu sosyal alanlar.' },
    { title: 'Uzman Kadro', text: 'Sertifikalı eğitmenlerle kişiye özel program desteği.' },
    { title: 'Esnek Üyelik', text: 'İhtiyacınıza uygun paketler ve şeffaf fiyatlandırma.' }
  ]
};

export const defaultTestimonials = [
  {
    id: 'review-1',
    name: 'Ayşe K.',
    role: 'Premium Üye · 8 ay',
    text: 'Ekipman kalitesi ve eğitmen ilgisi gerçekten üst düzey. 3 ayda hedeflediğim forma ulaştım, kesinlikle tavsiye ederim.',
    rating: 5,
    image: ''
  },
  {
    id: 'review-2',
    name: 'Emre T.',
    role: 'Pro Plan · 1 yıl',
    text: 'Grup dersleri ve PT desteği sayesinde motivasyonum hiç düşmedi. Temizlik ve ortam kalitesi de çok iyi.',
    rating: 5,
    image: ''
  },
  {
    id: 'review-3',
    name: 'Zeynep M.',
    role: 'Starter Üye · 4 ay',
    text: 'İlk kez düzenli spor yapıyorum, eğitmenler her adımda yanımda. Paket fiyatları da gayet makul.',
    rating: 5,
    image: ''
  },
  {
    id: 'review-4',
    name: 'Can D.',
    role: 'Elite Üye · 6 ay',
    text: 'VIP alan ve personal antrenör desteği fark yaratıyor. Profesyonel bir kulüp arayanlar için ideal.',
    rating: 5,
    image: ''
  }
];

export const defaultFacilityAreas = [
  {
    title: 'Fitness Alanı',
    description: 'Geniş ağırlık, kardiyo ve fonksiyonel antrenman bölümü.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Video Yakında'
  },
  {
    title: 'Havuz',
    description: 'Serinleme, toparlanma ve su içi egzersiz alanı.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Görsel'
  },
  {
    title: 'Buhar Odası',
    description: 'Kas gevşetme ve detoks için premium buhar deneyimi.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Görsel'
  },
  {
    title: 'Masa Tenisi',
    description: 'Eğlenceli rekabet ve refleks antrenmanı için özel alan.',
    image: 'https://images.unsplash.com/photo-1554068865-9cebb4c4e08a?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Görsel'
  },
  {
    title: 'Sauna',
    description: 'Toparlanma ve rahatlama için sıcak sauna bölümü.',
    image: 'https://images.unsplash.com/photo-1519823551278-64b92733cd8f?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Görsel'
  },
  {
    title: 'Grup Stüdyosu',
    description: 'Pilates, yoga ve grup dersleri için modern stüdyo.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    video: null,
    tag: 'Görsel'
  }
];

export const defaultPosts = [
  {
    title: 'Antrenman rutininizi nasıl hızlandırırsınız?',
    slug: 'antrenman-rutininizi-nasil-hizlandirirsiniz',
    excerpt: 'Kısa ama etkili bir plan ile performans ve süreklilik elde edin.',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    body: 'PEAKSPOR ekibi, hedef odaklı ilerlemek isteyenler için haftalık plan, toparlanma ve beslenmeyi birlikte ele alır.'
  }
];