import React from 'react';
import { City, Topic, ChecklistStage } from './types';

// Icons for Topics
const UniversityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 18.783V21l-9-5-9 5v-2.217c0-2.656 2.236-4.815 5-4.815a5.5 5.5 0 011 .123v-2.123z" /></svg>
);
const AccommodationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const VisaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
);
const DailyLifeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const TransportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
);
const LanguageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13l4-4M19 17v.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16l-2.083-2.083a4 4 0 00-5.834 0L5 21z" />
    </svg>
);
const FoodIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1-4v-4a2 2 0 00-2-2h-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5l7 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5h.01M18 8h.01" />
    </svg>
);


// List of selectable cities in Italy
export const CITIES: City[] = [
  { id: 'milan', name: 'Milano', coords: { x: 45.5, y: 15.0 }, description: 'Moda ve finansın kalbi, dinamik bir öğrenci hayatı sunuyor.', region: 'Lombardy', population: 1400000, imageUrl: 'https://images.unsplash.com/photo-1516336168172-e3093223b2b3?q=80&w=800&auto=format&fit=crop' },
  { id: 'turin', name: 'Torino', coords: { x: 37.0, y: 15.8 }, description: 'Alplerin eteğinde, otomotiv ve inovasyonun merkezi.', region: 'Piedmont', population: 870000, imageUrl: 'https://images.unsplash.com/photo-1555314158-9531a758782f?q=80&w=800&auto=format&fit=crop' },
  { id: 'genoa', name: 'Cenova', coords: { x: 42.0, y: 28.0 }, description: "İtalya'nın en büyük limanına sahip, denizcilik tarihiyle zengin, canlı bir şehir.", region: 'Liguria', population: 580000, imageUrl: 'https://images.unsplash.com/photo-1620701779955-c70e307d0f97?q=80&w=800&auto=format&fit=crop' },
  { id: 'venice', name: 'Venedik', coords: { x: 58.0, y: 13.5 }, description: 'Kanallarıyla ünlü, sanat ve tarihle iç içe eşsiz bir deneyim.', region: 'Veneto', population: 260000, imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop' },
  { id: 'padua', name: 'Padova', coords: { x: 56.0, y: 15.5 }, description: "Galileo'nun ders verdiği, dünyanın en eski üniversitelerinden birine sahip, Venedik'e komşu canlı bir şehir.", region: 'Veneto', population: 210000, imageUrl: 'https://images.unsplash.com/photo-1601042599684-2454b574a44f?q=80&w=800&auto=format&fit=crop' },
  { id: 'bologna', name: 'Bologna', coords: { x: 54.5, y: 26.0 }, description: "Avrupa'nın en eski üniversitesine ev sahipliği yapan öğrenci şehri.", region: 'Emilia-Romagna', population: 395000, imageUrl: 'https://images.unsplash.com/photo-1590823501178-a0a65c814dc8?q=80&w=800&auto=format&fit=crop' },
  { id: 'pisa', name: 'Pisa', coords: { x: 49.0, y: 35.0 }, description: "Eğik Kulesi'yle ünlü, köklü bir üniversite geleneğine sahip tarihi bir öğrenci şehri.", region: 'Tuscany', population: 90000, imageUrl: 'https://images.unsplash.com/photo-1596378440229-a99f19313264?q=80&w=800&auto=format&fit=crop' },
  { id: 'florence', name: 'Floransa', coords: { x: 54.0, y: 34.0 }, description: "Rönesans'ın beşiği, sanat ve mimari tutkunları için bir cennet.", region: 'Tuscany', population: 380000, imageUrl: 'https://images.unsplash.com/photo-1528114498142-4f3542247157?q=80&w=800&auto=format&fit=crop' },
  { id: 'siena', name: 'Siena', coords: { x: 55.0, y: 38.0 }, description: 'Orta Çağ atmosferini koruyan, Palio at yarışlarıyla ünlü, butik ve kaliteli bir eğitim sunan şehir.', region: 'Tuscany', population: 54000, imageUrl: 'https://images.unsplash.com/photo-1589178164346-2c5e55716c5c?q=80&w=800&auto=format&fit=crop' },
  { id: 'perugia', name: 'Perugia', coords: { x: 58.0, y: 40.0 }, description: "İtalya'nın yeşil kalbi Umbria'da yer alan, çikolatası ve yabancılar için üniversitesiyle ünlü tarihi bir şehir.", region: 'Umbria', population: 165000, imageUrl: 'https://images.unsplash.com/photo-1579294951199-a9a3f787163c?q=80&w=800&auto=format&fit=crop' },
  { id: 'rome', name: 'Roma', coords: { x: 59.5, y: 46.5 }, description: 'Tarihin modern yaşamla buluştuğu ölümsüz şehir.', region: 'Lazio', population: 2800000, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop' },
  { id: 'naples', name: 'Napoli', coords: { x: 69.0, y: 57.5 }, description: "Canlı sokakları ve lezzetli pizzalarıyla Güney İtalya'nın ruhu.", region: 'Campania', population: 960000, imageUrl: 'https://images.unsplash.com/photo-1589923233860-31a83f905a5a?q=80&w=800&auto=format&fit=crop' },
  { id: 'cagliari', name: 'Cagliari', coords: { x: 44.0, y: 70.0 }, description: 'Sardinya adasının başkenti, tarih ve doğal güzelliklerin birleşimi.', region: 'Sardinia', population: 154000, imageUrl: 'https://images.unsplash.com/photo-1620042186938-f3d320986b24?q=80&w=800&auto=format&fit=crop' },
  { id: 'palermo', name: 'Palermo', coords: { x: 63.0, y: 82.0 }, description: "Kültürlerin kesişim noktası, Akdeniz'in sıcak ve renkli yüzü.", region: 'Sicily', population: 650000, imageUrl: 'https://images.unsplash.com/photo-1582264249213-5006b537c35a?q=80&w=800&auto=format&fit=crop' },
];

// List of consultation topics
export const TOPICS: Topic[] = [
  { 
    id: 'universities', 
    name: 'Üniversiteler', 
    icon: <UniversityIcon />,
    subTopics: [
      { id: 'reputation', name: 'Akademik İtibar' },
      { id: 'social-life', name: 'Kampüs Hayatı' },
      { id: 'tuition-fees', name: 'Eğitim Ücretleri' },
    ]
  },
  { 
    id: 'accommodation', 
    name: 'Konaklama', 
    icon: <AccommodationIcon />,
    subTopics: [
      { id: 'cost', name: 'Maliyet' },
      { id: 'availability', name: 'Bulunabilirlik' },
      { id: 'dorm-quality', name: 'Yurt Kalitesi' },
    ]
  },
  { 
    id: 'visa', 
    name: 'Vize ve İzinler', 
    icon: <VisaIcon />,
    subTopics: [
        { id: 'ease-of-application', name: 'Başvuru Kolaylığı' },
        { id: 'processing-time', name: 'İşlem Süresi' },
        { id: 'part-time-work', name: 'Çalışma İzni' },
    ]
  },
  { 
    id: 'daily-life', 
    name: 'Yaşam', 
    icon: <DailyLifeIcon />,
    subTopics: [
      { id: 'cost-of-living', name: 'Yaşam Giderleri' },
      { id: 'public-transport', name: 'Toplu Taşıma' },
      { id: 'student-safety', name: 'Güvenlik' },
    ]
  },
  { 
    id: 'transport', 
    name: 'Şehir İçi Ulaşım', 
    icon: <TransportIcon />,
    subTopics: [
      { id: 'networks', name: 'Ulaşım Ağları (Metro, Otobüs)' },
      { id: 'student-pass', name: 'Öğrenci Abonmanları ve İndirimler' },
      { id: 'costs', name: 'Bilet Fiyatları ve Satış Noktaları' },
    ]
  },
  { 
    id: 'language', 
    name: 'Dil Öğrenme', 
    icon: <LanguageIcon />,
    subTopics: [
      { id: 'apps-resources', name: 'Uygulamalar ve Kaynaklar' },
      { id: 'practice-tips', name: 'Pratik Yapma İpuçları' },
      { id: 'basic-phrases', name: 'Temel İfadeler' },
    ]
  },
  { 
    id: 'food', 
    name: 'Mutfak', 
    icon: <FoodIcon />,
    subTopics: [
      { id: 'affordability', name: 'Uygun Fiyatlılık' },
      { id: 'variety', name: 'Çeşitlilik' },
      { id: 'student-spots', name: 'Öğrenci Mekanları' },
    ]
  },
];

export const CHECKLIST_STAGES: ChecklistStage[] = [
  {
    title: '1. Araştırma ve Karar',
    items: [
      { id: 'select_uni', text: 'Üniversite ve bölüm seçimi yapıldı.' },
      { id: 'take_exams', text: 'Gerekli sınavlara (IELTS/TOLC vb.) girildi ve sonuçlar alındı.' },
      { id: 'research_scholarships', text: 'Burs imkanları araştırıldı ve başvuru şartları öğrenildi.' },
    ],
  },
  {
    title: '2. Başvuru Belgeleri',
    items: [
      { id: 'prepare_sop', text: 'Niyet mektubu (Statement of Purpose) hazırlandı.' },
      { id: 'update_cv', text: 'CV (Özgeçmiş) güncellendi.' },
      { id: 'get_references', text: 'Referans mektupları talep edildi ve alındı.' },
      { id: 'check_passport', text: 'Pasaportun geçerlilik süresi kontrol edildi (en az 1 yıl). ' },
    ],
  },
  {
    title: '3. Üniversite Başvurusu',
    items: [
      { id: 'universitaly_preapp', text: 'Universitaly portalından ön başvuru yapıldı.' },
      { id: 'uni_portal_app', text: 'Seçilen üniversitenin kendi portalından başvuru tamamlandı.' },
      { id: 'pay_fee', text: 'Başvuru ücreti ödendi.' },
      { id: 'get_acceptance', text: 'Kabul mektubu (Letter of Acceptance) alındı.' },
    ],
  },
  {
    title: '4. Denklik ve Vize',
    items: [
      { id: 'apply_dov', text: 'Diploma için Denklik (Dichiarazione di Valore) başvurusu yapıldı.' },
      { id: 'book_visa_appointment', text: 'Vize randevusu alındı.' },
      { id: 'gather_visa_docs', text: 'Vize için gerekli tüm belgeler toplandı (konaklama kanıtı, finansal yeterlilik vb.).' },
      { id: 'apply_visa', text: 'Vize başvurusu konsolosluğa/aracı kuruma yapıldı.' },
    ],
  },
  {
    title: '5. İtalya\'ya Hazırlık',
    items: [
      { id: 'buy_ticket', text: 'Uçak bileti satın alındı.' },
      { id: 'book_accommodation', text: 'İlk haftalar için geçici konaklama ayarlandı.' },
      { id: 'prepare_permesso_docs', text: 'Oturum izni (Permesso di Soggiorno) için gerekli belgeler hazırlandı.' },
      { id: 'get_tax_code', text: 'Codice Fiscale (Vergi Numarası) için hazırlık yapıldı.' },
    ],
  },
];


export const ITALY_LAND_PATH = "M339 0 l-10 15 -14 2 -6 10 -15 11h-16l-4 13 -13 6 -4 -13 -13 -6 -13 10 -10 -2 -14 -11 -3 -15 -12 -5 -10 10 -10 -2 -10 14 -13 -5 -9 15 -12 2 -4 13 -9 5 -12 -5 -9 17 -15 15 -7 18 2 11 -6 6 5 18 10 20 12 11 15 25 10 16 16 35 15 28 5 8 18 25 15 24 10 10 20 45 10 10 5 -5 10 -5 10 10 10 12 -3 15 10 2 10 -10 10 -10 8 5 -15 20 -25 2 -12 -12 -12 -4 -10 8 -20 10 -12 12 -2 15 10 22 -30 18 -10 18 15 12 25 2 15 -15 12 -2 -5 -15 -2 -10 10 -15 12 -10 10 -10 2 -10 -15 -10 -25 -20 -15 -12 -12 -10 -15 2 -15 -10 -12 10 -10 -15 -10 -10 -10 5 -10 -2 -15 10 -25 5 -10 -10 -20 -10 -35z M180 348 l-20 20 -10 30 -5 20 2 15 15 12 18 5 20 -2 15 -10 8 -20 -2 -15 -10 -20 -12 -18 -15 -12z M310 515 l-15 15 -35 8 -30 -5 -15 -15 -5 -20 10 -15 25 -5 30 5 20 10 10 15z";