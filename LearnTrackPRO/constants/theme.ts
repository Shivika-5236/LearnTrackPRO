

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const K = {
  bg:    '#0D1117',   // deep obsidian — richest dark bg
  card:  '#161D2A',   // elevated card surface
  card2: '#1E2B3C',   // secondary surface
  b:     '#273548',   // subtle blue-grey border
  acc:   '#7C6AF7',   // violet purple — primary accent
  accL:  'rgba(124,106,247,0.15)',
  accB:  'rgba(124,106,247,0.3)',
  t:     '#E4E9F4',   // soft lavender-white — body text
  t2:    '#6A80A4',   // muted steel blue — secondary text
  t3:    '#2C3D56',   // faint — placeholder / disabled
  g:     '#3ECFA8',   // mint green — success / done
  gL:    'rgba(62,207,168,0.14)',
  a:     '#F5C842',   // warm gold — streaks / warnings
  aL:    'rgba(245,200,66,0.14)',
  r:     '#E8627A',   // muted rose-red — danger
  rL:    'rgba(232,98,122,0.14)',
  fire:  '#F5A23A',   // fire streak accent
};

export const Colors = {
  primary: K.acc,
  danger: K.r,
  success: K.g,
  warning: K.a,
  icon: K.acc,
  dark: {
    background: K.bg,
    card: K.card,
    cardSecondary: K.card2,
    text: K.t,
    subtext: K.t2,
    disabled: K.t3,
    border: K.b,
    input: K.card2,
  },
  // For now, keeping light mode distinct but using similar tones if needed, 
  // though user requested this specific scheme for the "whole app".
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#64748B',
    input: '#F1F5F9',
    border: '#E2E8F0',
  },
};


export const Fonts = Platform.select({
  ios: {
    
    sans: 'system-ui',
   
    serif: 'ui-serif',
  
    rounded: 'ui-rounded',
   
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
