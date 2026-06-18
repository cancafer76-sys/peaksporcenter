export const defaultContent = {
  brand: {
    name: 'PEAKSPOR',
    shortName: 'PK',
    slogan: 'Premium Fitness Platform',
    logoMark: '▲'
  },
  hero: {
    title: 'HOŞ GELDİNİZ\nZİRVEYİ YAŞA',
    subtitle:
      'Premium salon deneyimi, uzman eğitmenler, rezervasyon akışı ve yönetim paneli tek bir güçlü platformda.',
    primaryCta: 'ÜYE OL',
    secondaryCta: 'SALONU KEŞFET',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80'
  },
  assistant: {
    welcome: 'PEAKSPOR Asistan',
    message: 'Merhaba! Size nasıl yardımcı olabiliriz?',
    buttons: ['Antrenman Programı', 'Paketler', 'Dersler', 'Rezervasyon', 'WhatsApp Destek']
  },
  whatsapp: {
    number: '+905555555555',
    text: 'Merhaba, PEAKSPOR hakkında bilgi almak istiyorum.',
    label: 'WhatsApp'
  },
  seo: {
    title: 'PEAKSPOR | Premium Fitness Platform',
    description:
      'PEAKSPOR için premium fitness platformu, rezervasyon sistemi ve admin paneli.',
    keywords: 'fitness, gym, premium gym, spor salonu, rezervasyon, PEAKSPOR'
  },
  theme: {
    primary: '#A4FF3F',
    secondary: '#5DB0FF',
    background: '#050608',
    surface: '#0f141b',
    panel: '#141a23',
    text: '#FFFFFF',
    muted: '#93A0B2'
  },
  ticker: [
    'Yeni grup dersleri her pazartesi',
    'VIP üyeliklerde özel başlangıç paketi',
    'Kişisel antrenör randevuları açık',
    'Tüm içerikler admin panelinden yönetilebilir'
  ],
  stats: [
    { label: 'Aktif Üye', value: '5.231', icon: 'users' },
    { label: 'Uzman Eğitmen', value: '18', icon: 'coach' },
    { label: 'Grup Dersi', value: '42', icon: 'class' },
    { label: 'Yıllık Deneyim', value: '14', icon: 'years' }
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
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    accent: '#A4FF3F'
  },
  {
    title: 'Body Building',
    category: 'Güç',
    description: 'Kas gelişimi ve performans hedefleri için profesyonel programlar.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    accent: '#5DB0FF'
  },
  {
    title: 'Crossfit',
    category: 'Performans',
    description: 'Yüksek yoğunluklu işlevsel antrenman deneyimi.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    accent: '#A88CFF'
  },
  {
    title: 'Pilates',
    category: 'Denge',
    description: 'Core, esneklik ve vücut kontrolünü güçlendiren özel dersler.',
    image:
      'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=900&q=80',
    accent: '#FFB45B'
  },
  {
    title: 'Yoga',
    category: 'Rahatlama',
    description: 'Nefes, esneklik ve zihinsel denge için modern yoga seansları.',
    image:
      'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=900&q=80',
    accent: '#60A5FA'
  },
  {
    title: 'Kick Box',
    category: 'Savaşçı',
    description: 'Kondisyon, dayanıklılık ve teknik odaklı kick box dersleri.',
    image:
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80',
    accent: '#FB7185'
  },
  {
    title: 'Personal Trainer',
    category: 'VIP',
    description: 'Size özel planlama, takip ve birebir koçluk desteği.',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    accent: '#F59E0B'
  },
  {
    title: 'Functional Training',
    category: 'Dinamik',
    description: 'Günlük performansı artıran modern fonksiyonel antrenmanlar.',
    image:
      'https://images.unsplash.com/photo-1526401281623-359b3f6c5b6d?auto=format&fit=crop&w=900&q=80',
    accent: '#34D399'
  }
];

export const defaultPackages = [
  {
    title: 'Başlangıç',
    subtitle: 'Yeni başlayanlar için',
    price: 699,
    period: '/ay',
    accent: '#A4FF3F',
    features: [
      'Sınırsız salon kullanımı',
      '1 değerlendirme seansı',
      'Standart ekipman erişimi',
      'Mobil takip paneli',
      'Haftalık program'
    ],
    cta: 'Başla'
  },
  {
    title: 'Orta Seviye',
    subtitle: 'Daha yoğun ilerleme',
    price: 999,
    period: '/ay',
    accent: '#5DB0FF',
    features: [
      'Tüm salon erişimi',
      '2 grup dersi',
      'Beslenme rehberi',
      'Öncelikli rezervasyon',
      'Kişisel hedef analizi'
    ],
    cta: 'Seç'
  },
  {
    title: 'Premium',
    subtitle: 'VIP deneyim',
    price: 1499,
    period: '/ay',
    accent: '#A88CFF',
    features: [
      'Sınırsız giriş',
      'Birebir PT desteği',
      'Özel soyunma alanı',
      'VIP etkinlik davetleri',
      'İşletme danışmanlığı'
    ],
    cta: 'Premium Ol'
  }
];

export const defaultGallery = [
  {
    title: 'Salon',
    category: 'Salon',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Dersler',
    category: 'Dersler',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Ekipmanlar',
    category: 'Ekipmanlar',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Etkinlikler',
    category: 'Etkinlikler',
    image:
      'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Fonksiyonel Alan',
    category: 'Salon',
    image:
      'https://images.unsplash.com/photo-1526401485004-2aa7f3b1b4da?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Kardiyo',
    category: 'Ekipmanlar',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'
  }
];

export const defaultAnnouncements = [
  'Yeni üyeliklerde ilk ay özel fiyat avantajı.',
  'Personal trainer dersleri için ön rezervasyon açıldı.',
  'Akşam dersleri yoğun talep nedeniyle sınırlı kontenjan.',
  'PEAKSPOR uygulamasındaki içerikler admin panelden güncellenebilir.'
];

export const defaultTrainers = [
  {
    name: 'Ece Demir',
    role: 'Kuvvet ve Kondisyon',
    specialty: 'Functional Training',
    image:
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Mert Kaya',
    role: 'Crossfit Coach',
    specialty: 'High Intensity',
    image:
      'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Derya Arslan',
    role: 'Pilates & Yoga',
    specialty: 'Body Balance',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Can Yıldız',
    role: 'Personal Trainer',
    specialty: 'VIP Program',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80'
  }
];

export const defaultPosts = [
  {
    title: 'Antrenman rutininizi nasıl hızlandırırsınız?',
    slug: 'antrenman-rutininizi-nasil-hizlandirirsiniz',
    excerpt: 'Kısa ama etkili bir plan ile performans ve süreklilik elde edin.',
    coverImage:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    body: 'PEAKSPOR ekibi, hedef odaklı ilerlemek isteyenler için haftalık plan, toparlanma ve beslenmeyi birlikte ele alır.'
  },
  {
    title: 'Premium salon deneyimi neden fark yaratır?',
    slug: 'premium-salon-deneyimi-neden-fark-yaratir',
    excerpt: 'Işık, ekipman, alan ve uzmanlık bir araya geldiğinde sonuç değişir.',
    coverImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    body: 'Mekân kalitesi, motivasyonu ve devamlılığı doğrudan etkiler. PEAKSPOR premium hissi bu yüzden merkezde tutar.'
  },
  {
    title: 'Kişisel koçluk ile hedefe ulaşmak',
    slug: 'kisisel-kocluk-ile-hedefe-ulasmak',
    excerpt: 'Birebir takip sayesinde ölçülebilir gelişim elde edilir.',
    coverImage:
      'https://images.unsplash.com/photo-1518611507436-f9221403cca3?auto=format&fit=crop&w=900&q=80',
    body: 'Antrenörün programı, vücut ölçüleri ve program disiplinini tek panelde takip etmek mümkündür.'
  }
];