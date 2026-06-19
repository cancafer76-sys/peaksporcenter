import { ALL_SERVICE_AREAS, cityToRegionalSlug, getAreaRegion } from './local-areas.js';

function buildParagraphs(city, region) {
  return [
    `${city}, ${region} bölgesinde sağlıklı yaşam ve fitness talebinin sürekli arttığı bir bölgedir. PEAKSPOR CENTER, ${city} spor salonu arayan bireyler için modern ekipmanlar, uzman eğitmen kadrosu ve premium tesis konforu sunar. Kişisel antrenman, pilates, crossfit ve grup dersleri ile hedeflerinize güvenli ve etkili şekilde ulaşabilirsiniz.`,
    `Salonumuzda kardiyo alanı, serbest ağırlık bölümü, fonksiyonel antrenman köşeleri ve stretching alanları bulunur. ${city} fitness merkezi arayışında olanlar için hijyen standartları yüksek, ferah ve motive edici bir ortam oluşturduk. Yeni başlayanlardan ileri seviye sporculara kadar her seviyeye uygun programlar hazırlanır.`,
    `PEAKSPOR CENTER üyelik paketleri esnek yapıdadır; aylık, dönemsel ve kampanyalı seçeneklerle bütçenize uygun planlar sunulur. Deneyimli eğitmenlerimiz vücut analizi, beslenme yönlendirmesi ve antrenman takibi konusunda destek sağlar. ${city} ve çevre mahallelerden kolay ulaşım imkânı ile sporu günlük rutininize dahil edebilirsiniz.`,
    `Kilo yönetimi, kas gelişimi, kondisyon artırma ve genel sağlık hedefleriniz için kişiye özel antrenman planları uygulanır. ${city} çevresinde spor salonu arayan aileler, gençler ve profesyoneller için güvenilir bir adres olarak hizmet veriyoruz. Salon turu ve üyelik bilgisi almak için iletişim sayfamızdan bize ulaşabilirsiniz.`,
    `${city} bölgesinde kaliteli fitness deneyimi için PEAKSPOR CENTER\'ı tercih edin. Profesyonel ekibimizle tanışın, modern tesislerimizi keşfedin ve sağlıklı yaşam yolculuğunuza güçlü bir başlangıç yapın.`
  ];
}

export function buildRegionalPage(city) {
  const region = getAreaRegion(city);
  const slug = cityToRegionalSlug(city);
  return {
    slug,
    city,
    region,
    title: `${city} Spor Salonu | PEAKSPOR CENTER`,
    description: `${city} ve çevresinde fitness, pilates, crossfit ve spor salonu arayanlar için PEAKSPOR CENTER modern ekipmanları ve profesyonel eğitmenleriyle hizmet verir.`,
    h1: `${city} Spor Salonu`,
    paragraphs: buildParagraphs(city, region)
  };
}

export const REGIONAL_PAGES = ALL_SERVICE_AREAS.map(buildRegionalPage);

export function getRegionalPageBySlug(slug) {
  return REGIONAL_PAGES.find(page => page.slug === slug) || null;
}

export function getRegionalPageByPath(pathname) {
  const slug = pathname.replace(/^\//, '');
  return getRegionalPageBySlug(slug);
}

export function isRegionalPath(pathname) {
  return REGIONAL_PAGES.some(page => `/${page.slug}` === pathname);
}
