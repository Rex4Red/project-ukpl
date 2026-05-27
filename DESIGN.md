# FertiliCalc — Kalkulator Dosis Pupuk Tanaman
## Design System & UI Specification

---

## 1. Brand Identity

**App Name**: FertiliCalc
**Tagline**: "Hitung Dosis Pupuk yang Tepat untuk Hasil Panen Optimal"
**Persona**: Modern agricultural tool — clean, trustworthy, fresh, professional
**Tone**: Friendly and approachable. Nature-inspired with clear data presentation.
**Logo**: 🌱 seedling emoji + "FertiliCalc" text

---

## 2. Color Palette

### Primary Colors
- **Primary**: `#2E7D32` (Green 800) — Nature, growth, agriculture
- **Primary Light**: `#43A047` (Green 600) — Buttons, active states
- **Primary Soft**: `#66BB6A` (Green 400) — Hover states, accents
- **Primary Pale**: `#A5D6A7` (Green 200) — Subtle highlights
- **Primary Surface**: `#E8F5E9` (Green 50) — Card accent backgrounds

### Semantic Colors
- **Safe**: `#2E7D32` (Green 800) — Safe dosage level
- **Normal**: `#1565C0` (Blue 800) — Normal dosage info
- **Warning**: `#E65100` (Orange 900) — Approaching max dosage
- **Danger**: `#C62828` (Red 800) — Over-dosage, contraindicated

### Neutral & Background Colors
- **Background**: `#FAFAFA` — Clean white page background
- **Surface / Cards**: `#FFFFFF` — Pure white card backgrounds
- **Input Background**: `#F5FAF5` — Very subtle green-tinted input fields
- **Border**: `#C8E6C9` (Green 100) — Soft green borders for cards and inputs
- **Border Light**: `#DCEDC8` (Light Green 100) — Table row dividers
- **Border Focus**: `#66BB6A` (Green 400) — Focused input ring
- **Text Primary**: `#1B2E1B` — Dark text for headings
- **Text Secondary**: `#3E5F3E` — Body text, table values
- **Text Muted**: `#7A9A7A` — Placeholders, hints, captions

---

## 3. Typography

**Font Family**: `Inter` (Google Fonts)
**Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| App Title (h1) | 36px | 800 | Primary `#2E7D32` |
| Subtitle | 16px | 500 | Text Secondary |
| Tagline | 14px | 400 | Text Muted |
| Form Label | 14px | 600 | Text Primary |
| Input Text | 15px | 400 | Text Primary |
| Hint Text | 12px | 400 | Text Muted |
| Button Text | 16px | 700 | White `#FFFFFF` |
| Result Value (large) | 28px | 800 | Primary |
| Result Label | 13px | 500 | Text Muted |
| Table Header | 13px | 600 | Primary, uppercase |
| Table Cell | 14px | 400 | Text Secondary |
| Badge Text | 13px | 700 | Semantic color |

---

## 4. Spacing & Layout

**Container**: max-width `800px`, centered, padding `24px`
**Card Padding**: `32px` desktop, `20px` mobile
**Card Border Radius**: `16px`
**Card Border**: `1px solid #C8E6C9`
**Card Shadow**: `0 4px 20px rgba(0,0,0,0.06)`
**Input Height**: `48px`
**Input Border Radius**: `10px`
**Input Border**: `1.5px solid #C8E6C9`
**Button Border Radius**: `10px`
**Checkbox Pill Radius**: `6px`
**Badge Radius**: `20px` (pill shape)

**Form Grid**: 2 columns on desktop, 1 column on mobile
**Gap between form rows**: `20px`
**Gap between columns**: `20px`

---

## 5. Component Specs

### 5.1 Header
- Centered layout
- 🌱 emoji icon (large, ~48px) + "FertiliCalc" title side by side
- Subtitle below: "Kalkulator Dosis Pupuk Tanaman"
- Tagline below subtitle in muted text

### 5.2 Form Card
- White background, green border, rounded 16px
- Contains all input fields in a 2-column grid
- Sections:
  - Row 1: Nama Petani (text) | Jenis Tanaman (dropdown)
  - Row 2: Luas Lahan in m² (number) | Usia Tanam in hari (number)
  - Row 3: Jenis Pupuk (dropdown) | pH Tanah (number)
  - Full width: Kondisi Khusus checkboxes (pill-shaped toggles)
  - Full width: Pupuk Lain dropdown
  - Full width: Submit button

### 5.3 Input Fields
- Background: `#F5FAF5` (very light green tint)
- Border: `1.5px solid #C8E6C9`
- Focus: border `#66BB6A` + box-shadow `0 0 0 3px rgba(46,125,50,0.12)`
- Placeholder color: `#7A9A7A`
- Label above each input with emoji icon prefix

### 5.4 Dropdown / Select
- Same styling as input fields
- White background for option list
- Custom down-arrow indicator

### 5.5 Checkbox Pills (Kondisi Khusus)
- Horizontal wrapping flex layout
- Each option is a pill-shaped label with checkbox inside
- Background: `#F5FAF5`, Border: `#C8E6C9`, Radius: `6px`
- Hover: background `#E8F5E9`, border `#66BB6A`
- Checked: accent-color green
- Options: Tanah Sangat Asam, Musim Kemarau, Bekas Banjir, Serangan Hama, Lahan Baru

### 5.6 Submit Button
- Full width
- Background: linear-gradient `#43A047` → `#2E7D32`
- Text: white, 16px, bold
- Padding: `16px`
- Hover: lift up 2px + green box-shadow glow
- Active: press down
- Icon: 🌿 before text "Hitung Dosis Pupuk"

### 5.7 Result Card
- White background with green border
- Header: 🌿 icon + "Hasil Perhitungan Dosis" title in green
- Below header: 2px green divider line

**Summary Grid** (3 columns):
- Item 1: Total Dosis (large green number + "kg" unit)
- Item 2: Dosis per Hektar (large green number + "kg/ha")
- Item 3: Estimasi Biaya (formatted Rupiah)
- Each item: `#E8F5E9` background, `#C8E6C9` border, centered text

**Safety Badge**:
- Pill shape, inline display
- Green variant: bg `#E8F5E9`, text `#2E7D32`, border `#A5D6A7`
- Blue variant: bg `#E3F2FD`, text `#1565C0`, border `#90CAF9`
- Orange variant: bg `#FFF3E0`, text `#E65100`, border `#FFCC80`
- Red variant: bg `#FFEBEE`, text `#C62828`, border `#EF9A9A`

**Warning Boxes** (border-left 3px):
- Success: bg `#E8F5E9`, border-left `#2E7D32`, text `#1B5E20`
- Info: bg `#E3F2FD`, border-left `#1565C0`, text `#0D47A1`
- Warning: bg `#FFF3E0`, border-left `#E65100`, text `#BF360C`
- Error: bg `#FFEBEE`, border-left `#C62828`, text `#B71C1C`

**Detail Table**:
- Full width, rounded border
- Header row: `#E8F5E9` background, green uppercase text
- Body rows: subtle bottom border, hover highlight `#F5FAF5`
- Two sections: "Detail Perhitungan" and "Faktor Penyesuaian"

### 5.8 Error Card
- White background, red border `#EF9A9A`
- Red heading, bullet list of validation errors
- Each error prefixed with ✕ symbol

### 5.9 Footer
- Centered, muted text, small font
- Top border divider `#C8E6C9`
- App version + UKPL project credit
- Disclaimer: agricultural advice note with ⚠️ icon

---

## 6. Page Layout

```
┌──────────────────────────────────────────────────┐
│                                                  │
│          🌱 FertiliCalc                          │  ← Header
│       Kalkulator Dosis Pupuk Tanaman             │
│  Hitung dosis pupuk yang tepat untuk panen optimal│
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  👨‍🌾 Nama Petani     🌿 Jenis Tanaman       │ │  ← Row 1
│  │  [________________]  [▼ Pilih Tanaman  ]    │ │
│  │                                             │ │
│  │  📐 Luas Lahan (m²)  📅 Usia Tanam (hari)   │ │  ← Row 2
│  │  [________]          [________]             │ │
│  │  Min: 1 | Max: 100000  🌱 Vegetatif (21-60)│ │
│  │                                             │ │
│  │  🧪 Jenis Pupuk       🔬 pH Tanah           │ │  ← Row 3
│  │  [▼ Pilih Pupuk   ]  [________]             │ │
│  │                       Skala 0-14            │ │
│  │                                             │ │
│  │  ⚡ Kondisi Khusus (opsional)                │ │  ← Checkboxes
│  │  [Tanah Asam] [Kemarau] [Banjir] [Hama]     │ │
│  │  [Lahan Baru]                               │ │
│  │                                             │ │
│  │  🔄 Pupuk Lain yang Sudah Diaplikasikan     │ │  ← Interaction
│  │  [▼ Tidak ada pupuk lain            ]       │ │
│  │                                             │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │    🌿 Hitung Dosis Pupuk               │ │ │  ← Submit
│  │  └────────────────────────────────────────┘ │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  🌿 Hasil Perhitungan Dosis                 │ │  ← Result Card
│  │  ─────────────────────────────────────────  │ │
│  │                                             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │  ← Summary
│  │  │ 50 kg    │ │100 kg/ha │ │Rp600.000 │    │ │
│  │  │Total Dosis│ │Per Hektar│ │Est. Biaya│    │ │
│  │  └──────────┘ └──────────┘ └──────────┘    │ │
│  │                                             │ │
│  │  ● AMAN (33% dari batas maks)              │ │  ← Badge
│  │                                             │ │
│  │  📊 Rentang: 42.5 — 57.5 kg                │ │  ← Range box
│  │                                             │ │
│  │  ⚠️ Kemarau: dosis dikurangi 50%            │ │  ← Warnings
│  │  🟡 Interaksi: NPK sudah mengandung N...   │ │
│  │                                             │ │
│  │  ┌─ Detail Perhitungan ──────────────────┐  │ │  ← Table
│  │  │ 👨‍🌾 Petani     │ Pak Budi              │  │ │
│  │  │ 🌿 Tanaman    │ Padi (Pangan)         │  │ │
│  │  │ 🧪 Pupuk      │ Urea (46% N)          │  │ │
│  │  │ 📐 Luas       │ 5.000 m² (0.5 ha)     │  │ │
│  │  │ 📅 Usia       │ 30 hari               │  │ │
│  │  │ 🌱 Fase       │ Vegetatif (Anakan)     │  │ │
│  │  │ 🔬 pH         │ 6.5                    │  │ │
│  │  ├─ Faktor Penyesuaian ──────────────────┤  │ │
│  │  │ Faktor Fase   │ ×1.0                   │  │ │
│  │  │ Faktor pH     │ ×1.0                   │  │ │
│  │  │ Faktor Kondisi│ ×0.5                   │  │ │
│  │  │ Batas Maks/ha │ 300 kg/ha              │  │ │
│  │  └───────────────────────────────────────┘  │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ─────────────────────────────────────────────── │
│  FertiliCalc v1.0 — Proyek UKPL 2026            │  ← Footer
│  ⚠️ Selalu konsultasikan dengan penyuluh pertanian│
└──────────────────────────────────────────────────┘
```

---

## 7. Interactions & Animations

| Element | Trigger | Animation |
|---------|---------|-----------|
| Form card | Page load | `fadeInUp` 0.6s ease |
| Header | Page load | `fadeInDown` 0.8s ease |
| Logo icon 🌱 | Idle | Gentle `pulse` scale 1→1.08 (3s loop) |
| Input focus | Click/Tab | Border color + glow ring (0.3s) |
| Button hover | Hover | Lift up 2px + green shadow |
| Button click | Click | Press down effect |
| Result card | Calculation done | `fadeInUp` 0.5s ease |
| Background blobs | Idle | Slow `float` movement (25s loop) |
| Phase hint | Age input change | Dynamic text update with green color |

---

## 8. Responsive Behavior

### Mobile (< 640px)
- Single column form layout
- Card padding reduced to 20px
- Summary grid: 2 columns (3rd wraps)
- Checkbox pills stack vertically
- Button full width

### Desktop (> 640px)
- 2-column form grid
- Summary grid: 3 columns
- Checkbox pills wrap horizontally
- Max-width 800px centered

---

## 9. Data Model

### Input Fields
| Field | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| farmerName | string | 2 chars | 100 chars | Yes |
| plantId | enum | - | - | Yes |
| landArea | number | 1 | 100000 | Yes |
| plantAge | number | 0 | 365 | Yes |
| fertilizerId | enum | - | - | Yes |
| soilPh | number | 0 | 14 | Yes |
| conditions | string[] | - | - | No |
| otherFertilizer | enum | - | - | No |

### Plant Options
- 🌾 Padi, 🌽 Jagung, 🌶️ Cabai Merah, 🍅 Tomat, 🌴 Kelapa Sawit, 🧅 Bawang Merah

### Fertilizer Options
- Urea (46% N), NPK Phonska (15-15-15), KCl (60% K₂O), SP-36 (36% P₂O₅), ZA, Pupuk Organik

### Condition Options
- Tanah Sangat Asam (pH < 5), Musim Kemarau, Bekas Banjir, Serangan Hama, Lahan Baru

---

## 10. Disclaimer

> "FertiliCalc adalah alat bantu perhitungan estimasi dosis pupuk. Selalu konsultasikan dengan penyuluh pertanian setempat untuk rekomendasi yang sesuai kondisi lahan Anda."

Style: muted text, small font 12px, with ⚠️ icon.
