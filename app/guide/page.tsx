'use client';

import { useState } from 'react';

/* ─── Design tokens (mirrors TolLangitDashboard) ─────────────────────────── */
const C = {
  navy: '#001233',
  navyMid: '#001d4a',
  navyLight: '#0a2a5e',
  gold: '#b89a3e',
  goldBright: '#d4b254',
  goldPale: '#f0e0a8',
  white: '#ffffff',
  offWhite: '#f7f6f2',
  rule: '#ddd8cc',
  ruleDark: '#2a3f6a',
  body: '#2c2c2c',
  muted: '#6b7280',
  label: '#8a8a8a',
  positive: '#0a5c42',
  posBg: '#ecf7f2',
  blueBg: '#eff6ff',
  blue: '#1e3a8a',
  amber: '#92400e',
  ambBg: '#fffbeb',
};
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', 'Courier New', monospace";

/* ─── Content ─────────────────────────────────────────────────────────────── */
const CONTENT = {
  en: {
    nav_back: '← Back to Dashboard',
    ann: 'This guide is intended for prospective subscribers of TOL LANGIT algorithmic trading signals.',
    hero_eyebrow: 'Connection Guide',
    hero_title: 'How to Connect Directly to My Google Cloud Server',
    hero_subtitle:
      'A complete onboarding walkthrough for new subscribers. Follow each step in sequence to ensure correct configuration of your direct server connection.',
    hero_note:
      'Copying signals through a third-party relay introduces latency, wider effective spreads, and slower execution speed. For fast-moving instruments such as gold (XAUUSD), this degradation can materially affect trade outcomes. Connecting your MT5 account directly to the Google Cloud VPS eliminates this relay and ensures fills at the originating execution price.',
    steps: [
      {
        n: '01',
        title: 'Open an IC Markets MT5 RAW Account',
        subtitle: 'Register via the TOL LANGIT referral link',
        body: [
          'TOL LANGIT signals are published exclusively on IC Markets, an ASIC-regulated broker. To subscribe, you must hold a live MT5 Raw Spread account with IC Markets.',
          'Open your account using the referral link below. This ensures your account is correctly associated with our IB partner relationship, which is required for signal access and entitles you to commission rebates.',
        ],
        action_label: 'Open IC Markets Account',
        action_url: 'https://icmarkets.com/?camp=49934',
        action_note: 'Partner ID: 49934 · IC Markets (ASIC)',
        note_label: 'Important',
        note: 'Select MT5 as your trading platform and Raw Spread as your account type during registration. Standard and cTrader accounts are not compatible with the TOL LANGIT signal configuration.',
        details: [
          { label: 'Broker', value: 'IC Markets (International Capital Markets Pty Ltd)' },
          { label: 'Regulation', value: 'ASIC (Australian Securities & Investments Commission)' },
          { label: 'Platform', value: 'MetaTrader 5 (MT5)' },
          { label: 'Account Type', value: 'Raw Spread' },
          { label: 'Partner ID', value: '49934' },
        ],
      },
      {
        n: '02',
        title: 'Link Your Existing IC Markets Account to Our IB',
        subtitle: 'For existing IC Markets clients only',
        body: [
          'If you already hold an IC Markets account that was not opened through our referral link, you may still link it to our Introducing Broker (IB) partnership by submitting a formal request to IC Markets.',
          'Send an email from the address registered with your IC Markets account to both addresses below. IC Markets typically processes linking requests within 1–3 business days.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'IB Commission Structure',
        note: 'Once linked, TOL LANGIT receives a commission of USD $0.25 per lot from IC Markets. Additionally, subscribers benefit from a rebate of USD $1.00 per lot on all trades executed through the signal. This rebate is credited directly to your trading account.',
        email_block: {
          to: ['partners.apac@icmarkets.com', 'support@icmarkets.com'],
          cc: ['adithyo.wijaya@gmail.com'],
          subject: 'Request to Link Account to IB Partner ID 49934',
          body: 'Dear IC Markets Support,\n\nI would like to request the linking of my IC Markets trading account [your email / user login] to Introducing Broker Partner ID 49934.\n\nPlease confirm once the linkage has been completed.',
        },
        details: [
          { label: 'IB Commission (received by TOL LANGIT)', value: 'USD $0.25 / lot' },
          { label: 'Subscriber Rebate', value: 'USD $1.00 / lot (credited to your account)' },
          { label: 'Processing Time', value: '1–3 business days' },
        ],
      },
      {
        n: '03',
        title: 'Submit Your MT5 Credentials',
        subtitle: 'Provide your trading login for signal configuration',
        body: [
          'To configure copy-trading, you must provide your MT5 account login number and Master Password. This is distinct from your IC Markets client portal password.',
          'Your Master Password grants trading access to your account. It is used by the signal provider to subscribe your account to the MQL5 signal. Never share your Investor (read-only) password as it cannot be used to configure signal subscriptions.',
        ],
        action_label: 'Contact via Telegram',
        action_url: 'https://t.me/tol_langit',
        action_note: 'Telegram: @tol_langit',
        note_label: 'Security Notice',
        note: 'Your MT5 Master Password is transmitted only for the purpose of signal subscription on the MQL5 platform. TOL LANGIT does not retain, log, or store your credentials. If you are uncomfortable sharing your Master Password, you may instead configure the signal subscription manually within your MT5 terminal under Tools → Options → Signals.',
        details: [
          { label: 'Required: MT5 Login Number', value: 'Numeric account ID (e.g., 12345678)' },
          {
            label: 'Required: Master Password',
            value: 'Not the client portal or investor password',
          },
          { label: 'Server', value: 'ICMarketsSC-MT5-2 (or as shown in your MT5 terminal)' },
        ],
      },
      {
        n: '04',
        title: 'Subscribe to the MQL5 VPS (Recommended)',
        subtitle: 'Ensure uninterrupted signal execution',
        body: [
          'Copy-trading signals require your MT5 terminal to be online continuously. If your terminal is offline, open trades will not be mirrored and you may miss entries or exits.',
          "The MetaQuotes Virtual Private Server (VPS) service, hosted on Google Cloud infrastructure, ensures your MT5 terminal runs 24 hours a day, 7 days a week — independent of your personal computer's uptime.",
        ],
        action_label: 'View VPS Plans on MQL5',
        action_url: 'https://www.mql5.com/en/vps',
        action_note: 'Hosted on Google Cloud · MetaQuotes VPS',
        note_label: 'Recommended',
        note: 'The MQL5 VPS is the officially supported hosting environment for MT5 signal subscriptions. Third-party VPS providers may be used but require manual MT5 terminal installation and maintenance.',
        details: [
          { label: 'Monthly Plan', value: 'USD $39 / month' },
          { label: 'Semi-Annual Plan', value: 'USD $65 / 6 months (approx. $10.83/mo)' },
          { label: 'Annual Plan', value: 'USD $120 / year (approx. $10.00/mo)' },
          { label: 'Infrastructure', value: 'Google Cloud Platform' },
          { label: 'Availability', value: '99.9% uptime guarantee' },
        ],
      },
      {
        n: '05',
        title: 'Obtain Your MetaQuotes ID',
        subtitle: 'Required for VPS and signal management',
        body: [
          'Your MetaQuotes ID (MQID) is a unique identifier linked to your MT5 installation. It is required when activating the MQL5 VPS and for receiving signal notifications through the MetaQuotes messaging system.',
          'Retrieve your MetaQuotes ID directly from within your MT5 terminal.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'How to Find Your MetaQuotes ID',
        note: 'Open MetaTrader 5 on your device → navigate to Tools → Options → Messages tab. Your MetaQuotes ID is displayed at the top of this panel. It is a 9-digit numeric code.',
        details: [
          { label: 'Location', value: 'MT5 Terminal → Tools → Options → Messages' },
          { label: 'Format', value: '9-digit numeric code' },
          { label: 'Usage', value: 'VPS activation, signal notifications' },
        ],
      },
      {
        n: '06',
        title: 'Monitor Your Account',
        subtitle: 'Full transparency via public third-party verification',
        body: [
          'All TOL LANGIT strategies are independently verified on two public platforms — MQL5 and MyFXBook. These platforms provide real-time equity curves, verified trade histories, drawdown metrics, and profit factor data.',
          'You may monitor your copy-trading performance directly within your MT5 terminal or IC Markets client portal. All performance data shown on this dashboard is sourced directly from the live MyFXBook API.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'Passive Operation',
        note: 'Once configured, the signal operates fully autonomously. No manual trade intervention is required or recommended. Position sizing, stop-loss levels, and trade management are determined exclusively by the originating algorithm.',
        details: [
          { label: 'MQL5 Signal Verification', value: 'mql5.com/en/signals/2360336' },
          { label: 'MyFXBook Verification', value: 'myfxbook.com/members/adithyodw' },
          { label: 'Transparency', value: 'Full trade history, equity curve, live drawdown' },
          { label: 'Intervention Required', value: 'None — fully autonomous operation' },
        ],
      },
    ],
    faq_title: 'Frequently Asked Questions',
    faq_subtitle: 'Common queries from prospective subscribers',
    faqs: [
      {
        q: 'Do I retain full control of my trading account?',
        a: 'Yes. You retain complete ownership and control of your IC Markets account at all times. The signal subscription grants read access to mirror trades; it does not grant withdrawal access or account ownership.',
      },
      {
        q: 'Is there a minimum deposit requirement?',
        a: 'IC Markets requires a minimum deposit of USD $200 to open a Raw Spread account. However, for meaningful position sizing relative to the TOL LANGIT strategies, a balance of USD $1,000 or above is recommended.',
      },
      {
        q: 'Can I cancel the signal subscription at any time?',
        a: 'Yes. Signal subscriptions on MQL5 can be cancelled at any time directly from within your MT5 terminal without penalty or notice period.',
      },
      {
        q: 'What happens to open positions if I unsubscribe?',
        a: 'Existing open positions are not automatically closed upon unsubscription. You may close them manually at your discretion.',
      },
      {
        q: 'Is this service available in my country?',
        a: 'IC Markets is available to residents of most jurisdictions. Residents of the United States, Canada, and certain other jurisdictions may not be eligible due to regulatory restrictions. Please verify eligibility on the IC Markets website.',
      },
    ],
    footer_note:
      'This guide is provided for informational purposes. Trading in leveraged foreign exchange instruments carries significant risk of loss. Past performance of the TOL LANGIT strategies does not guarantee future results. Please ensure you understand the risks before subscribing.',
    footer_contact: 'For support: Telegram @tol_langit',
  },
  id: {
    nav_back: '← Kembali ke Dashboard',
    ann: 'Panduan ini ditujukan bagi calon pelanggan sinyal trading algoritmik TOL LANGIT.',
    hero_eyebrow: 'Panduan Koneksi',
    hero_title: 'Cara Terhubung Langsung ke Google Cloud Server Saya',
    hero_subtitle:
      'Panduan lengkap orientasi bagi pelanggan baru. Ikuti setiap langkah secara berurutan untuk memastikan konfigurasi koneksi langsung ke server Anda berjalan dengan benar.',
    hero_note:
      'Menyalin sinyal melalui relay pihak ketiga menyebabkan latensi, spread efektif yang lebih lebar, dan kecepatan eksekusi yang lebih lambat. Untuk instrumen yang bergerak cepat seperti emas (XAUUSD), penurunan kualitas ini dapat berdampak material pada hasil perdagangan. Menghubungkan akun MT5 Anda langsung ke VPS Google Cloud menghilangkan relay ini dan memastikan pengisian pada harga eksekusi asal.',
    steps: [
      {
        n: '01',
        title: 'Buka Akun IC Markets MT5 RAW',
        subtitle: 'Daftar melalui tautan referral TOL LANGIT',
        body: [
          'Sinyal TOL LANGIT diterbitkan eksklusif di IC Markets, broker berlisensi ASIC. Untuk berlangganan, Anda harus memiliki akun live MT5 Raw Spread di IC Markets.',
          'Buka akun Anda menggunakan tautan referral di bawah ini. Hal ini memastikan akun Anda terdaftar dengan benar di bawah kemitraan IB kami, yang diperlukan untuk akses sinyal dan memberikan hak atas rabat komisi.',
        ],
        action_label: 'Buka Akun IC Markets',
        action_url: 'https://icmarkets.com/?camp=49934',
        action_note: 'Partner ID: 49934 · IC Markets (ASIC)',
        note_label: 'Penting',
        note: 'Pilih MT5 sebagai platform trading dan Raw Spread sebagai tipe akun saat pendaftaran. Akun Standard dan cTrader tidak kompatibel dengan konfigurasi sinyal TOL LANGIT.',
        details: [
          { label: 'Broker', value: 'IC Markets (International Capital Markets Pty Ltd)' },
          { label: 'Regulasi', value: 'ASIC (Australian Securities & Investments Commission)' },
          { label: 'Platform', value: 'MetaTrader 5 (MT5)' },
          { label: 'Tipe Akun', value: 'Raw Spread' },
          { label: 'Partner ID', value: '49934' },
        ],
      },
      {
        n: '02',
        title: 'Hubungkan Akun IC Markets Anda ke IB Kami',
        subtitle: 'Hanya untuk klien IC Markets yang sudah ada',
        body: [
          'Jika Anda sudah memiliki akun IC Markets yang tidak dibuka melalui tautan referral kami, Anda tetap dapat menghubungkannya ke kemitraan Introducing Broker (IB) kami dengan mengajukan permintaan resmi ke IC Markets.',
          'Kirim email dari alamat yang terdaftar di akun IC Markets Anda ke kedua alamat berikut. IC Markets biasanya memproses permintaan penghubungan dalam 1–3 hari kerja.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'Struktur Komisi IB',
        note: 'Setelah dihubungkan, TOL LANGIT menerima komisi sebesar USD $0,25 per lot dari IC Markets. Selain itu, pelanggan mendapatkan rabat sebesar USD $1,00 per lot untuk semua perdagangan yang dilakukan melalui sinyal. Rabat ini dikreditkan langsung ke akun trading Anda.',
        email_block: {
          to: ['partners.apac@icmarkets.com', 'support@icmarkets.com'],
          cc: ['adithyo.wijaya@gmail.com'],
          subject: 'Permohonan Penghubungan Akun ke IB Partner ID 49934',
          body: 'Yth. Tim Dukungan IC Markets,\n\nSaya ingin meminta agar akun trading IC Markets saya [email / user login Anda] dihubungkan ke Introducing Broker Partner ID 49934.\n\nMohon konfirmasi setelah penghubungan selesai dilakukan.',
        },
        details: [
          { label: 'Komisi IB (diterima TOL LANGIT)', value: 'USD $0,25 / lot' },
          { label: 'Rabat Pelanggan', value: 'USD $1,00 / lot (dikreditkan ke akun Anda)' },
          { label: 'Waktu Proses', value: '1–3 hari kerja' },
        ],
      },
      {
        n: '03',
        title: 'Kirimkan Kredensial MT5 Anda',
        subtitle: 'Berikan login trading Anda untuk konfigurasi sinyal',
        body: [
          'Untuk mengonfigurasi copy-trading, Anda harus memberikan nomor login MT5 dan Master Password Anda. Ini berbeda dari password portal klien IC Markets Anda.',
          'Master Password Anda memberikan akses trading ke akun Anda. Ini digunakan oleh penyedia sinyal untuk mendaftarkan akun Anda ke sinyal MQL5. Jangan pernah memberikan Investor (read-only) password karena tidak dapat digunakan untuk mengonfigurasi langganan sinyal.',
        ],
        action_label: 'Hubungi via Telegram',
        action_url: 'https://t.me/tol_langit',
        action_note: 'Telegram: @tol_langit',
        note_label: 'Perhatian Keamanan',
        note: 'Master Password MT5 Anda hanya dikirimkan untuk keperluan langganan sinyal di platform MQL5. TOL LANGIT tidak menyimpan, mencatat, atau menyimpan kredensial Anda. Jika Anda tidak nyaman berbagi Master Password, Anda juga dapat mengonfigurasi langganan sinyal secara manual di terminal MT5 melalui Tools → Options → Signals.',
        details: [
          { label: 'Diperlukan: Nomor Login MT5', value: 'ID akun numerik (mis. 12345678)' },
          {
            label: 'Diperlukan: Master Password',
            value: 'Bukan password portal klien atau investor',
          },
          {
            label: 'Server',
            value: 'ICMarketsSC-MT5-2 (atau sesuai yang tertera di terminal MT5 Anda)',
          },
        ],
      },
      {
        n: '04',
        title: 'Berlangganan MQL5 VPS (Disarankan)',
        subtitle: 'Pastikan eksekusi sinyal tidak terputus',
        body: [
          'Sinyal copy-trading memerlukan terminal MT5 Anda untuk selalu online. Jika terminal Anda offline, perdagangan terbuka tidak akan dicerminkan dan Anda mungkin melewatkan entri atau exit.',
          'Layanan Virtual Private Server (VPS) MetaQuotes, yang dihosting di infrastruktur Google Cloud, memastikan terminal MT5 Anda berjalan 24 jam sehari, 7 hari seminggu — terlepas dari uptime komputer pribadi Anda.',
        ],
        action_label: 'Lihat Paket VPS di MQL5',
        action_url: 'https://www.mql5.com/en/vps',
        action_note: 'Dihosting di Google Cloud · MetaQuotes VPS',
        note_label: 'Disarankan',
        note: 'MQL5 VPS adalah lingkungan hosting yang didukung secara resmi untuk langganan sinyal MT5. Penyedia VPS pihak ketiga dapat digunakan tetapi memerlukan instalasi dan pemeliharaan terminal MT5 secara manual.',
        details: [
          { label: 'Paket Bulanan', value: 'USD $39 / bulan' },
          { label: 'Paket Semi-Tahunan', value: 'USD $65 / 6 bulan (sekitar $10,83/bln)' },
          { label: 'Paket Tahunan', value: 'USD $120 / tahun (sekitar $10,00/bln)' },
          { label: 'Infrastruktur', value: 'Google Cloud Platform' },
          { label: 'Ketersediaan', value: 'Jaminan uptime 99,9%' },
        ],
      },
      {
        n: '05',
        title: 'Dapatkan MetaQuotes ID Anda',
        subtitle: 'Diperlukan untuk VPS dan manajemen sinyal',
        body: [
          'MetaQuotes ID (MQID) Anda adalah pengenal unik yang terhubung ke instalasi MT5 Anda. Ini diperlukan saat mengaktifkan MQL5 VPS dan untuk menerima notifikasi sinyal melalui sistem pesan MetaQuotes.',
          'Ambil MetaQuotes ID Anda langsung dari dalam terminal MT5 Anda.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'Cara Menemukan MetaQuotes ID Anda',
        note: 'Buka MetaTrader 5 di perangkat Anda → navigasi ke Tools → Options → tab Messages. MetaQuotes ID Anda ditampilkan di bagian atas panel ini. Ini adalah kode numerik 9 digit.',
        details: [
          { label: 'Lokasi', value: 'Terminal MT5 → Tools → Options → Messages' },
          { label: 'Format', value: 'Kode numerik 9 digit' },
          { label: 'Kegunaan', value: 'Aktivasi VPS, notifikasi sinyal' },
        ],
      },
      {
        n: '06',
        title: 'Pantau Akun Anda',
        subtitle: 'Transparansi penuh melalui verifikasi pihak ketiga yang bersifat publik',
        body: [
          'Semua strategi TOL LANGIT diverifikasi secara independen di dua platform publik — MQL5 dan MyFXBook. Platform-platform ini menyediakan kurva ekuitas real-time, riwayat perdagangan yang terverifikasi, metrik drawdown, dan data profit factor.',
          'Anda dapat memantau kinerja copy-trading Anda langsung di terminal MT5 atau portal klien IC Markets. Semua data kinerja yang ditampilkan di dashboard ini bersumber langsung dari API MyFXBook yang aktif.',
        ],
        action_label: null,
        action_url: null,
        action_note: null,
        note_label: 'Operasi Pasif',
        note: 'Setelah dikonfigurasi, sinyal beroperasi sepenuhnya secara otonom. Tidak diperlukan atau disarankan intervensi perdagangan manual. Ukuran posisi, level stop-loss, dan manajemen perdagangan ditentukan sepenuhnya oleh algoritma asal.',
        details: [
          { label: 'Verifikasi Sinyal MQL5', value: 'mql5.com/en/signals/1083101' },
          { label: 'Verifikasi MyFXBook', value: 'myfxbook.com/members/adithyodw' },
          {
            label: 'Transparansi',
            value: 'Riwayat perdagangan penuh, kurva ekuitas, drawdown langsung',
          },
          { label: 'Intervensi Diperlukan', value: 'Tidak ada — operasi sepenuhnya otonom' },
        ],
      },
    ],
    faq_title: 'Pertanyaan yang Sering Diajukan',
    faq_subtitle: 'Pertanyaan umum dari calon pelanggan',
    faqs: [
      {
        q: 'Apakah saya tetap memiliki kendali penuh atas akun trading saya?',
        a: 'Ya. Anda tetap memiliki kepemilikan dan kendali penuh atas akun IC Markets Anda setiap saat. Langganan sinyal memberikan akses baca untuk mencerminkan perdagangan; tidak memberikan akses penarikan atau kepemilikan akun.',
      },
      {
        q: 'Apakah ada persyaratan deposit minimum?',
        a: 'IC Markets memerlukan deposit minimum USD $200 untuk membuka akun Raw Spread. Namun, untuk ukuran posisi yang bermakna relatif terhadap strategi TOL LANGIT, saldo USD $1.000 ke atas disarankan.',
      },
      {
        q: 'Bisakah saya membatalkan langganan sinyal kapan saja?',
        a: 'Ya. Langganan sinyal di MQL5 dapat dibatalkan kapan saja langsung dari terminal MT5 Anda tanpa penalti atau periode pemberitahuan.',
      },
      {
        q: 'Apa yang terjadi pada posisi terbuka jika saya berhenti berlangganan?',
        a: 'Posisi terbuka yang ada tidak otomatis ditutup saat berhenti berlangganan. Anda dapat menutupnya secara manual sesuai kebijaksanaan Anda.',
      },
      {
        q: 'Apakah layanan ini tersedia di negara saya?',
        a: 'IC Markets tersedia bagi penduduk sebagian besar yurisdiksi. Penduduk Amerika Serikat, Kanada, dan yurisdiksi tertentu lainnya mungkin tidak memenuhi syarat karena pembatasan regulasi. Harap verifikasi kelayakan di situs web IC Markets.',
      },
    ],
    footer_note:
      'Panduan ini disediakan untuk tujuan informasi. Perdagangan instrumen valuta asing berleverage membawa risiko kerugian yang signifikan. Kinerja masa lalu strategi TOL LANGIT tidak menjamin hasil di masa depan. Pastikan Anda memahami risikonya sebelum berlangganan.',
    footer_contact: 'Untuk dukungan: Telegram @tol_langit',
  },
};

/* ─── Small reusable components ──────────────────────────────────────────── */
function Icon({ d, size = 18 }: { d: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d}
    </svg>
  );
}

const ICON_PATHS = {
  arrow_left: <polyline points="19 12 5 12" />,
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </>
  ),
  terminal: (
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  question: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
};

const STEP_ICONS = [
  ICON_PATHS.external,
  ICON_PATHS.link,
  ICON_PATHS.terminal,
  ICON_PATHS.server,
  ICON_PATHS.activity,
  ICON_PATHS.eye,
];

export default function GuidePage() {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = CONTENT[lang];

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEmail(key);
      setTimeout(() => setCopiedEmail(null), 2000);
    });
  }

  return (
    <div style={{ fontFamily: SANS, background: C.offWhite, minHeight: '100vh', color: C.body }}>
      <style>{`
        /* ─── TOL LANGIT Guide — Responsive Layout ─── */
        .tlg-brand-subtitle { display: block; }
        .tlg-nav-back-label { display: inline; }

        @media (max-width: 767px) {
          .tlg-nav         { padding: 0 16px !important; }
          .tlg-nav-right   { gap: 10px !important; }
          .tlg-hero        { padding: 36px 20px 44px !important; }
          .tlg-steps       { padding: 36px 20px !important; }
          .tlg-step-badge  { width: 44px !important; }
          .tlg-step-body   { padding-left: 14px !important; }
          .tlg-detail-row  {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 3px !important;
            padding: 10px 14px !important;
          }
          .tlg-detail-label { min-width: unset !important; }
          .tlg-faq         { padding: 40px 20px !important; }
          .tlg-footer      { padding: 24px 16px !important; }
        }

        @media (max-width: 479px) {
          .tlg-brand-subtitle { display: none; }
          .tlg-nav-back-label { display: none; }
          .tlg-step-badge     { width: 36px !important; }
          .tlg-step-body      { padding-left: 10px !important; }
        }
      `}</style>
      {/* ─── Announcement Bar ────────────────────────────────────────────────── */}
      <div
        style={{
          background: C.gold,
          color: C.navy,
          textAlign: 'center',
          padding: '8px 24px',
          fontSize: 11.5,
          fontFamily: SANS,
          letterSpacing: 0.5,
          fontWeight: 500,
        }}
      >
        {t.ann}
      </div>

      {/* ─── Navigation ──────────────────────────────────────────────────────── */}
      <nav
        className="tlg-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: C.navy,
          borderBottom: `1px solid ${C.ruleDark}`,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: C.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  color: C.navy,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                TL
              </span>
            </div>
            <div>
              <div style={{ fontFamily: SERIF, color: C.white, fontSize: 17, fontWeight: 700 }}>
                TOL LANGIT
              </div>
              <div
                className="tlg-brand-subtitle"
                style={{
                  color: C.gold,
                  fontSize: 9.5,
                  fontWeight: 500,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}
              >
                Algorithmic Capital
              </div>
            </div>
          </div>

          {/* Right side: language toggle + back link */}
          <div className="tlg-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Language toggle */}
            <div
              style={{
                display: 'flex',
                border: `1px solid ${C.ruleDark}`,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              {(['en', 'id'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang === l ? C.gold : 'transparent',
                    color: lang === l ? C.navy : C.gold,
                    border: 'none',
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: SANS,
                    fontWeight: 600,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Back link */}
            <a
              href="/"
              style={{
                color: C.gold,
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: SANS,
                letterSpacing: 0.3,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: 0.85,
              }}
            >
              <Icon d={ICON_PATHS.arrow_left} size={14} />
              <span className="tlg-nav-back-label">{t.nav_back.replace('← ', '')}</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="tlg-hero"
        style={{
          background: C.navy,
          padding: '72px 40px 80px',
          borderBottom: `3px solid ${C.gold}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              color: C.gold,
              fontSize: 11,
              fontFamily: SANS,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {t.hero_eyebrow}
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              color: C.white,
              fontSize: 'clamp(28px, 4vw, 46px)',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '0 0 20px',
            }}
          >
            {t.hero_title}
          </h1>
          <p
            style={{
              color: C.goldPale,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 640,
              margin: 0,
              fontFamily: SANS,
              fontWeight: 400,
            }}
          >
            {t.hero_subtitle}
          </p>
          {/* Latency / execution quality notice */}
          <div
            style={{
              marginTop: 28,
              maxWidth: 640,
              background: 'rgba(184,154,62,0.12)',
              border: `1px solid ${C.gold}`,
              borderLeft: `3px solid ${C.gold}`,
              padding: '14px 18px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: C.goldBright, flexShrink: 0, marginTop: 2 }}>
              <Icon d={ICON_PATHS.info} size={14} />
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: C.goldPale,
                fontFamily: SANS,
                margin: 0,
              }}
            >
              {t.hero_note}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Steps ───────────────────────────────────────────────────────────── */}
      <section className="tlg-steps" style={{ padding: '64px 40px', background: C.offWhite }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {t.steps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 0, position: 'relative' }}>
                {/* Step number + connector line */}
                <div
                  className="tlg-step-badge"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: 72,
                  }}
                >
                  {/* Number badge */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: C.navy,
                      border: `2px solid ${C.gold}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    <span
                      style={{
                        color: C.gold,
                        fontSize: 13,
                        fontFamily: MONO,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {step.n}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < t.steps.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        flex: 1,
                        minHeight: 48,
                        background: `linear-gradient(to bottom, ${C.gold}, ${C.ruleDark})`,
                        opacity: 0.4,
                        marginTop: 0,
                      }}
                    />
                  )}
                </div>

                {/* Step content */}
                <div
                  className="tlg-step-body"
                  style={{
                    flex: 1,
                    paddingBottom: idx < t.steps.length - 1 ? 56 : 0,
                    paddingLeft: 28,
                  }}
                >
                  {/* Step header */}
                  <div
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}
                  >
                    <div
                      style={{
                        color: C.gold,
                        marginTop: 14,
                        flexShrink: 0,
                      }}
                    >
                      <Icon d={STEP_ICONS[idx]} size={18} />
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <h2
                        style={{
                          fontFamily: SERIF,
                          fontSize: 22,
                          fontWeight: 700,
                          color: C.navy,
                          margin: '0 0 4px',
                          lineHeight: 1.25,
                        }}
                      >
                        {step.title}
                      </h2>
                      <p
                        style={{
                          fontSize: 12,
                          color: C.muted,
                          fontFamily: SANS,
                          margin: 0,
                          fontWeight: 500,
                          letterSpacing: 0.3,
                          textTransform: 'uppercase',
                        }}
                      >
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Body text */}
                  <div style={{ marginBottom: 20 }}>
                    {step.body.map((para, pi) => (
                      <p
                        key={pi}
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.75,
                          color: C.body,
                          margin: pi < step.body.length - 1 ? '0 0 12px' : 0,
                          fontFamily: SANS,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Action button */}
                  {step.action_url && (
                    <div style={{ marginBottom: 20 }}>
                      <a
                        href={step.action_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: C.navy,
                          color: C.white,
                          textDecoration: 'none',
                          padding: '11px 22px',
                          fontSize: 13,
                          fontFamily: SANS,
                          fontWeight: 600,
                          letterSpacing: 0.3,
                          borderBottom: `2px solid ${C.gold}`,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <Icon d={ICON_PATHS.external} size={14} />
                        {step.action_label}
                      </a>
                      {step.action_note && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: C.muted,
                            fontFamily: MONO,
                            marginTop: 8,
                            letterSpacing: 0.3,
                          }}
                        >
                          {step.action_note}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email block */}
                  {step.email_block && (
                    <div
                      style={{
                        background: C.white,
                        border: `1px solid ${C.rule}`,
                        borderLeft: `3px solid ${C.gold}`,
                        padding: '20px 24px',
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: SANS,
                            fontWeight: 600,
                            color: C.label,
                            letterSpacing: 1.5,
                            textTransform: 'uppercase',
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Icon d={ICON_PATHS.mail} size={12} />
                          {lang === 'en' ? 'Email Request Template' : 'Template Email Permintaan'}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>
                            To:{' '}
                          </span>
                          {step.email_block.to.map((addr, ai) => (
                            <span key={ai} style={{ marginRight: 12 }}>
                              <a
                                href={`mailto:${addr}?subject=${encodeURIComponent(step.email_block!.subject)}`}
                                style={{
                                  fontSize: 12.5,
                                  color: C.blue,
                                  fontFamily: MONO,
                                  textDecoration: 'none',
                                  borderBottom: `1px solid ${C.rule}`,
                                }}
                              >
                                {addr}
                              </a>
                            </span>
                          ))}
                        </div>
                        {step.email_block.cc && step.email_block.cc.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>
                              Cc:{' '}
                            </span>
                            {step.email_block.cc.map((addr, ai) => (
                              <span key={ai} style={{ marginRight: 12 }}>
                                <a
                                  href={`mailto:${addr}`}
                                  style={{
                                    fontSize: 12.5,
                                    color: C.blue,
                                    fontFamily: MONO,
                                    textDecoration: 'none',
                                    borderBottom: `1px solid ${C.rule}`,
                                  }}
                                >
                                  {addr}
                                </a>
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>
                            Subject:{' '}
                          </span>
                          <span style={{ fontSize: 12.5, color: C.body, fontFamily: MONO }}>
                            {step.email_block.subject}
                          </span>
                        </div>
                        <pre
                          style={{
                            fontSize: 12,
                            fontFamily: MONO,
                            color: C.body,
                            background: C.offWhite,
                            padding: '12px 16px',
                            margin: 0,
                            lineHeight: 1.65,
                            whiteSpace: 'pre-wrap',
                            border: `1px solid ${C.rule}`,
                          }}
                        >
                          {step.email_block.body}
                        </pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(step.email_block!.body, `email-${idx}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'transparent',
                          border: `1px solid ${C.rule}`,
                          color: copiedEmail === `email-${idx}` ? C.positive : C.muted,
                          padding: '6px 14px',
                          fontSize: 11.5,
                          fontFamily: SANS,
                          fontWeight: 500,
                          cursor: 'pointer',
                          letterSpacing: 0.3,
                          transition: 'color 0.15s',
                        }}
                      >
                        <Icon
                          d={copiedEmail === `email-${idx}` ? ICON_PATHS.check : ICON_PATHS.copy}
                          size={12}
                        />
                        {copiedEmail === `email-${idx}`
                          ? lang === 'en'
                            ? 'Copied'
                            : 'Tersalin'
                          : lang === 'en'
                            ? 'Copy Template'
                            : 'Salin Template'}
                      </button>
                    </div>
                  )}

                  {/* Note block */}
                  <div
                    style={{
                      background: C.ambBg,
                      border: `1px solid #fcd34d`,
                      borderLeft: `3px solid ${C.gold}`,
                      padding: '14px 18px',
                      marginBottom: 20,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ color: C.amber, flexShrink: 0, marginTop: 1 }}>
                      <Icon d={ICON_PATHS.info} size={14} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: SANS,
                          fontWeight: 700,
                          color: C.amber,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          marginRight: 8,
                        }}
                      >
                        {step.note_label}:
                      </span>
                      <span
                        style={{ fontSize: 13, color: C.amber, fontFamily: SANS, lineHeight: 1.65 }}
                      >
                        {step.note}
                      </span>
                    </div>
                  </div>

                  {/* Details table */}
                  <div
                    style={{
                      background: C.white,
                      border: `1px solid ${C.rule}`,
                      overflow: 'hidden',
                    }}
                  >
                    {step.details.map((d, di) => (
                      <div
                        key={di}
                        className="tlg-detail-row"
                        style={{
                          display: 'flex',
                          borderBottom:
                            di < step.details.length - 1 ? `1px solid ${C.rule}` : 'none',
                          padding: '10px 18px',
                          alignItems: 'baseline',
                          gap: 12,
                        }}
                      >
                        <div
                          className="tlg-detail-label"
                          style={{
                            fontSize: 11.5,
                            fontFamily: SANS,
                            fontWeight: 600,
                            color: C.label,
                            letterSpacing: 0.3,
                            minWidth: 220,
                            flexShrink: 0,
                          }}
                        >
                          {d.label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontFamily: MONO,
                            color: C.body,
                            fontWeight: 400,
                          }}
                        >
                          {d.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section
        className="tlg-faq"
        style={{
          background: C.navy,
          padding: '64px 40px',
          borderTop: `1px solid ${C.ruleDark}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                color: C.gold,
                fontSize: 11,
                fontFamily: SANS,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {t.faq_subtitle}
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                color: C.white,
                fontSize: 30,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t.faq_title}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {t.faqs.map((faq, fi) => (
              <div
                key={fi}
                style={{
                  borderTop: `1px solid ${C.ruleDark}`,
                  borderBottom: fi === t.faqs.length - 1 ? `1px solid ${C.ruleDark}` : 'none',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === fi ? null : fi)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 16,
                      fontWeight: 600,
                      color: C.white,
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: C.gold,
                      flexShrink: 0,
                      transition: 'transform 0.2s',
                      transform: openFaq === fi ? 'rotate(45deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                      fontSize: 22,
                      lineHeight: 1,
                      fontWeight: 300,
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === fi && (
                  <div
                    style={{
                      paddingBottom: 20,
                      paddingRight: 32,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: C.goldPale,
                        fontFamily: SANS,
                        margin: 0,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="tlg-footer"
        style={{
          background: C.navy,
          borderTop: `1px solid ${C.ruleDark}`,
          padding: '32px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: C.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  color: C.navy,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                TL
              </span>
            </div>
            <span
              style={{
                fontFamily: SERIF,
                color: C.white,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              TOL LANGIT Capital
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: C.muted,
              fontFamily: SANS,
              maxWidth: 640,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {t.footer_note}
          </p>
          <div
            style={{
              fontSize: 12,
              color: C.gold,
              fontFamily: MONO,
              letterSpacing: 0.3,
              opacity: 0.8,
            }}
          >
            {t.footer_contact}
          </div>
        </div>
      </footer>
    </div>
  );
}
