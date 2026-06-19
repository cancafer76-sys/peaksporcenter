import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import {
  defaultAnnouncements,
  defaultFacilityAreas,
  defaultContent,
  defaultGallery,
  defaultGalleryCategories,
  defaultPackages,
  defaultServices,
  defaultPosts,
  defaultTrainers
} from '../shared/defaults.js';
import { featuredOrAll, getYoutubeEmbedUrl, getYoutubeThumbnail, getVisibleStats, groupGalleryByCategory, normalizeAnnouncement, normalizeAnnouncements, normalizeGalleryItem, normalizeHomeCards, normalizePackage, normalizeService, normalizeStats, packageCardVars, serviceCardVars } from '../shared/media.js';
import { applySiteTheme } from '../shared/theme.js';
import { applySiteSeo } from '../shared/seo.js';
import {
  BadgeInfo,
  ChevronRight,
  Dumbbell,
  Home,
  LayoutDashboard,
  Megaphone,
  Image,
  MessageCircle,
  Medal,
  Moon,
  Package,
  Pause,
  Phone,
  Play,
  Save,
  Settings2,
  Sparkles,
  SunMedium,
  Send,
  Users,
  Video,
  ArrowRight,
  X
} from 'lucide-react';
import './mobile.css';
import AdminDashboard from './admin/AdminDashboard.jsx';

const fallbackSettings = {
  content: defaultContent,
  services: defaultServices,
  packages: defaultPackages,
  gallery: defaultGallery,
  posts: defaultPosts,
  trainers: defaultTrainers,
  announcements: defaultAnnouncements,
  facilityAreas: defaultFacilityAreas,
  galleryCategories: defaultGalleryCategories
};

const desktopNav = [
  { id: 'home', label: 'Ana Sayfa', route: '/' },
  { id: 'services', label: 'Hizmetler', route: '/services' },
  { id: 'packages', label: 'Paketler', route: '/packages' },
  { id: 'gallery', label: 'Galeri', route: '/gallery' },
  { id: 'contact', label: 'İletişim', route: '/contact' }
];

const mobileNav = [
  { id: 'home', label: 'Ana Sayfa', icon: Home, route: '/' },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell, route: '/services' },
  { id: 'packages', label: 'Paketler', icon: Package, route: '/packages' },
  { id: 'gallery', label: 'Galeri', icon: Image, route: '/gallery' },
  { id: 'contact', label: 'İletişim', icon: Phone, route: '/contact' }
];

function getStatIcon(name) {
  const map = { users: Users, coach: Medal, class: Video, years: Medal, medal: Medal, dumbbell: Dumbbell, video: Video };
  return map[name] || Users;
}

function pickStyle(entries) {
  const style = {};
  entries.forEach(([key, value]) => {
    if (value) style[key] = value;
  });
  return Object.keys(style).length ? style : undefined;
}

function PackageCard({ item, selected = false, compact = false, showCta = true, onSelect, onCtaClick }) {
  const pkg = normalizePackage(item);
  return (
    <article
      className={`package-card ${compact ? 'package-card-mobile' : ''} ${selected ? 'selected' : ''}`}
      style={packageCardVars(pkg)}
      onClick={onSelect}
      onKeyDown={onSelect ? event => { if (event.key === 'Enter') onSelect(event); } : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {pkg.discountLabel ? <span className="package-discount-badge">{pkg.discountLabel}</span> : null}
      <div className="package-shape" aria-hidden="true" />
      <div className="package-top">
        <div>
          <span>{pkg.subtitle}</span>
          <h3>{pkg.title}</h3>
        </div>
        <div className="package-price">
          {pkg.originalPrice ? <s className="package-old-price">₺{formatPrice(pkg.originalPrice)}</s> : null}
          ₺{formatPrice(pkg.price)}
          <small>{pkg.period}</small>
        </div>
      </div>
      <ul>
        {pkg.features.slice(0, 4).map(feature => (
          <li key={feature}>
            <span className="check">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      {showCta ? (
        <button
          className="package-cta"
          type="button"
          onClick={event => {
            event.stopPropagation();
            onCtaClick?.(event, pkg);
          }}
        >
          {pkg.cta}
        </button>
      ) : null}
    </article>
  );
}

function ServiceCardButton({ service, selected = false, compact = false, mini = false, onClick }) {
  const data = normalizeService(service);
  return (
    <button
      type="button"
      className={`service-card ${compact ? 'service-card-mobile' : ''} ${mini ? 'service-card-mini' : ''} ${selected ? 'selected' : ''}`}
      style={serviceCardVars(data)}
      onClick={onClick}
    >
      <img src={data.image} alt={data.title} style={{ objectFit: data.imageFit || 'cover' }} />
      <div className="card-overlay" />
      <div className="service-card-body">
        <Dumbbell size={mini ? 15 : 16} />
        <div>
          <strong>{data.title}</strong>
          <span>{data.category}</span>
        </div>
      </div>
    </button>
  );
}

function GalleryCard({ item, category, interactive = false, compact = false, onClick }) {
  const data = normalizeGalleryItem(item);
  const thumb = data.type === 'video' ? data.image || getYoutubeThumbnail(data.videoUrl) : data.image;
  const Tag = onClick ? 'button' : 'article';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`gallery-card ${interactive ? 'gallery-card-interactive' : ''} ${compact ? 'gallery-card-home' : ''}`}
      onClick={onClick}
    >
      {thumb ? <img src={thumb} alt={data.title} loading="lazy" /> : <div className="gallery-card-placeholder" />}
      <div className="card-overlay" />
      {interactive ? <span className="gallery-card-orbit" aria-hidden="true" /> : null}
      {data.type === 'video' ? <span className="gallery-video-badge"><Play size={compact ? 12 : 14} /></span> : null}
      <div className="gallery-card-body">
        <span>{category || data.category}</span>
        <strong>{data.title}</strong>
      </div>
    </Tag>
  );
}

function StatCard({ item, compact = false }) {
  if (!item.visible) return null;
  const Icon = getStatIcon(item.icon);
  return (
    <article
      className="stat-card"
      style={pickStyle([
        ['background', item.bgColor],
        ['borderColor', item.accentColor ? `${item.accentColor}40` : '']
      ])}
    >
      <Icon size={compact ? 18 : 20} style={pickStyle([['color', item.accentColor]])} />
      <strong style={pickStyle([['color', item.valueColor]])}>{item.value}</strong>
      <span style={pickStyle([['color', item.labelColor]])}>{item.label}</span>
    </article>
  );
}

function StatsGrid({ stats, mobile = false }) {
  const items = getVisibleStats(stats);
  if (!items.length) return null;
  return (
    <section className={`stats-grid ${mobile ? 'stats-grid-mobile' : ''}`}>
      {items.map(item => <StatCard key={item.id} item={item} compact={mobile} />)}
    </section>
  );
}

function SelectedServiceCard({ service, config, showButton = false, onButtonClick }) {
  if (!service || !config.visible) return null;
  return (
    <article
      className="detail-card"
      style={pickStyle([
        ['background', config.background],
        ['borderColor', config.accent ? `${config.accent}40` : '']
      ])}
    >
      <div>
        <span style={pickStyle([['color', config.muted]])}>{config.label}</span>
        <h3 style={pickStyle([['color', config.text]])}>{service.title}</h3>
        <p style={pickStyle([['color', config.muted]])}>{service.description}</p>
      </div>
      {showButton ? (
        <button
          className="detail-link"
          type="button"
          style={pickStyle([
            ['color', config.accent],
            ['borderColor', config.accent ? `${config.accent}44` : '']
          ])}
          onClick={onButtonClick}
        >
          {config.buttonText} <ChevronRight size={16} />
        </button>
      ) : null}
    </article>
  );
}

function SelectedPackageCard({ pkg, config, compact = false }) {
  const data = normalizePackage(pkg);
  if (!data || !config.visible) return null;
  return (
    <article
      className={`detail-card ${compact ? 'detail-card-compact' : ''}`}
      style={pickStyle([
        ['background', config.background],
        ['borderColor', config.accent ? `${config.accent}40` : '']
      ])}
    >
      <div>
        <span style={pickStyle([['color', config.muted]])}>{config.label}</span>
        <h3 style={pickStyle([['color', config.text]])}>{data.title}</h3>
        <p style={pickStyle([['color', config.muted]])}>{data.subtitle}</p>
      </div>
      {config.showPrice ? (
        <div className="detail-price" style={pickStyle([['color', config.accent]])}>
          ₺{formatPrice(data.price)}
          <small style={pickStyle([['color', config.muted]])}>{data.period}</small>
        </div>
      ) : null}
    </article>
  );
}

function HeroFloatingStat({ stats, config }) {
  if (!config.visible) return null;
  const items = normalizeStats(stats);
  const item = items[config.statIndex];
  const resolved = item?.visible !== false ? item : getVisibleStats(stats)[0];
  if (!resolved) return null;
  return (
    <div
      className="hero-floating-card"
      style={pickStyle([
        ['background', resolved.bgColor],
        ['borderColor', resolved.accentColor ? `${resolved.accentColor}44` : '']
      ])}
    >
      <strong style={pickStyle([['color', resolved.valueColor]])}>{resolved.value}</strong>
      <span style={pickStyle([['color', resolved.labelColor]])}>{resolved.label}</span>
    </div>
  );
}

function normalizeSettings(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const services = Array.isArray(source.services) && source.services.length ? source.services.map(normalizeService) : defaultServices.map(normalizeService);
  const packages = Array.isArray(source.packages) && source.packages.length ? source.packages.map(normalizePackage) : defaultPackages.map(normalizePackage);
  const gallery = Array.isArray(source.gallery) && source.gallery.length
    ? source.gallery.map((item, index) => normalizeGalleryItem(item, index))
    : defaultGallery.map((item, index) => normalizeGalleryItem(item, index));
  return {
    content: source.content && typeof source.content === 'object' ? source.content : defaultContent,
    services,
    packages,
    gallery,
    galleryCategories:
      Array.isArray(source.galleryCategories) && source.galleryCategories.length
        ? source.galleryCategories
        : defaultGalleryCategories,
    posts: Array.isArray(source.posts) && source.posts.length ? source.posts : defaultPosts,
    trainers: Array.isArray(source.trainers) && source.trainers.length ? source.trainers : defaultTrainers,
    facilityAreas:
      Array.isArray(source.facilityAreas) && source.facilityAreas.length
        ? source.facilityAreas
        : defaultFacilityAreas,
    announcements:
      Array.isArray(source.announcements) && source.announcements.length
        ? source.announcements
        : defaultAnnouncements
  };
}

function useAnalytics(pathname) {
  useEffect(() => {
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('peakspor_visitor') || '';
      if (!visitorId) {
        visitorId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('peakspor_visitor', visitorId);
      }
    } catch {
      visitorId = 'anonymous';
    }
    api.trackVisit({ visitorId, path: pathname }).catch(() => {});
  }, [pathname]);
}

function trackSiteClick(target) {
  api.trackClick({ target }).catch(() => {});
}

function useAppData() {
  const [state, setState] = useState({
    settings: fallbackSettings,
    loading: true,
    darkMode: true,
    drawerOpen: false,
    adminOpen: false,
    user: null,
    selectedService: null,
    selectedPackage: null,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1400
  });

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([api.content(), api.me()]).then(([contentResult, meResult]) => {
      if (!mounted) return;
      const settings =
        contentResult.status === 'fulfilled' ? normalizeSettings(contentResult.value) : fallbackSettings;
      setState(prev => ({
        ...prev,
        settings,
        user: meResult.status === 'fulfilled' ? meResult.value?.user || null : null,
        loading: false
      }));
    });

    const updateViewport = () => setState(prev => ({ ...prev, viewportWidth: window.innerWidth }));
    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      mounted = false;
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return [state, setState];
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const ROUTE_CHANGE_EVENT = 'peakspor:routechange';

function navigateToPath(pathname) {
  const nextPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, '', nextPath);
  }
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function usePathname() {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPathname);
    window.addEventListener(ROUTE_CHANGE_EVENT, syncPathname);
    return () => {
      window.removeEventListener('popstate', syncPathname);
      window.removeEventListener(ROUTE_CHANGE_EVENT, syncPathname);
    };
  }, []);

  return pathname;
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function buildMembershipWhatsAppUrl(number, { firstName, lastName, email, phone }) {
  const cleanNumber = (number || '+905555555555').replace(/\D/g, '');
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const message = [
    'Merhaba, PEAKSPOR\'a üye olmak istiyorum.',
    '',
    `Ad Soyad: ${fullName}`,
    `E-posta: ${email}`,
    `Telefon: ${phone}`
  ].join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

const LOGO_CIRCLE = '/logo-circle.png?v=6';
const LOGO_ALT = 'PEAKSPORTS CENTER logo';

function CircleLogo({ className = '', size = 'md' }) {
  return (
    <span className={`circle-logo circle-logo-${size} ${className}`.trim()}>
      <span className="circle-logo-core">
        <img src={LOGO_CIRCLE} alt={LOGO_ALT} className="circle-logo-img" draggable="false" loading="eager" decoding="async" />
      </span>
      <span className="circle-logo-glow" aria-hidden="true" />
      <span className="circle-logo-orbit" aria-hidden="true" />
    </span>
  );
}

function Brand({ compact = false, logoOnly = false }) {
  return (
    <div className={`brand brand-circle ${compact ? 'brand-compact' : ''} ${logoOnly ? 'brand-logo-only' : ''}`} aria-label="PEAKSPORTS CENTER">
      <CircleLogo size={compact ? 'md' : 'lg'} />
      {logoOnly ? null : (
        <span className="brand-caption">
          <strong>
            <span className="brand-caption-peak">PEAKSPORTS</span>
          </strong>
          <small className="brand-center" aria-label="CENTER">
            <span className="brand-center-track">
              {'CENTER'.split('').map((letter, index) => (
                <span key={`${letter}-${index}`} className="brand-center-letter" style={{ '--i': index }}>
                  {letter}
                </span>
              ))}
            </span>
          </small>
        </span>
      )}
    </div>
  );
}

function AssistantLogo({ size = 'md' }) {
  const mapped = { xs: 'xs', sm: 'sm', md: 'md', lg: 'lg', xl: 'xl', fab: 'fab' }[size] || 'md';
  return <CircleLogo size={mapped} className="assistant-logo-mark" />;
}

function MediaLightbox({ item, onClose }) {
  const data = item ? normalizeGalleryItem(item) : null;

  useEffect(() => {
    if (!data) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={data.title} onClick={onClose}>
      <button type="button" className="media-lightbox-close" onClick={onClose} aria-label="Kapat">
        <X size={22} />
        <span>Kapat</span>
      </button>
      <div className="media-lightbox-body" onClick={event => event.stopPropagation()}>
        {data.type === 'video' && data.videoUrl ? (
          <div className="media-lightbox-frame">
            <iframe src={getYoutubeEmbedUrl(data.videoUrl)} title={data.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          </div>
        ) : (
          <img src={data.image} alt={data.title} className="media-lightbox-image" />
        )}
        <div className="media-lightbox-caption">
          <span>{data.category}</span>
          <strong>{data.title}</strong>
        </div>
      </div>
    </div>
  );
}

function openWhatsAppChat(number, text) {
  const cleanNumber = (number || '+905555555555').replace(/\D/g, '');
  const message = text || 'Merhaba, PEAKSPOR hakkında bilgi almak istiyorum.';
  window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function generateAssistantReply(text, { packages, announcements }) {
  const q = text.toLowerCase().trim();

  if (/whatsapp|insan|temsilci|arama|telefon|konuş|konus|gorus|görüş|canlı|canli/.test(q)) {
    return {
      text: 'Sizi WhatsApp destek hattımıza yönlendirebilirim. Aşağıdaki WhatsApp butonuna tıklayın, ekibimiz hemen yardımcı olsun.',
      suggestWhatsApp: true
    };
  }
  if (/üyelik|uye|üye ol|kayıt|kayit|kaydol/.test(q)) {
    return {
      text: 'PEAKSPOR üyeliği ile fitness alanı, grup dersleri, ölçüm ve danışmanlık desteğine erişirsiniz. İletişim sekmesinden formu doldurabilir veya WhatsApp üzerinden başvurabilirsiniz.'
    };
  }
  if (/paket|fiyat|ücret|ucret|plan|starter|premium|professional/.test(q)) {
    const list = (packages || defaultPackages)
      .slice(0, 3)
      .map(item => `• ${item.title}: ₺${formatPrice(item.price)} ${item.period}`)
      .join('\n');
    return {
      text: `Öne çıkan paketlerimiz:\n${list}\n\nSize en uygun planı birlikte seçmek için WhatsApp hattımıza yazabilirsiniz.`
    };
  }
  if (/ders|program|pilates|yoga|crossfit|antrenman|saat/.test(q)) {
    return {
      text: 'Grup derslerimiz hafta içi ve hafta sonu farklı saatlerde planlanır. Güncel program için WhatsApp üzerinden danışmanlarımıza yazmanız yeterli.'
    };
  }
  if (/kampanya|indirim|fırsat|firsat|promosyon/.test(q)) {
    const notes = normalizeAnnouncements(announcements?.length ? announcements : defaultAnnouncements)
      .slice(0, 3)
      .map(item => `• ${item.message}`)
      .join('\n');
    return {
      text: `Güncel fırsatlar:\n${notes}\n\nKampanya detayları için WhatsApp destek hattımızı kullanabilirsiniz.`
    };
  }
  if (/merhaba|selam|hey|günaydın|gunaydin|iyi günler/.test(q)) {
    return {
      text: 'Merhaba! PEAKSPOR AI Asistan burada. Üyelik, paketler, ders programı veya kampanyalar hakkında sorabilirsiniz.'
    };
  }

  return {
    text: 'Sorunuzu aldım. Üyelik, paket, ders programı ve kampanyalar hakkında yardımcı olabilirim. Dilerseniz sizi WhatsApp ekibimize de aktarabilirim.',
    suggestWhatsApp: true
  };
}

function AssistantChat({ mobile, content, packages, announcements }) {
  const assistant = content?.assistant || defaultContent.assistant;
  const whatsappNumber = content?.whatsapp?.number || defaultContent.whatsapp.number;
  const whatsappText = content?.whatsapp?.text || defaultContent.whatsapp.text;
  const [open, setOpen] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('peakspor-assistant-teaser');
    if (dismissed) return undefined;
    const timer = window.setTimeout(() => setTeaserVisible(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open || messages.length) return;
    setMessages([{ id: 'welcome', role: 'assistant', text: assistant.message }]);
  }, [open, assistant.message, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing, open]);

  const dismissTeaser = () => {
    setTeaserVisible(false);
    sessionStorage.setItem('peakspor-assistant-teaser', '1');
  };

  const openChat = () => {
    dismissTeaser();
    setOpen(true);
  };

  const pushAssistantReply = (text, suggestWhatsApp = false) => {
    setTyping(true);
    window.setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text,
          suggestWhatsApp
        }
      ]);
      setTyping(false);
    }, 650);
  };

  const handleQuickReply = label => {
    if (/whatsapp/i.test(label)) {
      openWhatsAppChat(whatsappNumber, whatsappText);
      return;
    }
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text: label }]);
    const reply = generateAssistantReply(label, { packages, announcements });
    pushAssistantReply(reply.text, reply.suggestWhatsApp);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text }]);
    const reply = generateAssistantReply(text, { packages, announcements });
    pushAssistantReply(reply.text, reply.suggestWhatsApp);
  };

  return (
    <div className={`assistant-chat ${mobile ? 'assistant-chat-mobile' : 'assistant-chat-desktop'}`}>
      {teaserVisible && !open ? (
        <div className="assistant-teaser" role="status">
          <button type="button" className="assistant-teaser-close" onClick={dismissTeaser} aria-label="Kapat">
            <X size={12} />
          </button>
          <div className="assistant-teaser-logo">
            <AssistantLogo size={mobile ? 'md' : 'xl'} />
          </div>
          <div className="assistant-teaser-top">
            <div>
              <strong>{assistant.welcome}</strong>
              <span className="assistant-teaser-status">Çevrimiçi • AI Destek</span>
            </div>
          </div>
          <p>Merhaba, size nasıl yardımcı olabilirim? Üyelik ve paketler hakkında hemen bilgi verebilirim.</p>
          <button type="button" className="assistant-teaser-action" onClick={openChat}>
            <Sparkles size={13} />
            Sohbete Başla
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="assistant-panel" role="dialog" aria-label="PEAKSPOR AI Asistan">
          <div className="assistant-panel-head">
            <div className="assistant-panel-brand">
              <span className="assistant-panel-avatar" aria-hidden="true">
                <AssistantLogo size="md" />
                <span className="assistant-online-dot" />
              </span>
              <div>
                <strong>{assistant.welcome}</strong>
                <span>Size yardımcı olmaya hazırım</span>
              </div>
            </div>
            <button type="button" className="assistant-panel-close" onClick={() => setOpen(false)} aria-label="Sohbeti kapat">
              <X size={14} />
            </button>
          </div>
          <div className="assistant-messages">
            {messages.map(message => (
              <div key={message.id} className={`assistant-message ${message.role}`}>
                {message.role === 'assistant' ? (
                  <span className="assistant-message-avatar" aria-hidden="true">
                    <AssistantLogo size="sm" />
                  </span>
                ) : null}
                <div className="assistant-message-bubble">
                  <p>{message.text}</p>
                  {message.suggestWhatsApp ? (
                    <button
                      type="button"
                      className="assistant-whatsapp-inline"
                      onClick={() => openWhatsAppChat(whatsappNumber, whatsappText)}
                    >
                      <MessageCircle size={12} />
                      WhatsApp
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            {typing ? (
              <div className="assistant-message assistant">
                <span className="assistant-message-avatar" aria-hidden="true">
                  <AssistantLogo size="sm" />
                </span>
                <div className="assistant-message-bubble assistant-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
          <div className="assistant-quick-replies">
            {(assistant.buttons || defaultContent.assistant.buttons).slice(0, 4).map(label => (
              <button key={label} type="button" onClick={() => handleQuickReply(label)}>
                {label}
              </button>
            ))}
          </div>
          <form className="assistant-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Bir şey sorun..."
              aria-label="Asistan mesajı"
            />
            <button type="submit" aria-label="Gönder">
              <Send size={14} />
            </button>
          </form>
          <button
            type="button"
            className="assistant-whatsapp-cta"
            onClick={() => openWhatsAppChat(whatsappNumber, whatsappText)}
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className={`assistant-fab ${open ? 'open' : ''} ${teaserVisible ? 'has-teaser' : ''}`}
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label={open ? 'Asistanı kapat' : 'PEAKSPOR AI Asistan'}
      >
        <span className="assistant-fab-glow" aria-hidden="true" />
        {open ? <X size={18} /> : <CircleLogo size="fab" className="assistant-fab-logo" />}
      </button>
    </div>
  );
}

function ThemeSwitch({ darkMode, onToggle, mobile = false }) {
  return (
    <button
      type="button"
      className={`theme-switch ${mobile ? 'theme-switch-mobile' : ''} ${darkMode ? 'is-dark' : 'is-light'}`}
      onClick={onToggle}
      aria-label={darkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
      aria-pressed={!darkMode}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <Moon size={13} className="theme-switch-icon theme-switch-icon-moon" />
        <SunMedium size={13} className="theme-switch-icon theme-switch-icon-sun" />
        <span className="theme-switch-thumb">{darkMode ? <Moon size={14} /> : <SunMedium size={14} />}</span>
      </span>
      <span className="theme-switch-label">{darkMode ? 'Gece' : 'Gündüz'}</span>
    </button>
  );
}

function MenuToggle({ open, onClick }) {
  return (
    <button
      type="button"
      className={`menu-toggle ${open ? 'is-open' : ''}`}
      onClick={onClick}
      aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
      aria-expanded={open}
    >
      <span className="menu-toggle-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

function AppDrawer({ open, onClose, pathname }) {
  if (!open) return null;

  const handleNavigate = item => {
    if (item.route) {
      navigateToPath(item.route);
    } else {
      scrollToSection(item.id);
    }
    onClose();
  };

  return (
    <>
      <button type="button" className="drawer-backdrop drawer-backdrop-visible" aria-label="Menüyü kapat" onClick={onClose} />
      <aside className="side-drawer mobile-drawer is-open" aria-label="Ana menü">
        <div className="drawer-head">
          <div className="drawer-brand-block">
            <CircleLogo size="xl" className="drawer-logo-mark" />
            <div className="drawer-brand-text">
              <strong>
                <span className="brand-caption-peak">PEAKSPORTS</span>
              </strong>
              <span>CENTER</span>
            </div>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>
        <p className="drawer-kicker">Keşfet</p>
        <nav className="drawer-links">
          {mobileNav.map((item, index) => {
            const Icon = item.icon;
            const active = item.route ? pathname === item.route : false;
            return (
              <button
                key={item.id}
                type="button"
                className={`drawer-link ${active ? 'active' : ''}`}
                style={{ '--i': index }}
                onClick={() => handleNavigate(item)}
              >
                <span className="drawer-link-icon">
                  <Icon size={18} />
                </span>
                <span className="drawer-link-text">{item.label}</span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function HeaderActions({ darkMode, onToggleTheme, onOpenAdmin, mobile = false }) {
  return (
    <div className="header-actions">
      <ThemeSwitch darkMode={darkMode} onToggle={onToggleTheme} mobile={mobile} />
      {onOpenAdmin ? (
        <button className="admin-entry-button admin-entry-button-header" type="button" onClick={onOpenAdmin} aria-label="Yetkili giriş">
          <LayoutDashboard size={16} />
          <span>Yetkili Giriş</span>
        </button>
      ) : null}
    </div>
  );
}

function RouteChrome({ state, setState, title, subtitle, content, backTo = '/' }) {
  const mobile = state.viewportWidth < 980;
  const pathname = usePathname();
  const isActiveRoute = route => pathname === route;

  return (
    <div className={`app-shell ${mobile ? 'mobile-shell' : 'desktop-shell'} ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className={mobile ? 'mobile-header' : 'desktop-header'}>
          <div className={`${mobile ? 'mobile-header-inner' : 'desktop-header-inner'} shell-width`}>
            <div className="header-left-group">
              <MenuToggle
                open={state.drawerOpen}
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              />
              <Brand compact={mobile} />
            </div>
            {!mobile ? <div className="page-heading-inline"><span>{title}</span></div> : null}
            <HeaderActions
              darkMode={state.darkMode}
              onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
              mobile={mobile}
            />
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className={`shell-width ${mobile ? 'mobile-page mobile-main' : 'desktop-page'}`}>
        <section className="section-block">
          <SectionHeader
            title={title}
            subtitle={subtitle}
            action={
              <button className="text-button" type="button" onClick={() => navigateToPath(backTo)}>
                <ChevronRight size={16} />
                Geri Dön
              </button>
            }
          />
          <div className={mobile ? 'route-content-mobile' : ''}>
            {content}
          </div>
        </section>
      </main>

      {mobile ? (
        <nav className="bottom-nav mobile-bottom-nav" aria-label="Alt menü">
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/') ? 'active' : ''}`} onClick={() => navigateToPath('/')}>
            <Home size={18} />
            <span>Ana Sayfa</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/services') ? 'active' : ''}`} onClick={() => navigateToPath('/services')}>
            <Dumbbell size={18} />
            <span>Hizmetler</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/gallery') ? 'active' : ''}`} onClick={() => navigateToPath('/gallery')}>
            <Image size={18} />
            <span>Galeri</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/packages') ? 'active' : ''}`} onClick={() => navigateToPath('/packages')}>
            <Package size={18} />
            <span>Paketler</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/contact') ? 'active' : ''}`} onClick={() => navigateToPath('/contact')}>
            <Phone size={18} />
            <span>İletişim</span>
          </button>
        </nav>
      ) : null}

      <AssistantChat
        mobile={mobile}
        content={state.settings.content}
        packages={state.settings.packages}
        announcements={state.settings.announcements}
      />

      <AppDrawer
        open={state.drawerOpen && mobile}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        pathname={pathname}
      />

      {state.adminOpen ? (
        <AdminDashboard
          state={state}
          setState={setState}
          onClose={() => setState(prev => ({ ...prev, adminOpen: false }))}
        />
      ) : null}
    </div>
  );
}

function HeroButtons({ compact = false, onPrimary, onSecondary }) {
  if (compact) {
    return (
      <>
        <button className="primary-button hero-cta-primary hero-cta-compact" type="button" onClick={onPrimary}>
          ÜYE OL
        </button>
        <button className="secondary-button hero-cta-secondary hero-cta-compact" type="button" onClick={onSecondary}>
          SALONU KEŞFET
        </button>
      </>
    );
  }

  return (
    <div className="hero-actions">
      <button className="primary-button hero-cta-primary" type="button" onClick={onPrimary}>
        <span>ÜYE OL</span>
      </button>
      <button className="secondary-button hero-cta-secondary" type="button" onClick={onSecondary}>
        <span>SALONU KEŞFET</span>
      </button>
    </div>
  );
}

function AdminEntryButton({ compact = false, onOpenAdmin }) {
  return (
    <button
      className={`admin-entry-button admin-entry-button-hero hero-admin-button hero-admin-main ${compact ? 'compact' : ''}`}
      type="button"
      onClick={onOpenAdmin}
    >
      <LayoutDashboard size={16} />
      <span>Yetkili Giriş</span>
    </button>
  );
}

function HeroCarousel({ slides, mobile = false }) {
  const heroSlides = slides.length
    ? slides
    : [{ title: defaultContent.hero.title, subtitle: defaultContent.hero.subtitle, image: defaultContent.hero.image }];
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = heroSlides.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % heroSlides.length);
    }, mobile ? 3000 : 3600);
    return () => window.clearInterval(timer);
  }, [heroSlides.length, mobile]);

  const goToSlide = nextIndex => {
    if (!heroSlides.length) return;
    const normalizedIndex = ((nextIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
    setActiveIndex(normalizedIndex);
  };

  return (
    <div className={`hero-carousel ${mobile ? 'hero-carousel-mobile' : 'hero-carousel-desktop'}`}>
      <div className="hero-carousel-viewport">
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)`, width: `${heroSlides.length * 100}%` }}
        >
          {heroSlides.map((slide, index) => (
            <article key={`${slide.title}-${index}`} className="hero-carousel-slide">
              <img src={slide.image} alt={slide.title} />
              <div className={`hero-overlay ${mobile ? 'hero-overlay-mobile' : ''}`} />
              <div className={`hero-carousel-copy ${mobile ? 'hero-carousel-copy-mobile' : ''}`}>
                <span className="hero-banner-kicker">PEAKSPORTS</span>
                <strong>{slide.title}</strong>
                <p>{slide.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
        {slideCount > 1 ? (
          <>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-left"
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label="Önceki banner"
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-right"
              onClick={() => goToSlide(activeIndex + 1)}
              aria-label="Sonraki banner"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      <div className="hero-carousel-dots" aria-label="Hero banner göstergeleri">
        {heroSlides.map((slide, index) => (
          <button
            key={`${slide.title}-dot-${index}`}
            type="button"
            className={`hero-carousel-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Ticker({ items }) {
  const announcements = normalizeAnnouncements(Array.isArray(items) && items.length ? items : defaultAnnouncements);
  const text = announcements.map(item => item.message).filter(Boolean).join(' • ');
  const clipRef = useRef(null);
  const trackRef = useRef(null);

  const renderSegments = () =>
    announcements.map((item, index) => (
      <React.Fragment key={item.id || index}>
        {index > 0 ? <span className="ticker-sep"> • </span> : null}
        <span
          className="ticker-item"
          style={{
            color: item.color || undefined,
            fontWeight: item.weight || 600
          }}
        >
          {item.message}
        </span>
      </React.Fragment>
    ));

  useLayoutEffect(() => {
    const clip = clipRef.current;
    const track = trackRef.current;
    if (!clip || !track) return;

    const segment = track.querySelector('.ticker-segment');
    if (!segment) return;

    const distance = Math.ceil(segment.getBoundingClientRect().width);
    const seconds = Math.max(14, distance / 42);
    track.style.setProperty('--ticker-shift', `-${distance}px`);
    track.style.setProperty('--ticker-duration', `${seconds}s`);
  }, [text, announcements]);

  return (
    <div className="ticker" role="region" aria-label="Duyurular">
      <div className="ticker-badge">
        <span className="ticker-pulse" aria-hidden="true" />
        <Megaphone size={13} aria-hidden="true" />
        <span>Duyuru</span>
      </div>
      <div className="ticker-clip" ref={clipRef}>
        <div className="ticker-fade ticker-fade-left" aria-hidden="true" />
        <div className="ticker-fade ticker-fade-right" aria-hidden="true" />
        <div className="ticker-marquee" ref={trackRef} aria-live="polite">
          <span className="ticker-segment">{renderSegments()}</span>
          <span className="ticker-segment" aria-hidden="true">
            {renderSegments()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ServicesPage({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const homeCards = normalizeHomeCards(content.homeCards);
  const services = state.settings.services || defaultServices;
  const selectedService = state.selectedService || services[0];
  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="HİZMETLER"
      subtitle="Modern alanlar, premium eğitimler ve net kategoriler."
      content={
        <>
        <div className="route-card-grid card-grid-4">
            {services.map(service => (
              <ServiceCardButton
                key={service.title}
                service={service}
                selected={selectedService?.title === service.title}
                onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
              />
            ))}
          </div>
          <SelectedServiceCard service={selectedService} config={homeCards.selectedService} />
        </>
      }
      backTo="/"
    />
  );
}

function PackagesPage({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const homeCards = normalizeHomeCards(content.homeCards);
  const packages = state.settings.packages || defaultPackages;
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="PAKETLER"
      subtitle="Temiz görünüm, net fiyatlar, kolay seçim."
      content={
        <>
          <div className="route-card-grid card-grid-4">
            {packages.map(item => (
              <PackageCard
                key={item.title}
                item={item}
                selected={selectedPackage?.title === item.title}
                showCta={false}
                onSelect={() => setState(prev => ({ ...prev, selectedPackage: item }))}
              />
            ))}
          </div>
          <SelectedPackageCard pkg={selectedPackage} config={homeCards.selectedPackage} compact />
        </>
      }
      backTo="/"
    />
  );
}

function MembershipModal({ open, onClose, whatsappNumber }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
  }, [open]);

  if (!open) return null;

  const updateField = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!firstName || !lastName || !email || !phone) {
      setError('Lütfen ad, soyad, e-posta ve telefon bilgilerini doldurun.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    const whatsappUrl = buildMembershipWhatsAppUrl(whatsappNumber, { firstName, lastName, email, phone });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="modal-backdrop membership-modal-backdrop" onClick={onClose}>
      <div className="membership-modal" role="dialog" aria-label="Üyelik formu" onClick={event => event.stopPropagation()}>
        <div className="membership-modal-head">
          <div>
            <span>Üyelik</span>
            <strong>Üye Ol</strong>
          </div>
          <button type="button" className="membership-modal-close" onClick={onClose} aria-label="Kapat">
            <X size={16} />
          </button>
        </div>
        <p className="membership-modal-note">Bilgilerinizi girin, WhatsApp üzerinden üyelik için yönlendirileceksiniz.</p>
        <form className="contact-form membership-modal-form" onSubmit={handleSubmit}>
          <div className="contact-form-grid">
            <label>
              Ad
              <input type="text" placeholder="Adınız" value={form.firstName} onChange={updateField('firstName')} />
            </label>
            <label>
              Soyad
              <input type="text" placeholder="Soyadınız" value={form.lastName} onChange={updateField('lastName')} />
            </label>
          </div>
          <label>
            E-posta
            <input type="email" placeholder="ornek@mail.com" value={form.email} onChange={updateField('email')} />
          </label>
          <label>
            Telefon
            <input type="tel" placeholder="05XX XXX XX XX" value={form.phone} onChange={updateField('phone')} />
          </label>
          {error ? <p className="contact-form-error">{error}</p> : null}
          <button className="primary-button contact-submit" type="submit">
            WhatsApp&apos;a Gönder
          </button>
        </form>
      </div>
    </div>
  );
}

function ExplorePage({ state, setState }) {
  const facilities = state.settings.facilityAreas || defaultFacilityAreas;
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="SALONU KEŞFET"
      subtitle="Tesisimizi alan alan keşfedin. Görseller ve videolar yakında güncellenecek."
      content={
        <>
          <div className="explore-toolbar">
            <button type="button" className="explore-home-btn" onClick={() => navigateToPath('/')}>
              <Home size={16} />
              Ana Sayfa
            </button>
          </div>
          <div className="explore-grid">
            {facilities.map(area => (
              <article key={area.title} className="explore-card">
                <div className="explore-media">
                  <img src={area.image} alt={area.title} loading="lazy" />
                  <div className="card-overlay" />
                  <span className="explore-tag">{area.tag}</span>
                  {area.video ? (
                    <button type="button" className="explore-play-btn" onClick={() => setActiveVideo(area)}>
                      <Play size={14} />
                      Videoyu İzle
                    </button>
                  ) : area.tag === 'Video Yakında' ? (
                    <span className="explore-media-badge explore-media-badge-soon">
                      <Video size={13} />
                      Video Yakında
                    </span>
                  ) : (
                    <span className="explore-media-badge">
                      <Image size={13} />
                      Görsel
                    </span>
                  )}
                </div>
                <div className="explore-body">
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </div>
              </article>
            ))}
          </div>
          {activeVideo ? (
            <div className="explore-video-modal" role="dialog" aria-label="Video önizleme">
              <div className="explore-video-card">
                <div className="explore-video-head">
                  <strong>{activeVideo.title}</strong>
                  <button type="button" onClick={() => setActiveVideo(null)} aria-label="Kapat">
                    <X size={16} />
                  </button>
                </div>
                <div className="explore-video-frame">
                  <iframe
                    src={activeVideo.video}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          ) : null}
        </>
      }
      backTo="/"
    />
  );
}

function ContactPage({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const updateField = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!firstName || !lastName || !email || !phone) {
      setError('Lütfen ad, soyad, e-posta ve telefon bilgilerini doldurun.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    const whatsappUrl = buildMembershipWhatsAppUrl(content.whatsapp?.number, {
      firstName,
      lastName,
      email,
      phone
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="İLETİŞİM"
      subtitle="Bilgilerinizi bırakın, WhatsApp üzerinden üyelik için sizi yönlendirelim."
      content={
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-grid">
            <label>
              Ad
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="Adınız"
                value={form.firstName}
                onChange={updateField('firstName')}
              />
            </label>
            <label>
              Soyad
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Soyadınız"
                value={form.lastName}
                onChange={updateField('lastName')}
              />
            </label>
          </div>
          <label>
            E-posta
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={updateField('email')}
            />
          </label>
          <label>
            Telefon
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="05XX XXX XX XX"
              value={form.phone}
              onChange={updateField('phone')}
            />
          </label>
          {error ? <p className="contact-form-error">{error}</p> : null}
          <button className="primary-button contact-submit" type="submit">
            ÜYE OL
          </button>
          <p className="contact-form-note">
            Üye Ol butonuna bastığınızda bilgileriniz hazır mesaj olarak WhatsApp&apos;a yönlendirilir.
          </p>
        </form>
      }
      backTo="/"
    />
  );
}

function GalleryPage({ state, setState }) {
  const gallery = state.settings.gallery || defaultGallery;
  const categories = state.settings.galleryCategories || defaultGalleryCategories;
  const grouped = groupGalleryByCategory(gallery, categories);
  const [activeItem, setActiveItem] = useState(null);

  const openItem = item => {
    const data = normalizeGalleryItem(item);
    trackSiteClick(`gallery:${data.title}`);
    setActiveItem(item);
  };

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="GALERİ"
      subtitle="Görseller, videolar ve etkinlikler."
      content={
        <>
          {Object.entries(grouped).map(([category, items]) => (
            items.length ? (
              <section key={category} className="gallery-section-block">
                <h3 className="gallery-section-title">{category}</h3>
                <div className="route-card-grid card-grid-4 card-grid-gallery">
                  {items.map(item => (
                    <GalleryCard
                      key={normalizeGalleryItem(item).id}
                      item={item}
                      category={category}
                      interactive
                      onClick={() => openItem(item)}
                    />
                  ))}
                </div>
              </section>
            ) : null
          ))}
          <MediaLightbox item={activeItem} onClose={() => setActiveItem(null)} />
        </>
      }
      backTo="/"
    />
  );
}

function DesktopShell({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const stats = normalizeStats(content.stats || defaultContent.stats);
  const homeCards = normalizeHomeCards(content.homeCards);
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const gallery = state.settings.gallery || defaultGallery;
  const homeServices = featuredOrAll(services, 8);
  const homePackages = featuredOrAll(packages, 8);
  const homeGallery = featuredOrAll(gallery, 8);
  const bannerSlides = content.bannerSlides || defaultContent.bannerSlides || [];
  const heroSlides = bannerSlides.length
    ? bannerSlides
    : [{ title: content.hero?.title || defaultContent.hero.title, subtitle: content.hero?.subtitle || defaultContent.hero.subtitle, image: content.hero?.image || defaultContent.hero.image }];
  const selectedService = state.selectedService || services[0];
  const selectedPackage = state.selectedPackage || packages[0];
  const [activeGalleryItem, setActiveGalleryItem] = useState(null);

  return (
    <div className={`app-shell desktop-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className="desktop-header">
          <div className="shell-width desktop-header-inner">
            <div className="header-left-group">
              <MenuToggle
                open={state.drawerOpen}
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              />
              <Brand />
            </div>
            <nav className="desktop-nav" aria-label="Ana menü">
              {desktopNav.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className="desktop-nav-link"
                  onClick={() => (item.route ? navigateToPath(item.route) : scrollToSection(item.id))}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <HeaderActions
              darkMode={state.darkMode}
              onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
            />
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className="shell-width desktop-page">
        <section className="desktop-home-hero section-block" id="home">
          <HeroCarousel slides={heroSlides} />
          <div className="desktop-hero-cta-row">
            <HeroButtons
              compact
              onPrimary={() => navigateToPath('/contact')}
              onSecondary={() => navigateToPath('/explore')}
            />
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLERİMİZ"
            subtitle="Modern alanlar, premium eğitimler ve net kategoriler."
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/services')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-row card-grid-4">
            {homeServices.map(service => (
              <ServiceCardButton
                key={service.title}
                service={service}
                selected={selectedService?.title === service.title}
                onClick={() => {
                  trackSiteClick(`service:${service.title}`);
                  setState(prev => ({ ...prev, selectedService: service }));
                }}
              />
            ))}
          </div>

          <SelectedServiceCard
            service={selectedService}
            config={homeCards.selectedService}
            showButton
            onButtonClick={() => scrollToSection('packages')}
          />
        </section>

        <section className="section-block" id="packages">
          <SectionHeader
            title="PAKETLER"
            subtitle="Temiz görünüm, net fiyatlar, kolay seçim."
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/packages')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="package-grid card-grid-4">
            {homePackages.map(item => (
              <PackageCard
                key={item.title}
                item={item}
                selected={selectedPackage?.title === item.title}
                onSelect={() => setState(prev => ({ ...prev, selectedPackage: item }))}
                onCtaClick={(_, pkg) => trackSiteClick(`package:${pkg.title}`)}
              />
            ))}
          </div>

          <SelectedPackageCard pkg={selectedPackage} config={homeCards.selectedPackage} compact />
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader
            title="GALERİ"
            subtitle="Tesis, antrenman ve premium atmosfer kareleri."
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/gallery')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="card-grid-4 card-grid-gallery">
            {homeGallery.map(item => (
              <GalleryCard
                key={normalizeGalleryItem(item).id}
                item={item}
                interactive
                onClick={() => {
                  trackSiteClick(`gallery-home:${normalizeGalleryItem(item).title}`);
                  setActiveGalleryItem(item);
                }}
              />
            ))}
          </div>
        </section>

        <StatsGrid stats={stats} />

        <section className="feature-bar">
          {['Esnek Üyelik', '7/24 Destek', 'Güvenli Ödeme', 'Uzman Eğitmenler'].map(item => (
            <span key={item}>
              <BadgeInfo size={14} />
              {item}
            </span>
          ))}
        </section>
      </main>

      <AssistantChat
        mobile={false}
        content={content}
        packages={packages}
        announcements={state.settings.announcements}
      />

      <MediaLightbox item={activeGalleryItem} onClose={() => setActiveGalleryItem(null)} />

      {state.drawerOpen ? (
        <div className="side-drawer">
          <button
            type="button"
            className="drawer-close"
            onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
          >
            <X size={18} />
          </button>
          <Brand compact />
          <div className="drawer-links">
            {desktopNav.map(item => (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {state.adminOpen ? (
        <AdminDashboard
          state={state}
          setState={setState}
          onClose={() => setState(prev => ({ ...prev, adminOpen: false }))}
        />
      ) : null}
    </div>
  );
}

function MobileShell({ state, setState }) {
  const pathname = usePathname();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState(null);
  const content = state.settings.content || defaultContent;
  const stats = normalizeStats(content.stats || defaultContent.stats);
  const homeCards = normalizeHomeCards(content.homeCards);
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const gallery = state.settings.gallery || defaultGallery;
  const homeServices = featuredOrAll(services, 8);
  const homePackages = featuredOrAll(packages, 6);
  const homeGallery = featuredOrAll(gallery, 8);
  const bannerSlides = content.bannerSlides || defaultContent.bannerSlides || [];
  const heroSlides = bannerSlides.length
    ? bannerSlides
    : [{ title: content.hero?.title || defaultContent.hero.title, subtitle: content.hero?.subtitle || defaultContent.hero.subtitle, image: content.hero?.image || defaultContent.hero.image }];
  const serviceLoop = homeServices.length > 1 ? [...homeServices, ...homeServices] : homeServices;
  const selectedService = state.selectedService || services[0];
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <div className={`app-shell mobile-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className="mobile-header">
          <div className="mobile-header-inner shell-width">
            <div className="header-left-group">
              <MenuToggle
                open={state.drawerOpen}
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              />
              <Brand compact />
            </div>
            <HeaderActions
              darkMode={state.darkMode}
              onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
              mobile
            />
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className="shell-width mobile-page mobile-main">
        <section className="mobile-hero" id="home">
          <HeroCarousel slides={heroSlides} mobile />
          <div className="mobile-hero-cta-row">
            <HeroButtons
              compact
              onPrimary={() => setJoinModalOpen(true)}
              onSecondary={() => navigateToPath('/explore')}
            />
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLER"
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/services')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-carousel">
            <div className="service-carousel-viewport">
              <div className="service-carousel-track service-carousel-loop">
                {serviceLoop.map((service, index) => (
                  <ServiceCardButton
                    key={`${service.title}-${index}`}
                    service={service}
                    compact
                    mini
                    selected={selectedService?.title === service.title}
                    onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <ServiceAutoScroller />
          <SelectedServiceCard
            service={selectedService}
            config={homeCards.selectedService}
            showButton
            onButtonClick={() => navigateToPath('/packages')}
          />
        </section>

        <section className="section-block" id="packages">
          <SectionHeader
            title="PAKETLER"
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/packages')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="package-rail-mobile mobile-horizontal-rail package-auto-scroll">
            {homePackages.map(item => (
              <PackageCard
                key={item.title}
                item={item}
                compact
                selected={selectedPackage?.title === item.title}
                onSelect={() => setState(prev => ({ ...prev, selectedPackage: item }))}
                onCtaClick={() => trackSiteClick(`package:${normalizePackage(item).title}`)}
              />
            ))}
          </div>
          <PackageAutoScroller />
          <SelectedPackageCard pkg={selectedPackage} config={homeCards.selectedPackage} compact />
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader
            title="GALERİ"
            subtitle="Tesis, antrenman ve premium atmosfer kareleri."
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/gallery')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="card-grid-4 card-grid-gallery card-grid-gallery-mobile">
            {homeGallery.map(item => (
              <GalleryCard
                key={normalizeGalleryItem(item).id}
                item={item}
                interactive
                compact
                onClick={() => {
                  trackSiteClick(`gallery-home:${normalizeGalleryItem(item).title}`);
                  setActiveGalleryItem(item);
                }}
              />
            ))}
          </div>
        </section>

        <StatsGrid stats={stats} mobile />

        <section className="feature-bar feature-bar-mobile">
          {['Esnek Üyelik', '7/24 Destek', 'Güvenli Ödeme', 'Uzman Eğitmenler'].map(item => (
            <span key={item}>
              <BadgeInfo size={14} />
              {item}
            </span>
          ))}
        </section>
      </main>

      <nav className="bottom-nav mobile-bottom-nav" aria-label="Alt menü">
        <button type="button" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`} onClick={() => navigateToPath('/')}>
          <Home size={18} />
          <span>Ana Sayfa</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/services' ? 'active' : ''}`} onClick={() => navigateToPath('/services')}>
          <Dumbbell size={18} />
          <span>Hizmetler</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/gallery' ? 'active' : ''}`} onClick={() => navigateToPath('/gallery')}>
          <Image size={18} />
          <span>Galeri</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/packages' ? 'active' : ''}`} onClick={() => navigateToPath('/packages')}>
          <Package size={18} />
          <span>Paketler</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/contact' ? 'active' : ''}`} onClick={() => navigateToPath('/contact')}>
          <Phone size={18} />
          <span>İletişim</span>
        </button>
      </nav>

      <AssistantChat
        mobile
        content={content}
        packages={packages}
        announcements={state.settings.announcements}
      />

      <MediaLightbox item={activeGalleryItem} onClose={() => setActiveGalleryItem(null)} />

      <AppDrawer
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        pathname={pathname}
      />

      <MembershipModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        whatsappNumber={content.whatsapp?.number}
      />

      {state.adminOpen ? (
        <AdminDashboard
          state={state}
          setState={setState}
          onClose={() => setState(prev => ({ ...prev, adminOpen: false }))}
        />
      ) : null}
    </div>
  );
}

function ServiceAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.service-carousel-viewport');
    if (!rail) return undefined;
    const firstCard = rail.querySelector('.service-card-mini');
    if (!firstCard) return undefined;
    const stepSize = firstCard.getBoundingClientRect().width + 12;
    const halfWidth = rail.scrollWidth / 2;
    const intervalId = window.setInterval(() => {
      const nextLeft = rail.scrollLeft + stepSize;
      if (nextLeft >= halfWidth - stepSize) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      rail.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

function HeroAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.hero-banner-track');
    if (!rail) return undefined;
    let frameId;
    let direction = 0.85;
    let lastTick = 0;

    const tick = timestamp => {
      if (!lastTick) lastTick = timestamp;
      const elapsed = timestamp - lastTick;
      if (elapsed >= 16) {
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        if (maxScroll > 0) {
          rail.scrollLeft += direction;
          if (rail.scrollLeft <= 0) direction = 0.85;
          if (rail.scrollLeft >= maxScroll) direction = -0.85;
        }
        lastTick = timestamp;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return null;
}

function PackageAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.package-auto-scroll');
    if (!rail) return undefined;
    let frameId;
    let direction = -0.4;

    const tick = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll > 0) {
        rail.scrollLeft += direction;
        if (rail.scrollLeft <= 0) direction = 0.4;
        if (rail.scrollLeft >= maxScroll) direction = -0.4;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return null;
}

function GalleryAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.gallery-carousel-viewport');
    if (!rail) return undefined;
    const firstCard = rail.querySelector('.gallery-card-mini');
    if (!firstCard) return undefined;
    const stepSize = firstCard.getBoundingClientRect().width + 12;
    const halfWidth = rail.scrollWidth / 2;
    const intervalId = window.setInterval(() => {
      const nextLeft = rail.scrollLeft + stepSize;
      if (nextLeft >= halfWidth - stepSize) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      rail.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

function useSectionPath(pathname) {
  const isServices = pathname === '/services';
  const isPackages = pathname === '/packages';
  const isGallery = pathname === '/gallery';
  const isContact = pathname === '/contact';
  const isExplore = pathname === '/explore';
  return { isServices, isPackages, isGallery, isContact, isExplore };
}

export default function App() {
  const [state, setState] = useAppData();
  const isMobile = useMemo(() => state.viewportWidth < 980, [state.viewportWidth]);
  const pathname = usePathname();
  const sectionPath = useSectionPath(pathname);

  useAnalytics(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    const theme = state.settings.content?.theme;
    const content = state.settings.content;
    applySiteTheme(theme, { darkMode: state.darkMode });
    applySiteSeo(content?.seo, content?.brand);
  }, [state.settings.content?.theme, state.settings.content?.seo, state.settings.content?.brand, state.darkMode]);

  useEffect(() => {
    const isLight = !state.darkMode;
    document.documentElement.style.minHeight = '100dvh';
    document.documentElement.style.width = '100%';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.minHeight = '100dvh';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overscrollBehaviorY = 'auto';
    document.body.style.touchAction = 'pan-y';
    if (!state.settings.content?.theme) {
      document.documentElement.classList.toggle('theme-light', isLight);
    }
  }, [state.darkMode, state.settings.content?.theme]);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <Brand />
        <div className="loading-bar" />
      </div>
    );
  }

  if (sectionPath.isServices) {
    return <ServicesPage state={state} setState={setState} />;
  }

  if (sectionPath.isPackages) {
    return <PackagesPage state={state} setState={setState} />;
  }

  if (sectionPath.isGallery) {
    return <GalleryPage state={state} setState={setState} />;
  }

  if (sectionPath.isContact) {
    return <ContactPage state={state} setState={setState} />;
  }

  if (sectionPath.isExplore) {
    return <ExplorePage state={state} setState={setState} />;
  }

  return isMobile ? <MobileShell state={state} setState={setState} /> : <DesktopShell state={state} setState={setState} />;
}