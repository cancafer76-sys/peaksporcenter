import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Check, Instagram, Mail, X } from 'lucide-react';
import { normalizeTrainer } from '../shared/media.js';
import { navigateToPath } from './seo/nav.js';
import './coach-showcase.css';

function CoachImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <div className={`coach-showcase-placeholder ${className}`.trim()}>{alt?.charAt(0) || '?'}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function CoachCard({ coach, mini = false, onOpenDetails }) {
  const data = normalizeTrainer(coach);

  return (
    <article className={`coach-showcase-card ${mini ? 'coach-showcase-card-mini' : ''}`}>
      <div className="coach-showcase-media">
        <CoachImage src={data.image} alt={data.name} />
      </div>
      <div className="coach-showcase-body">
        <strong>{data.name}</strong>
        <span>{data.specialty}</span>
        <button type="button" className="coach-showcase-details-btn" onClick={() => onOpenDetails?.(data)}>
          Detayları Gör
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

export function CoachDetailModal({ coach, contact = {}, onClose }) {
  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  if (!coach) return null;

  const email = coach.email || contact.email || '';
  const instagram = coach.instagram || '';

  return (
    <div className="coach-detail-overlay" role="presentation" onClick={onClose}>
      <div
        className="coach-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${coach.name} detay`}
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="coach-detail-close" aria-label="Kapat" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="coach-detail-layout">
          <aside className="coach-detail-profile">
            <div className="coach-detail-profile-card">
              <div className="coach-detail-profile-media">
                <CoachImage src={coach.image} alt={coach.name} />
              </div>
              <strong>{coach.name}</strong>
              <span>{coach.specialty}</span>
              <div className="coach-detail-social">
                {instagram ? (
                  <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} aria-label="E-posta">
                    <Mail size={16} />
                  </a>
                ) : null}
              </div>
            </div>
          </aside>

          <div className="coach-detail-content">
            <section>
              <h3>HAKKINDA</h3>
              <p>{coach.experience || 'Detaylı bilgi yakında eklenecek.'}</p>
            </section>

            <section>
              <h3>UZMANLIK ALANLARI</h3>
              <ul>
                {coach.expertise.map(item => (
                  <li key={item}>
                    <Check size={15} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <button type="button" className="coach-detail-cta" onClick={() => navigateToPath('/iletisim')}>
              Randevu Al
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
