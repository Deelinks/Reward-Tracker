import React, { useState } from 'react';
import {
  AVATAR_COLOR_PALETTES,
  AVATAR_PRESETS,
  normalizeAvatarId,
  StaffAvatarPreset,
  StaffMemberRecord
} from '../data/hotelLoyaltyData';
import { Sparkles } from 'lucide-react';

export interface Staff3DAvatarProps {
  avatarId?: string;
  avatarColor?: string;
  staffName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withRing?: boolean;
  ringTier?: 'gold' | 'silver' | 'bronze' | 'none';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * High-fidelity 3D cartoon animal & human character vector renderer.
 * Designed with spherical volume shading, glossy Pixar-style eye catchlights,
 * dimensional ears/hair, and hotel hospitality accessories.
 */
export const Cartoon3DCharacter: React.FC<{ avatarId?: string }> = ({ avatarId }) => {
  const normalizedId = normalizeAvatarId(avatarId);

  switch (normalizedId) {
    // ==========================================
    // 1. LEO THE ROYAL LION (3D Cartoon Animal)
    // ==========================================
    case 'lion-king':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="lionMane" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
            <radialGradient id="lionHead" cx="42%" cy="38%" r="55%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="65%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="lionMuzzle" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </radialGradient>
            <radialGradient id="lionEye" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="60%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          {/* Fluffy 3D Mane */}
          <circle cx="50" cy="50" r="43" fill="url(#lionMane)" />
          {/* Mane Petals / Curls for depth */}
          <circle cx="20" cy="30" r="14" fill="#b45309" opacity="0.6" />
          <circle cx="80" cy="30" r="14" fill="#b45309" opacity="0.6" />
          <circle cx="15" cy="52" r="14" fill="#92400e" opacity="0.5" />
          <circle cx="85" cy="52" r="14" fill="#92400e" opacity="0.5" />
          <circle cx="26" cy="74" r="13" fill="#78350f" opacity="0.5" />
          <circle cx="74" cy="74" r="13" fill="#78350f" opacity="0.5" />
          <circle cx="50" cy="85" r="12" fill="#78350f" opacity="0.6" />
          {/* 3D Round Ears */}
          <circle cx="27" cy="27" r="10" fill="#f59e0b" />
          <circle cx="27" cy="27" r="6" fill="#fbcfe8" />
          <circle cx="73" cy="27" r="10" fill="#d97706" />
          <circle cx="73" cy="27" r="6" fill="#f472b6" />
          {/* 3D Lion Face */}
          <circle cx="50" cy="52" r="28" fill="url(#lionHead)" />
          {/* 3D Muzzle */}
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="url(#lionMuzzle)" />
          {/* Eyes (Sclera + 3D Amber Iris + Catchlights) */}
          <ellipse cx="40" cy="46" rx="6" ry="7.5" fill="#ffffff" />
          <circle cx="41" cy="47" r="4.5" fill="url(#lionEye)" />
          <circle cx="42" cy="47" r="2" fill="#000000" />
          <circle cx="39.5" cy="44.5" r="1.6" fill="#ffffff" />
          <circle cx="43" cy="48.5" r="0.8" fill="#ffffff" />

          <ellipse cx="60" cy="46" rx="6" ry="7.5" fill="#ffffff" />
          <circle cx="59" cy="47" r="4.5" fill="url(#lionEye)" />
          <circle cx="58" cy="47" r="2" fill="#000000" />
          <circle cx="57.5" cy="44.5" r="1.6" fill="#ffffff" />
          <circle cx="61" cy="48.5" r="0.8" fill="#ffffff" />
          {/* Eyebrows */}
          <path d="M35 37 Q41 35 45 38" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M65 37 Q59 35 55 38" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Soft Cheeks */}
          <circle cx="33" cy="58" r="4" fill="#f43f5e" opacity="0.25" />
          <circle cx="67" cy="58" r="4" fill="#f43f5e" opacity="0.25" />
          {/* 3D Cute Lion Nose */}
          <path d="M46 56 Q50 54 54 56 Q50 63 46 56 Z" fill="#78350f" />
          <path d="M50 61 L50 66" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 65 Q50 71 56 65" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Mini Gold Hospitality Crown on Mane */}
          <path d="M43 18 L46 25 L50 16 L54 25 L57 18 L56 27 L44 27 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        </svg>
      );

    // ==========================================
    // 2. BARNABY THE WISE OWL (3D Cartoon Animal)
    // ==========================================
    case 'owl-wise':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="owlBody" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="60%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </radialGradient>
            <radialGradient id="owlFace" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </radialGradient>
          </defs>
          {/* Feathered Ear Tufts */}
          <polygon points="26,18 36,36 20,38" fill="#3730a3" />
          <polygon points="74,18 64,36 80,38" fill="#312e81" />
          {/* 3D Body / Head */}
          <ellipse cx="50" cy="52" rx="36" ry="38" fill="url(#owlBody)" />
          {/* Heart-Shaped Face Mask */}
          <path d="M50 40 Q40 28 28 36 Q20 48 30 64 Q50 76 50 76 Q50 76 70 64 Q80 48 72 36 Q60 28 50 40 Z" fill="url(#owlFace)" />
          {/* Large Golden Spectacles */}
          <circle cx="39" cy="48" r="12" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="61" cy="48" r="12" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <line x1="51" y1="48" x2="49" y2="48" stroke="#f59e0b" strokeWidth="3" />
          {/* Big Luminous Eyes */}
          <circle cx="39" cy="48" r="9" fill="#fef08a" />
          <circle cx="39" cy="48" r="6" fill="#1e1b4b" />
          <circle cx="37" cy="45" r="2.2" fill="#ffffff" />
          <circle cx="41" cy="50" r="1" fill="#ffffff" />

          <circle cx="61" cy="48" r="9" fill="#fef08a" />
          <circle cx="61" cy="48" r="6" fill="#1e1b4b" />
          <circle cx="59" cy="45" r="2.2" fill="#ffffff" />
          <circle cx="63" cy="50" r="1" fill="#ffffff" />
          {/* Beak */}
          <polygon points="50,53 47,63 53,63" fill="#f59e0b" />
          {/* Concierge Crimson Bow Tie */}
          <polygon points="43,76 50,78 43,84" fill="#e11d48" />
          <polygon points="57,76 50,78 57,84" fill="#be123c" />
          <circle cx="50" cy="78" r="2.5" fill="#fbbf24" />
        </svg>
      );

    // ==========================================
    // 3. BELLA THE CHEERFUL PANDA (3D Cartoon Animal)
    // ==========================================
    case 'panda-chef':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="pandaHead" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
            <radialGradient id="pandaEar" cx="35%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>
          {/* Round Fluffy 3D Ears */}
          <circle cx="24" cy="26" r="14" fill="url(#pandaEar)" />
          <circle cx="76" cy="26" r="14" fill="url(#pandaEar)" />
          <circle cx="24" cy="26" r="7" fill="#475569" opacity="0.6" />
          <circle cx="76" cy="26" r="7" fill="#475569" opacity="0.6" />
          {/* 3D Panda Head */}
          <circle cx="50" cy="53" r="35" fill="url(#pandaHead)" />
          {/* Iconic Angled Eye Patches */}
          <ellipse cx="36" cy="48" rx="10" ry="12" transform="rotate(-15 36 48)" fill="#1e293b" />
          <ellipse cx="64" cy="48" rx="10" ry="12" transform="rotate(15 64 48)" fill="#1e293b" />
          {/* Warm Sparkling Eyes */}
          <ellipse cx="37" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="37" cy="49" r="3.5" fill="#0f172a" />
          <circle cx="35.5" cy="46.5" r="1.4" fill="#ffffff" />

          <ellipse cx="63" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="63" cy="49" r="3.5" fill="#0f172a" />
          <circle cx="61.5" cy="46.5" r="1.4" fill="#ffffff" />
          {/* Rosy Blushing Cheeks */}
          <circle cx="28" cy="62" r="5" fill="#fb7185" opacity="0.4" />
          <circle cx="72" cy="62" r="5" fill="#fb7185" opacity="0.4" />
          {/* Panda Snout & Mouth */}
          <ellipse cx="50" cy="64" rx="6" ry="4" fill="#0f172a" />
          <path d="M50 67 L50 71" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 70 Q50 75 56 70" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Front Desk Crimson Bow Tie */}
          <polygon points="40,81 50,83 40,90" fill="#e11d48" />
          <polygon points="60,81 50,83 60,90" fill="#be123c" />
          <circle cx="50" cy="83" r="3" fill="#fbbf24" />
        </svg>
      );

    // ==========================================
    // 4. FELIX THE SWIFT FOX (3D Cartoon Animal)
    // ==========================================
    case 'fox-clever':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="foxHead" cx="45%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="65%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
          </defs>
          {/* Pointed Fox Ears */}
          <polygon points="22,12 38,36 14,40" fill="#c2410c" />
          <polygon points="24,18 36,36 18,38" fill="#ffffff" />
          <polygon points="78,12 86,40 62,36" fill="#9a3412" />
          <polygon points="76,18 82,38 64,36" fill="#ffffff" />
          {/* Fox Head */}
          <polygon points="50,28 85,55 50,82 15,55" fill="url(#foxHead)" />
          {/* White Fluffy Cheeks */}
          <path d="M50 56 Q30 54 15 55 Q30 76 50 82 Q70 76 85 55 Q70 54 50 56 Z" fill="#ffffff" />
          {/* Clever Emerald Eyes */}
          <ellipse cx="38" cy="48" rx="6" ry="5" fill="#ffffff" />
          <circle cx="39" cy="48" r="3.8" fill="#059669" />
          <circle cx="39" cy="48" r="2" fill="#064e3b" />
          <circle cx="37.5" cy="46" r="1.2" fill="#ffffff" />

          <ellipse cx="62" cy="48" rx="6" ry="5" fill="#ffffff" />
          <circle cx="61" cy="48" r="3.8" fill="#059669" />
          <circle cx="61" cy="48" r="2" fill="#064e3b" />
          <circle cx="59.5" cy="46" r="1.2" fill="#ffffff" />
          {/* Black Fox Nose & Grin */}
          <circle cx="50" cy="74" r="3.5" fill="#0f172a" />
          <path d="M46 76 Q50 80 54 76" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      );

    // ==========================================
    // 5. COOPER THE GOLDEN PUP (3D Cartoon Animal)
    // ==========================================
    case 'dog-golden':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="pupHead" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
          </defs>
          {/* Floppy Golden Ears */}
          <ellipse cx="20" cy="46" rx="9" ry="20" transform="rotate(20 20 46)" fill="#ca8a04" />
          <ellipse cx="80" cy="46" rx="9" ry="20" transform="rotate(-20 80 46)" fill="#a16207" />
          {/* Head */}
          <circle cx="50" cy="48" r="32" fill="url(#pupHead)" />
          {/* Snout */}
          <ellipse cx="50" cy="60" rx="14" ry="10" fill="#fef9c3" />
          {/* Joyful Puppy Eyes */}
          <circle cx="38" cy="43" r="5" fill="#451a03" />
          <circle cx="36.5" cy="41" r="2" fill="#ffffff" />
          <circle cx="40" cy="44.5" r="0.8" fill="#ffffff" />

          <circle cx="62" cy="43" r="5" fill="#451a03" />
          <circle cx="60.5" cy="41" r="2" fill="#ffffff" />
          <circle cx="64" cy="44.5" r="0.8" fill="#ffffff" />
          {/* Wet Black Nose */}
          <ellipse cx="50" cy="56" rx="6" ry="4.5" fill="#1e293b" />
          <ellipse cx="48.5" cy="54.5" rx="2" ry="1" fill="#ffffff" opacity="0.7" />
          {/* Happy Open Mouth with Pink Tongue */}
          <path d="M45 64 Q50 72 55 64 Z" fill="#e11d48" />
          <path d="M47 66 Q50 71 53 66" fill="#fb7185" />
          {/* Red Hospitality Bandana */}
          <polygon points="32,76 68,76 50,92" fill="#dc2626" />
          <circle cx="50" cy="80" r="2.5" fill="#fbbf24" />
        </svg>
      );

    // ==========================================
    // 6. TIGRESS MAYA (3D Cartoon Animal)
    // ==========================================
    case 'tiger-bold':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="tigerHead" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
          </defs>
          {/* Round Ears with white spots */}
          <circle cx="25" cy="25" r="11" fill="#ea580c" />
          <circle cx="25" cy="25" r="6" fill="#fef3c7" />
          <circle cx="75" cy="25" r="11" fill="#c2410c" />
          <circle cx="75" cy="25" r="6" fill="#fef3c7" />
          {/* Tiger Head */}
          <circle cx="50" cy="52" r="34" fill="url(#tigerHead)" />
          {/* Tiger Stripes */}
          <path d="M50 20 L50 28 M44 23 L47 29 M56 23 L53 29" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 48 L28 49 M17 56 L26 55" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M82 48 L72 49 M83 56 L74 55" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cream Muzzle */}
          <ellipse cx="50" cy="64" rx="15" ry="11" fill="#fffbeb" />
          {/* Turquoise Eyes */}
          <ellipse cx="38" cy="46" rx="5" ry="6" fill="#ffffff" />
          <circle cx="39" cy="46" r="4" fill="#0d9488" />
          <circle cx="39" cy="46" r="2" fill="#042f2e" />
          <circle cx="37.5" cy="44" r="1.3" fill="#ffffff" />

          <ellipse cx="62" cy="46" rx="5" ry="6" fill="#ffffff" />
          <circle cx="61" cy="46" r="4" fill="#0d9488" />
          <circle cx="61" cy="46" r="2" fill="#042f2e" />
          <circle cx="59.5" cy="44" r="1.3" fill="#ffffff" />
          {/* Pink Nose & Smile */}
          <polygon points="46,58 54,58 50,63" fill="#f43f5e" />
          <path d="M45 66 Q50 71 55 66" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    // ==========================================
    // 7. BARNY THE FRIENDLY BEAR (3D Cartoon Animal)
    // ==========================================
    case 'bear-gentle':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="bearHead" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="60%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>
          {/* Round Teddy Ears */}
          <circle cx="23" cy="24" r="12" fill="#92400e" />
          <circle cx="23" cy="24" r="6" fill="#fde68a" />
          <circle cx="77" cy="24" r="12" fill="#78350f" />
          <circle cx="77" cy="24" r="6" fill="#fde68a" />
          {/* Head */}
          <circle cx="50" cy="53" r="35" fill="url(#bearHead)" />
          {/* Tan Muzzle */}
          <ellipse cx="50" cy="65" rx="16" ry="12" fill="#fed7aa" />
          {/* Dark Warm Eyes */}
          <circle cx="37" cy="47" r="4.5" fill="#1c1917" />
          <circle cx="35.5" cy="45" r="1.6" fill="#ffffff" />
          <circle cx="63" cy="47" r="4.5" fill="#1c1917" />
          <circle cx="61.5" cy="45" r="1.6" fill="#ffffff" />
          {/* Cute Bear Nose & Smile */}
          <ellipse cx="50" cy="60" rx="7" ry="5" fill="#1c1917" />
          <path d="M50 65 L50 70" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          <path d="M43 69 Q50 75 57 69" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Emerald Necktie */}
          <polygon points="46,80 54,80 52,94 48,94" fill="#059669" />
          <circle cx="50" cy="80" r="2.5" fill="#10b981" />
        </svg>
      );

    // ==========================================
    // 8. CLEO THE LUXURY CAT (3D Cartoon Animal)
    // ==========================================
    case 'cat-siamese':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="catHead" cx="45%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
          {/* Pointed Cat Ears */}
          <polygon points="22,14 36,36 12,38" fill="#475569" />
          <polygon points="23,18 34,34 16,36" fill="#fda4af" />
          <polygon points="78,14 88,38 64,36" fill="#334155" />
          <polygon points="77,18 84,36 66,34" fill="#fda4af" />
          {/* Cat Head */}
          <circle cx="50" cy="52" r="33" fill="url(#catHead)" />
          {/* Dark Siamese Nose Mask */}
          <ellipse cx="50" cy="56" rx="14" ry="12" fill="#64748b" opacity="0.35" />
          {/* Sapphire Blue Almond Eyes */}
          <ellipse cx="37" cy="46" rx="5.5" ry="6.5" fill="#ffffff" />
          <ellipse cx="37" cy="46" rx="4" ry="5.5" fill="#0284c7" />
          <ellipse cx="37" cy="46" rx="2" ry="4.5" fill="#0c4a6e" />
          <circle cx="35.5" cy="43.5" r="1.3" fill="#ffffff" />

          <ellipse cx="63" cy="46" rx="5.5" ry="6.5" fill="#ffffff" />
          <ellipse cx="63" cy="46" rx="4" ry="5.5" fill="#0284c7" />
          <ellipse cx="63" cy="46" rx="2" ry="4.5" fill="#0c4a6e" />
          <circle cx="61.5" cy="43.5" r="1.3" fill="#ffffff" />
          {/* Dainty Pink Nose & Whiskers */}
          <polygon points="48,57 52,57 50,60" fill="#f43f5e" />
          <path d="M47 62 Q50 65 53 62" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <line x1="28" y1="58" x2="16" y2="56" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="28" y1="62" x2="15" y2="64" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="72" y1="58" x2="84" y2="56" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="72" y1="62" x2="85" y2="64" stroke="#94a3b8" strokeWidth="1.2" />
          {/* Gold Bell Collar */}
          <path d="M35 78 Q50 84 65 78" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="83" r="3.5" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
        </svg>
      );

    // ==========================================
    // 9. ARTHUR THE MASTER CONCIERGE (3D Cartoon Human)
    // ==========================================
    case 'concierge-pro':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="manSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="65%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba762" />
            </radialGradient>
            <linearGradient id="hairDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Ears */}
          <circle cx="22" cy="52" r="6" fill="#fba762" />
          <circle cx="78" cy="52" r="6" fill="#fba762" />
          {/* 3D Face */}
          <circle cx="50" cy="50" r="28" fill="url(#manSkin)" />
          {/* Sleek Side-Parted Hair */}
          <path d="M22 45 Q22 22 50 20 Q78 22 78 45 Q70 28 50 28 Q30 28 22 45 Z" fill="url(#hairDark)" />
          {/* Eyes */}
          <circle cx="39" cy="46" r="3.8" fill="#0f172a" />
          <circle cx="37.8" cy="44.5" r="1.3" fill="#ffffff" />
          <circle cx="61" cy="46" r="3.8" fill="#0f172a" />
          <circle cx="59.8" cy="44.5" r="1.3" fill="#ffffff" />
          {/* Dashing Curved Mustache */}
          <path d="M36 60 Q44 56 50 61 Q56 56 64 60 Q57 65 50 63 Q43 65 36 60 Z" fill="#0f172a" />
          {/* Smile Under Mustache */}
          <path d="M45 65 Q50 69 55 65" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Burgundy Suit & Golden Crossed Keys Pin */}
          <path d="M26 80 Q50 74 74 80 L78 98 L22 98 Z" fill="#881337" />
          <polygon points="46,80 50,86 46,92 42,86" fill="#ffffff" />
          <polygon points="54,80 50,86 54,92 58,86" fill="#ffffff" />
          <circle cx="50" cy="86" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        </svg>
      );

    // ==========================================
    // 10. SOPHIE THE FRONT DESK LEAD (3D Cartoon Human)
    // ==========================================
    case 'reception-lead':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="sophieSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="65%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <radialGradient id="auburnHair" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          {/* Hair Background Layer */}
          <circle cx="50" cy="50" r="34" fill="url(#auburnHair)" />
          {/* Face */}
          <circle cx="50" cy="52" r="27" fill="url(#sophieSkin)" />
          {/* Front Swept Auburn Bangs */}
          <path d="M25 42 Q35 24 55 26 Q75 28 72 45 Q55 32 35 38 Z" fill="url(#auburnHair)" />
          {/* Beautiful Hazel Eyes */}
          <ellipse cx="40" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="40" cy="48" r="3.6" fill="#047857" />
          <circle cx="40" cy="48" r="1.8" fill="#064e3b" />
          <circle cx="38.5" cy="45.5" r="1.4" fill="#ffffff" />

          <ellipse cx="60" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="60" cy="48" r="3.6" fill="#047857" />
          <circle cx="60" cy="48" r="1.8" fill="#064e3b" />
          <circle cx="58.5" cy="45.5" r="1.4" fill="#ffffff" />
          {/* Cheerful Smile with pink cheeks */}
          <circle cx="32" cy="57" r="4" fill="#fb7185" opacity="0.4" />
          <circle cx="68" cy="57" r="4" fill="#fb7185" opacity="0.4" />
          <path d="M43 62 Q50 69 57 62" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Modern Front Desk Headset with Mic */}
          <path d="M23 48 Q22 20 50 19 Q78 20 77 48" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <rect x="20" y="44" width="6" height="12" rx="3" fill="#0f172a" />
          <path d="M23 56 Q30 68 40 68" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="41" cy="68" r="2.2" fill="#0f172a" />
          {/* Teal Uniform Collar */}
          <path d="M28 82 Q50 76 72 82 L75 98 L25 98 Z" fill="#0f766e" />
        </svg>
      );

    // ==========================================
    // 11. KAI THE BELLHOP CHAMPION (3D Cartoon Human)
    // ==========================================
    case 'bellhop-kai':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="kaiSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="65%" stopColor="#fba762" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
          </defs>
          {/* Ears */}
          <circle cx="22" cy="52" r="6" fill="#fba762" />
          <circle cx="78" cy="52" r="6" fill="#fba762" />
          {/* Face */}
          <circle cx="50" cy="52" r="28" fill="url(#kaiSkin)" />
          {/* Spiky Dark Hair */}
          <path d="M24 45 Q26 28 50 26 Q74 28 76 45 Q64 34 50 35 Q36 34 24 45 Z" fill="#1e293b" />
          {/* Classic Bellhop Pillbox Cap */}
          <polygon points="32,24 68,20 66,10 34,14" fill="#dc2626" />
          <line x1="32" y1="24" x2="68" y2="20" stroke="#facc15" strokeWidth="2.5" />
          <circle cx="50" cy="17" r="2" fill="#facc15" />
          {/* Eyes */}
          <circle cx="39" cy="48" r="3.8" fill="#1e293b" />
          <circle cx="37.8" cy="46.5" r="1.3" fill="#ffffff" />
          <circle cx="61" cy="48" r="3.8" fill="#1e293b" />
          <circle cx="59.8" cy="46.5" r="1.3" fill="#ffffff" />
          {/* Cheerful Dimpled Smile */}
          <circle cx="33" cy="58" r="3" fill="#fb7185" opacity="0.35" />
          <circle cx="67" cy="58" r="3" fill="#fb7185" opacity="0.35" />
          <path d="M42 62 Q50 71 58 62" stroke="#991b1b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {/* Double-Breasted Red Bellhop Jacket with Gold Buttons */}
          <path d="M26 80 Q50 75 74 80 L78 98 L22 98 Z" fill="#b91c1c" />
          <circle cx="44" cy="86" r="2.2" fill="#facc15" />
          <circle cx="56" cy="86" r="2.2" fill="#facc15" />
          <circle cx="44" cy="93" r="2.2" fill="#facc15" />
          <circle cx="56" cy="93" r="2.2" fill="#facc15" />
        </svg>
      );

    // ==========================================
    // 12. DAVID THE GENERAL MANAGER (3D Cartoon Human)
    // ==========================================
    case 'manager-david':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="davidSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="65%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba762" />
            </radialGradient>
            <linearGradient id="silverHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Face */}
          <circle cx="50" cy="50" r="28" fill="url(#davidSkin)" />
          {/* Distinguished Silver Hair */}
          <path d="M22 44 Q24 18 50 17 Q76 18 78 44 Q70 24 50 24 Q30 24 22 44 Z" fill="url(#silverHair)" />
          {/* Confident Blue Eyes */}
          <ellipse cx="39" cy="46" rx="4" ry="4.5" fill="#ffffff" />
          <circle cx="39" cy="46" r="3" fill="#0284c7" />
          <circle cx="37.8" cy="44.5" r="1.2" fill="#ffffff" />

          <ellipse cx="61" cy="46" rx="4" ry="4.5" fill="#ffffff" />
          <circle cx="61" cy="46" r="3" fill="#0284c7" />
          <circle cx="59.8" cy="44.5" r="1.2" fill="#ffffff" />
          {/* Confident Smile */}
          <path d="M43 62 Q50 67 57 62" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Tailored Charcoal Suit & Gold Executive Tie */}
          <path d="M25 80 Q50 74 75 80 L79 98 L21 98 Z" fill="#1e293b" />
          <polygon points="46,80 54,80 52,98 48,98" fill="#eab308" />
          <polygon points="48,78 52,78 51,83 49,83" fill="#ca8a04" />
        </svg>
      );

    // ==========================================
    // 13. MAYA THE VIP HOST (3D Cartoon Human)
    // ==========================================
    case 'arrival-maya':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="mayaSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
          </defs>
          {/* High Ponytail sticking up behind */}
          <path d="M68 28 Q88 16 86 36 Q84 46 72 40 Z" fill="#451a03" />
          <circle cx="70" cy="30" r="4" fill="#fbbf24" />
          {/* Face */}
          <circle cx="50" cy="52" r="27" fill="url(#mayaSkin)" />
          {/* Styled Dark Brown Hair */}
          <path d="M24 46 Q28 22 50 22 Q72 22 74 46 Q62 30 50 31 Q38 30 24 46 Z" fill="#451a03" />
          {/* Sparkling Almond Eyes */}
          <ellipse cx="39" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="39" cy="48" r="3.5" fill="#451a03" />
          <circle cx="37.5" cy="45.5" r="1.4" fill="#ffffff" />

          <ellipse cx="61" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="61" cy="48" r="3.5" fill="#451a03" />
          <circle cx="59.5" cy="45.5" r="1.4" fill="#ffffff" />
          {/* Soft Eyeliner lashes */}
          <path d="M34 45 Q40 42 45 45" stroke="#1c1917" strokeWidth="1.5" fill="none" />
          <path d="M56 45 Q61 42 67 45" stroke="#1c1917" strokeWidth="1.5" fill="none" />
          {/* Radiant Smile */}
          <circle cx="32" cy="58" r="4" fill="#f43f5e" opacity="0.3" />
          <circle cx="68" cy="58" r="4" fill="#f43f5e" opacity="0.3" />
          <path d="M43 63 Q50 71 57 63" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Sapphire Silk Neck Scarf */}
          <path d="M38 78 Q50 83 62 78 L65 88 Q50 90 35 88 Z" fill="#3b82f6" />
          <polygon points="46,84 54,84 50,94" fill="#1d4ed8" />
        </svg>
      );

    // ==========================================
    // 14. ELENA THE NIGHT AUDITOR (3D Cartoon Human)
    // ==========================================
    case 'auditor-elena':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="elenaSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fff1f2" />
              <stop offset="65%" stopColor="#fecdd3" />
              <stop offset="100%" stopColor="#f43f5e" />
            </radialGradient>
          </defs>
          {/* Dark Chic Bob Haircut */}
          <path d="M20 54 Q18 20 50 19 Q82 20 80 54 Q84 68 76 72 Q72 50 72 40 Q50 32 28 40 Q28 50 24 72 Q16 68 20 54 Z" fill="#0f172a" />
          {/* Face */}
          <circle cx="50" cy="52" r="26" fill="url(#elenaSkin)" />
          {/* Modern Round Glasses */}
          <circle cx="39" cy="48" r="9" fill="none" stroke="#b45309" strokeWidth="2.2" />
          <circle cx="61" cy="48" r="9" fill="none" stroke="#b45309" strokeWidth="2.2" />
          <line x1="48" y1="48" x2="52" y2="48" stroke="#b45309" strokeWidth="2.2" />
          {/* Eyes behind Glasses */}
          <circle cx="39" cy="48" r="3.5" fill="#0f172a" />
          <circle cx="37.8" cy="46" r="1.2" fill="#ffffff" />
          <circle cx="61" cy="48" r="3.5" fill="#0f172a" />
          <circle cx="59.8" cy="46" r="1.2" fill="#ffffff" />
          {/* Gentle Smile */}
          <path d="M44 63 Q50 68 56 63" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Emerald Green Blazer */}
          <path d="M28 82 Q50 76 72 82 L76 98 L24 98 Z" fill="#065f46" />
        </svg>
      );

    // ==========================================
    // 15. SAM THE CHEERFUL HOST (3D Cartoon Human)
    // ==========================================
    case 'host-sam':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="samSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="65%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba762" />
            </radialGradient>
          </defs>
          {/* Face */}
          <circle cx="50" cy="52" r="28" fill="url(#samSkin)" />
          {/* Tousled Brown Hair */}
          <path d="M22 45 Q26 20 50 18 Q74 20 78 45 Q68 28 50 26 Q32 28 22 45 Z" fill="#78350f" />
          <circle cx="38" cy="22" r="7" fill="#78350f" />
          <circle cx="58" cy="21" r="7" fill="#78350f" />
          {/* Big Open Happy Eyes */}
          <ellipse cx="38" cy="47" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="38" cy="47" r="3.5" fill="#451a03" />
          <circle cx="36.5" cy="44.5" r="1.4" fill="#ffffff" />

          <ellipse cx="62" cy="47" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="62" cy="47" r="3.5" fill="#451a03" />
          <circle cx="60.5" cy="44.5" r="1.4" fill="#ffffff" />
          {/* Broad Open Smile with Teeth */}
          <path d="M41 62 Q50 74 59 62 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="2" />
          {/* Gold Star Lapel Pin on Blue Shirt */}
          <path d="M26 80 Q50 75 74 80 L78 98 L22 98 Z" fill="#2563eb" />
          <polygon points="50,84 52,89 57,89 53,92 55,97 50,94 45,97 47,92 43,89 48,89" fill="#facc15" />
        </svg>
      );

    // ==========================================
    // 16. ZARA THE EXPERIENCE STAR (3D Cartoon Human)
    // ==========================================
    case 'specialist-zara':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <radialGradient id="zaraSkin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="65%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          {/* High Textured Afro-Puff / Curly Crown */}
          <circle cx="50" cy="26" r="22" fill="#1c1917" />
          <circle cx="36" cy="22" r="14" fill="#1c1917" />
          <circle cx="64" cy="22" r="14" fill="#1c1917" />
          <circle cx="50" cy="14" r="14" fill="#292524" />
          {/* Golden Headband */}
          <ellipse cx="50" cy="36" rx="20" ry="3.5" fill="#facc15" />
          {/* Face */}
          <circle cx="50" cy="54" r="26" fill="url(#zaraSkin)" />
          {/* Gold Stud Earrings */}
          <circle cx="23" cy="56" r="3.2" fill="#facc15" />
          <circle cx="77" cy="56" r="3.2" fill="#facc15" />
          {/* Radiant Expressive Eyes */}
          <ellipse cx="39" cy="50" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="39" cy="50" r="3.5" fill="#1c1917" />
          <circle cx="37.5" cy="47.5" r="1.4" fill="#ffffff" />

          <ellipse cx="61" cy="50" rx="4.5" ry="5.5" fill="#ffffff" />
          <circle cx="61" cy="50" r="3.5" fill="#1c1917" />
          <circle cx="59.5" cy="47.5" r="1.4" fill="#ffffff" />
          {/* Warm Radiant Smile */}
          <path d="M42 65 Q50 75 58 65 Z" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          {/* Plum Uniform Jacket */}
          <path d="M28 82 Q50 76 72 82 L76 98 L24 98 Z" fill="#701a75" />
        </svg>
      );
  }
};

export const Staff3DAvatar: React.FC<Staff3DAvatarProps> = ({
  avatarId = 'lion-king',
  avatarColor = '#d97706',
  staffName = '',
  size = 'md',
  withRing = true,
  ringTier = 'none',
  interactive = false,
  onClick,
  className = ''
}) => {
  const normalizedId = normalizeAvatarId(avatarId);
  const preset =
    AVATAR_PRESETS.find((p) => p.id === normalizedId) || AVATAR_PRESETS[0];

  // Size specifications
  const sizeMap = {
    xs: {
      container: 'w-7 h-7',
      innerPadding: 'p-0.5'
    },
    sm: {
      container: 'w-9 h-9',
      innerPadding: 'p-0.5'
    },
    md: {
      container: 'w-11 h-11',
      innerPadding: 'p-1'
    },
    lg: {
      container: 'w-14 h-14',
      innerPadding: 'p-1'
    },
    xl: {
      container: 'w-20 h-20',
      innerPadding: 'p-1.5'
    },
    '2xl': {
      container: 'w-28 h-28',
      innerPadding: 'p-2'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // 3D metallic ring tiers
  let ringClasses = '';
  if (withRing) {
    if (ringTier === 'gold') {
      ringClasses =
        'ring-3 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_16px_rgba(251,191,36,0.55)]';
    } else if (ringTier === 'silver') {
      ringClasses =
        'ring-3 ring-slate-300 ring-offset-2 ring-offset-slate-900 shadow-[0_0_12px_rgba(203,213,225,0.45)]';
    } else if (ringTier === 'bronze') {
      ringClasses =
        'ring-3 ring-orange-500 ring-offset-2 ring-offset-slate-900 shadow-[0_0_12px_rgba(249,115,22,0.4)]';
    } else {
      ringClasses = 'ring-2 ring-white/70 shadow-xs';
    }
  }

  return (
    <div
      onClick={interactive ? onClick : undefined}
      title={staffName ? `${staffName} (${preset.name})` : preset.name}
      className={`relative inline-flex items-center justify-center rounded-2xl select-none transition-transform duration-200 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${currentSize.container} ${ringClasses} ${className}`}
      style={{
        backgroundColor: avatarColor,
        boxShadow:
          size === 'xl' || size === '2xl'
            ? 'inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.35), 0 10px 20px -2px rgba(0,0,0,0.38)'
            : 'inset 0 1.5px 2px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.3), 0 4px 8px -1px rgba(0,0,0,0.28)'
      }}
    >
      {/* 3D Gloss reflection sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />

      {/* 3D Cartoon Character Graphic */}
      <div className={`relative z-10 w-full h-full ${currentSize.innerPadding} flex items-center justify-center`}>
        <Cartoon3DCharacter avatarId={normalizedId} />
      </div>
    </div>
  );
};

export interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMemberRecord;
  onSaveAvatar: (
    staffId: string,
    avatarId: string,
    avatarColor: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSaveAvatar
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    normalizeAvatarId(staff.avatarId)
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    staff.avatarColor || '#d97706'
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'animal' | 'human'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedAvatarId(normalizeAvatarId(staff.avatarId));
      setSelectedColor(staff.avatarColor || '#d97706');
      setModalError(null);
    }
  }, [isOpen, staff]);

  if (!isOpen) return null;

  const currentPreset =
    AVATAR_PRESETS.find((p) => p.id === selectedAvatarId) || AVATAR_PRESETS[0];

  const filteredPresets = AVATAR_PRESETS.filter((p) => {
    if (activeCategoryFilter === 'all') return true;
    return p.category === activeCategoryFilter;
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    setModalError(null);
    const res = await onSaveAvatar(staff.id, selectedAvatarId, selectedColor);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setModalError(res.error || 'Failed to update avatar. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                3D Cartoon Character Avatars
              </span>
              <span className="text-xs text-slate-500 font-mono-tabular">ID: {staff.staffLoginId}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950 mt-1">
              Choose 3D Cartoon Avatar for {staff.staffName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your favorite 3D cartoon animal or human character and luxury metallic color. Appears on the 3D podium stage, leaderboard cards, and shift reports.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live 3D Cartoon Avatar Preview Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/60 text-white flex flex-col sm:flex-row items-center gap-5 shadow-inner">
          <div className="relative group">
            <Staff3DAvatar
              avatarId={selectedAvatarId}
              avatarColor={selectedColor}
              staffName={staff.staffName}
              size="2xl"
              withRing={true}
              ringTier="gold"
              className="transform hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
              <span>{currentPreset.badgeEmoji}</span>
              <span>3D</span>
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentPreset.category === 'animal' ? '3D Cartoon Animal' : '3D Cartoon Human'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {currentPreset.name}
            </div>
            <div className="text-xs text-indigo-200 mt-1">
              &ldquo;{currentPreset.description}&rdquo;
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-medium">
                Role: {staff.role}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 font-medium">
                Display: {staff.staffName}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Select Character ({filteredPresets.length} shown)
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All (16)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('animal')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeCategoryFilter === 'animal'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🐾 Animals (8)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('human')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeCategoryFilter === 'human'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>👤 Humans (8)</span>
            </button>
          </div>
        </div>

        {/* 16 Avatar Presets Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {filteredPresets.map((preset) => {
            const isSelected = preset.id === selectedAvatarId;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedAvatarId(preset.id)}
                title={`${preset.name}: ${preset.description}`}
                className={`group relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500 shadow-md scale-105'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl p-1 flex items-center justify-center text-white mb-1 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: selectedColor,
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  <Cartoon3DCharacter avatarId={preset.id} />
                </div>
                <span className="text-[10px] font-bold text-slate-800 text-center truncate w-full">
                  {preset.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-500 text-center truncate w-full">
                  {preset.badgeEmoji} {preset.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* 8 Color Palettes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Choose 3D Medallion Ring Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AVATAR_COLOR_PALETTES.map((palette) => {
              const isSelected = palette.hex.toLowerCase() === selectedColor.toLowerCase();
              return (
                <button
                  key={palette.hex}
                  type="button"
                  onClick={() => setSelectedColor(palette.hex)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-lg shrink-0 shadow-sm border border-white"
                    style={{ backgroundColor: palette.hex }}
                  />
                  <span className="text-xs text-slate-800 truncate">{palette.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {modalError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 font-medium">
            {modalError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving 3D Character...</span>
              </>
            ) : (
              <span>Save 3D Cartoon Avatar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
