import React, { useEffect, useState } from 'react';
import { User, Lock, QrCode, Shield, Check, AlertCircle, Printer, Download, Copy, ExternalLink, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminProfileTab = () => {
  const { user, updateCurrentUser } = useAuth();

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Official Cafe Universal QR Code State
  const [universalQrUrl, setUniversalQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [printCopies, setPrintCopies] = useState(5);

  const menuUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? `${window.location.origin}/cafe?v=prime`
    : 'https://the-prime-cafe-frontend.vercel.app/cafe?v=prime';

  useEffect(() => {
    let isMounted = true;

    const generateBrandedQR = async () => {
      try {
        const rawQr = await QRCode.toDataURL(menuUrl, {
          width: 600,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#2C1810',
            light: '#FFFFFF'
          }
        });

        // Overlay The Prime Cafe logo in center of QR
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.src = rawQr;

        qrImg.onload = () => {
          ctx.drawImage(qrImg, 0, 0, 600, 600);

          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.src = '/logo.png';

          logoImg.onload = () => {
            if (!isMounted) return;
            const center = 300;
            const logoRadius = 66;

            // White circular background for logo with soft shadow
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, logoRadius + 6, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();

            // Circular border ring
            ctx.beginPath();
            ctx.arc(center, center, logoRadius + 4, 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#C85A32';
            ctx.stroke();

            // Clip circle and draw logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, logoRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              logoImg,
              center - logoRadius,
              center - logoRadius,
              logoRadius * 2,
              logoRadius * 2
            );
            ctx.restore();

            setUniversalQrUrl(canvas.toDataURL('image/png'));
          };

          logoImg.onerror = () => {
            if (isMounted) setUniversalQrUrl(rawQr);
          };
        };
      } catch (err) {
        console.error('Failed to generate universal QR:', err);
      }
    };

    generateBrandedQR();

    return () => {
      isMounted = false;
    };
  }, [menuUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!universalQrUrl) return;

    // Create a high-res branded Standee Card PNG with The Prime Cafe logo
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1000);

    // Elegant cafe border
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#C85A32';
    ctx.strokeRect(20, 20, 760, 960);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#E6DCD3';
    ctx.strokeRect(32, 32, 736, 936);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo.png';

    logoImg.onload = () => {
      // Draw top emblem logo (110x110)
      const logoCenter = 400;
      const logoTop = 135;
      const radius = 55;

      ctx.save();
      ctx.beginPath();
      ctx.arc(logoCenter, logoTop, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, logoCenter - radius, logoTop - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(logoCenter, logoTop, radius + 3, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#C85A32';
      ctx.stroke();

      // Heading: The Prime Cafe
      ctx.fillStyle = '#2C1810';
      ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('The Prime Cafe', 400, 235);

      // Subtitle
      ctx.fillStyle = '#C85A32';
      ctx.font = '600 20px "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Pani Tanki Chowk, Muzaffarpur', 400, 270);

      // QR Code with embedded logo in center
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = universalQrUrl;
      qrImg.onload = () => {
        // Draw 480x480 QR in center
        ctx.drawImage(qrImg, 160, 310, 480, 480);

        // Instruction
        ctx.fillStyle = '#2C1810';
        ctx.font = 'bold 26px "Segoe UI", Roboto, sans-serif';
        ctx.fillText('📷 Scan with Phone Camera to Order', 400, 840);

        ctx.fillStyle = '#7A685D';
        ctx.font = '18px "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Browse full digital menu & place orders instantly', 400, 880);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'The-Prime-Cafe-Official-QR-Standee.png';
        a.click();
      };
    };
  };

  const handlePrintSingleStandee = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>The Prime Cafe - Official Menu QR</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
              text-align: center;
              margin: 0;
              background: #FAF7F2;
              color: #2C1810;
            }
            .card {
              background: #FFFFFF;
              border: 3px solid #C85A32;
              border-radius: 28px;
              padding: 40px 30px;
              box-shadow: 0 10px 30px rgba(74,44,24,0.08);
              max-width: 360px;
              width: 100%;
            }
            .logo-badge {
              display: inline-block;
              background: #4A2C18;
              color: #FAF7F2;
              padding: 8px 18px;
              border-radius: 50px;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            h1 { color: #2C1810; margin: 0 0 6px 0; font-size: 28px; font-weight: 800; }
            h2 { color: #C85A32; margin: 0 0 16px 0; font-size: 15px; font-weight: 600; }
            .qr-wrapper {
              background: #FAF7F2;
              border: 2px dashed #E6DCD3;
              border-radius: 20px;
              padding: 16px;
              display: inline-block;
              margin: 10px 0 18px 0;
            }
            img { width: 230px; height: 230px; display: block; border-radius: 12px; }
            .instruction {
              font-size: 14px;
              font-weight: 700;
              color: #4A2C18;
              margin: 0 0 4px 0;
            }
            .subtext { font-size: 12px; color: #7A685D; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${window.location.origin}/logo.png" style="width:68px;height:68px;border-radius:50%;margin:0 auto 12px auto;display:block;" /><div class="logo-badge">Official Cafe QR</div>
            <h1>The Prime Cafe</h1>
            <h2>Artisanal Brews & Comfort Eats</h2>
            <div class="qr-wrapper">
              <img src="${universalQrUrl}" alt="The Prime Cafe QR Code" />
            </div>
            <p class="instruction">📷 Scan with phone camera to order</p>
            <p class="subtext">Browse full digital menu & place orders instantly</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintMultipleCards = (count) => {
    const printWindow = window.open('', '_blank');
    const cardsHtml = Array.from({ length: count })
      .map(
        () => `
        <div class="card">
          <img src="${window.location.origin}/logo.png" style="width:40px;height:40px;border-radius:50%;margin:0 auto 6px auto;display:block;" /><div class="logo-badge">The Prime Cafe</div>
          <h3>Scan to View Menu & Order</h3>
          <div class="qr-box">
            <img src="${universalQrUrl}" alt="Cafe QR Code" />
          </div>
          <p class="tagline">Artisanal Brews & Fresh Eats</p>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>The Prime Cafe - ${count} Universal QR Cards</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 10px;
              color: #2C1810;
              background: #fff;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .card {
              border: 2px dashed #C85A32;
              border-radius: 18px;
              padding: 20px;
              text-align: center;
              background: #FAF7F2;
              page-break-inside: avoid;
            }
            .logo-badge {
              display: inline-block;
              background: #4A2C18;
              color: #FAF7F2;
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            h3 { margin: 0 0 10px 0; font-size: 16px; color: #2C1810; font-weight: 800; }
            .qr-box {
              background: #fff;
              display: inline-block;
              padding: 10px;
              border-radius: 14px;
              border: 1px solid #E6DCD3;
            }
            img { width: 140px; height: 140px; display: block; }
            .tagline { margin: 8px 0 0 0; font-size: 11px; color: #7A685D; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="grid">
            ${cardsHtml}
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileMsg('');
      const res = await api.patch('/admin/profile', { name, email, phone });
      if (res.data.success) {
        updateCurrentUser(res.data.data);
        setProfileMsg('Profile updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMsg('');
      const res = await api.patch('/admin/profile/password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#2C1810]">Admin Account & Cafe QR Code</h2>
        <p className="text-xs text-[#7A685D] mt-0.5">
          Manage staff security, password, and official QR code for cafe guests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4A2C18] text-white font-bold text-lg flex items-center justify-center">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2C1810] flex items-center gap-1.5">
                {user?.name}
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                  Staff Role: Admin
                </span>
              </h3>
              <p className="text-xs text-[#7A685D]">{user?.email}</p>
            </div>
          </div>

          {profileMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs pt-2">
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Staff Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Staff / Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-xs"
            >
              {profileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[#C85A32]" />
            <h3 className="font-bold text-sm text-[#2C1810]">Change Staff Password</h3>
          </div>

          {passwordMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-xs"
            >
              {passwordLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
      {/* OFFICIAL CAFE UNIFIED QR CODE SECTION */}
      <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 sm:p-6 space-y-6 shadow-2xs">
        <div className="border-b border-[#F5EFEB] pb-4">
          <div className="flex items-center gap-2">
            <QrCode size={22} className="text-[#C85A32]" />
            <h3 className="font-extrabold text-base sm:text-lg text-[#2C1810]">
              Official Cafe QR Code & Digital Menu
            </h3>
          </div>
          <p className="text-xs text-[#7A685D] mt-1">
            A single, unified QR code for your entire cafe. Place copies of this same QR code on your tables, counter, or stands so guests can scan and order directly.
          </p>
        </div>

        {/* Main QR Showcase Card */}
        <div className="bg-[#FAF7F2] border border-[#E6DCD3] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6">
          {/* QR Code Preview */}
          <div className="bg-white p-3 rounded-2xl border border-[#E6DCD3] shadow-md shrink-0 flex flex-col items-center">
            {universalQrUrl ? (
              <img
                src={universalQrUrl}
                alt="Official Cafe QR Code"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-[#7A685D]">
                Generating QR...
              </div>
            )}
            <span className="text-[11px] font-bold text-[#4A2C18] mt-2 flex items-center gap-1">
              <Sparkles size={12} className="text-[#C85A32]" /> Scan to View Menu & Order
            </span>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div>
              <span className="inline-block bg-[#4A2C18] text-[#FAF7F2] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                Universal Cafe QR
              </span>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center shadow-xs"><img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" /></div><h4 className="font-extrabold text-lg sm:text-xl text-[#2C1810]">The Prime Cafe</h4></div>
              <p className="text-xs text-[#7A685D] mt-0.5">
                All tables and guests use this exact same QR code. No table selection or table configuration needed!
              </p>
            </div>

            {/* Menu URL display & Copy */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7A685D] uppercase tracking-wide">
                Direct Digital Menu Link
              </label>
              <div className="flex items-center gap-2 max-w-md mx-auto md:mx-0">
                <input
                  type="text"
                  readOnly
                  value={menuUrl}
                  className="flex-1 text-xs font-mono bg-white border border-[#E6DCD3] rounded-xl px-3 py-2 text-[#4A2C18] select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
                  title="Copy link"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1">
              <button
                type="button"
                onClick={handlePrintSingleStandee}
                className="bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Standee Card
              </button>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="bg-[#4A2C18] hover:bg-[#382012] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download PNG
              </button>

              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Test Menu
              </a>
            </div>
          </div>
        </div>

        {/* Multiple QR Cards for Tables / Stands */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-[#2C1810]">
                Table & Counter Stand Cards
              </h4>
              <p className="text-xs text-[#7A685D]">
                Print multiple identical QR stand cards for all your tables at once.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={printCopies}
                onChange={(e) => setPrintCopies(Number(e.target.value))}
                className="text-xs bg-white border border-[#E6DCD3] rounded-xl px-2.5 py-1.5 font-bold text-[#4A2C18]"
              >
                <option value={5}>5 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={15}>15 Cards</option>
                <option value={20}>20 Cards</option>
              </select>

              <button
                type="button"
                onClick={() => handlePrintMultipleCards(printCopies)}
                className="bg-[#4A2C18] hover:bg-[#382012] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={13} /> Print {printCopies} Cards
              </button>
            </div>
          </div>

          {/* 5 Identical QR Cards Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DCD3] flex flex-col items-center text-center justify-between space-y-2 hover:border-[#C85A32] transition"
              >
                <div className="w-full">
                  <span className="text-[10px] font-bold text-[#7A685D] uppercase tracking-wider block">
                    Stand Card #{index}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center shrink-0">
                      <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
                    </div>
                    <h5 className="font-extrabold text-xs text-[#2C1810] truncate">
                      The Prime Cafe
                    </h5>
                  </div>
                </div>

                {universalQrUrl && (
                  <div className="w-24 h-24 bg-white p-1 rounded-xl border border-[#E6DCD3] shadow-2xs">
                    <img
                      src={universalQrUrl}
                      alt={`Cafe QR Card ${index}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <span className="text-[10px] text-[#7A685D]">All QRs Same Link</span>

                <button
                  type="button"
                  onClick={handlePrintSingleStandee}
                  className="w-full bg-white hover:bg-[#F5EFEB] border border-[#E6DCD3] text-[#4A2C18] text-[11px] font-bold py-1 rounded-lg flex items-center justify-center gap-1 transition"
                >
                  <Printer size={11} /> Print Card
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileTab;
