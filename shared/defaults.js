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
    name: 'PEAKSPOR',
    shortName: 'PK',
    slogan: 'Premium Fitness Platform',
    logoMark: '▲'
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
    title: 'PEAKSPOR | Premium Fitness Platform',
    description: 'PEAKSPOR için premium fitness platformu, rezervasyon sistemi ve admin paneli.',
    keywords: 'fitness, gym, premium gym, spor salonu, rezervasyon, PEAKSPOR'
  },
  theme: {
    primary: '#7CFF4F',
    secondary: '#22C55E',
    background: '#050505',
    surface: '#0D1117',
    panel: '#111827',
    text: '#FFFFFF',
    muted: '#9CA3AF'
  },
  assistant: {
    welcome: 'PEAKSPOR AI Asistan',
    message: 'Merhaba, ben PEAKSPOR yapay zeka asistanıyım. Size nasıl yardımcı olabilirim?',
    buttons: ['Üyelik Bilgileri', 'Paket Fiyatları', 'Ders Programları', 'Kampanyalar', 'WhatsApp Destek']
  },
  stats: [
    { label: 'Aktif Üye', value: '5.000+', icon: 'users' },
    { label: 'Uzman Eğitmen', value: '25', icon: 'coach' },
    { label: 'Grup Dersi', value: '100+', icon: 'class' },
    { label: 'Yıllık Deneyim', value: '10+', icon: 'years' }
  ],
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
    accent: '#7CFF4F'
  },
  {
    title: 'Body Building',
    category: 'Güç',
    description: 'Kas gelişimi ve performans hedefleri için profesyonel programlar.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    accent: '#22C55E'
  },
  {
    title: 'Crossfit',
    category: 'Performans',
    description: 'Yüksek yoğunluklu işlevsel antrenman deneyimi.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    accent: '#2563EB'
  },
  {
    title: 'Pilates',
    category: 'Denge',
    description: 'Core, esneklik ve vücut kontrolünü güçlendiren özel dersler.',
    image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=1200&q=80',
    accent: '#7C3AED'
  },
  {
    title: 'Yoga',
    category: 'Rahatlama',
    description: 'Nefes, esneklik ve zihinsel denge için modern yoga seansları.',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=80',
    accent: '#22C55E'
  },
  {
    title: 'Kick Box',
    category: 'Savaşçı',
    description: 'Kondisyon ve teknik odaklı kick box dersleri.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80',
    accent: '#2563EB'
  },
  {
    title: 'Personal Trainer',
    category: 'VIP',
    description: 'Size özel planlama, takip ve birebir koçluk desteği.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    accent: '#7C3AED'
  },
  {
    title: 'Functional Training',
    category: 'Dinamik',
    description: 'Günlük performansı artıran modern fonksiyonel antrenmanlar.',
    image: 'https://images.unsplash.com/photo-1526401485004-2aa7f3b1b4da?auto=format&fit=crop&w=1200&q=80',
    accent: '#22C55E'
  }
];

export const defaultPackages = [
  {
    title: 'Starter',
    subtitle: 'Yeni başlayanlar için',
    price: 499,
    period: '/ay',
    accent: '#7CFF4F',
    features: ['Fitness kullanımı', '1 grup dersi', 'Vücut analizi', 'Diyet listesi'],
    cta: 'Başla'
  },
  {
    title: 'Professional',
    subtitle: 'Daha yoğun ilerleme',
    price: 799,
    period: '/ay',
    accent: '#2563EB',
    features: ['Fitness kullanımı', 'Sınırsız grup dersi', 'Vücut analizi', 'Diyet listesi', 'Personal antrenör'],
    cta: 'Seç'
  },
  {
    title: 'Premium',
    subtitle: 'VIP deneyim',
    price: 1199,
    period: '/ay',
    accent: '#7C3AED',
    features: ['Fitness kullanımı', 'Sınırsız grup dersi', 'Vücut analizi', 'Diyet listesi', 'Özel program'],
    cta: 'Premium Ol'
  }
];

export const defaultGallery = [
  {
    title: 'Salon',
    category: 'Salon',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Dersler',
    category: 'Dersler',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Ekipmanlar',
    category: 'Ekipmanlar',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Etkinlikler',
    category: 'Etkinlikler',
    image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=1200&q=80'
  }
];

export const defaultAnnouncements = [
  'Yaz Kampanyası %30 İndirim',
  'Yeni Pilates Grubu Başlıyor',
  'Bayramda 09:00 - 18:00 arası hizmetinizdeyiz.',
  'Arkadaşını Getir %25 İndirim Kazan'
];

export const defaultTrainers = [
  {
    name: 'Ece Demir',
    role: 'Kuvvet ve Kondisyon',
    specialty: 'Functional Training',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Mert Kaya',
    role: 'Crossfit Coach',
    specialty: 'High Intensity',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80'
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