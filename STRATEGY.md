# SII Medical Website — Build Strategy & Prompts

## Brand Color Palette (from logo)

| Role            | Hex       | Usage                                    |
|-----------------|-----------|------------------------------------------|
| Teal Accent     | `#6aa1a1` | CTAs, links, highlights, hover states    |
| Dark Charcoal   | `#302d2d` | Primary text, dark backgrounds           |
| Deep Teal       | `#2d4444` | Section accents, dark hover states       |
| Steel Gray      | `#847e7d` | Subtext, borders, secondary elements     |
| Cool Gray       | `#8a9494` | SKU text, muted secondary text           |
| Light Silver    | `#c6c3c2` | Dividers, muted backgrounds              |
| Off-White       | `#dfdcdc` | Section backgrounds, alternating rows    |
| White           | `#ffffff` | Primary backgrounds, clean space         |

## Typography Direction

- **Headings:** A clean sans-serif with weight (e.g., Inter, Outfit, or Montserrat)
- **Body:** Highly readable sans-serif (e.g., Inter, Source Sans 3)
- **Accent/Tagline:** Optional serif for premium feel on key statements

---

## Site Architecture

```
HOME
├── ABOUT US
│   ├── Company Story & Mission
│   ├── Leadership / Team
│   └── Internship Program
├── WHY SINGLE-USE
│   ├── The Problem (HAIs, sterilization costs)
│   ├── The Susol Solution
│   └── Bailey Instruments Partnership
├── SHOP (Product Catalog)
│   ├── Filter by Category / Specialty
│   ├── Product Cards (image, name, SKU, specs)
│   └── Product Detail View
├── FEDERAL / GOVERNMENT
│   ├── Contract Info (SPE2DE-20-D-0014)
│   ├── TAA/BAA Compliance
│   └── VA/DOD/IHS Facilities Served
├── VIDEOS
├── BLOG / NEWS
├── FAQ
└── CONTACT US
    ├── General Inquiry Form
    └── Request a Quote Form
```

---

## Product Data (31 Products)

### Categories:
- Artery Forceps (4)
- Dissecting Forceps (2)
- Scissors (4)
- Scalpel Handles (2)
- Nippers (3)
- Files (1)
- Curettes (3)
- Podiatry Packs (3)
- Procedure Pack Sets (3)
- Digital Tourniquets (3)
- Suction Tubes (1)
- Other (Elevator, Needle Holder) (2)

### Medical Specialties Served:
General Surgery, Podiatry, ENT, Orthopaedics, Gynaecology, Maternity, Bio-mechanics, Diabetes Diagnostics, Vascular, Wound Care

### Full Product Catalog:

| SKU | Name | Category |
|-----|------|----------|
| SS09-0627 F | Halstead Mosquito Artery Forcep, Curved 12.5cm | Artery Forceps |
| SS09-0625 F | Halstead Mosquito Artery Forceps, Straight 12.5cm | Artery Forceps |
| SS09-0837 F | Spencer Wells Artery Forceps Straight 15cm | Artery Forceps |
| SS09-0835 F | Spencer Wells Artery Forceps Straight 12.5cm | Artery Forceps |
| SS11-1021 F | Adson Dissecting Forceps 1:2 Teeth 13cm | Dissecting Forceps |
| SS11-1020 F | Adson Dissecting Forceps Serrated 13cm | Dissecting Forceps |
| SS07-0282 F | Straight Scissors 11.5cm | Scissors |
| SS07-0291 F | Lister Bandage Scissors 18.5cm | Scissors |
| SS07-0284 F | Iris Curved Scissors | Scissors |
| SS07-0218 F | Dressing Scissors B/S Straight 13cm | Scissors |
| SS04-0110 F | Scalpel Handle Badger Fine | Scalpel Handles |
| SS04-0100 F | Scalpel Handle No.3 | Scalpel Handles |
| SS08-0539 F | Thwaites Nail Nipper 14cm | Nippers |
| SS08-0500 F | Nipper General Curved 13cm | Nippers |
| SS08-0537 F | Nipper Ingrown Nail 14cm | Nippers |
| SS08-0553 F | Blacks File SE Coarse 14cm | Files |
| SS08-0548 F | Elevator Nail Locke 14cm | Other |
| SS18-1716 F | Needle Holder Kilner 13.5cm | Other |
| SS62-6401 F | Curette Malleable D/E 2mm/3mm Scoops 180mm | Curettes |
| SS62-4300 F | Micro Curette D/E | Curettes |
| SS62-4349 F | Curette D/E 17cm, 2mm/3mm Scoops | Curettes |
| — | Susol Suction Tube Magill 9fg | Suction Tubes |
| BSDP-04 F | Basic Care Pack | Podiatry Packs |
| BSDP-03 F | PNA Procedure Pack | Podiatry Packs |
| BSDP-03-02 F | PNA Procedure Pack (8 instruments) | Podiatry Packs |
| SSP-132 F | Ulcer Debridement Pack Set | Procedure Pack Sets |
| SSP-024 F | Suture Pack Set | Procedure Pack Sets |
| SSP-021 F | Standard Suture Pack | Procedure Pack Sets |
| S-TQS | Digital Tourniquet Small (Orange) | Digital Tourniquets |
| S-TQM | Digital Tourniquet Medium (Green) | Digital Tourniquets |
| S-TQL | Digital Tourniquet Large (Blue) | Digital Tourniquets |

---

## Company Key Facts

- **Full Name:** Surgical Instruments & Innovations (SII Medical)
- **Tagline:** "Superior products. Superior outcomes."
- **Secondary:** "Single package. Single patient. Single procedure."
- **Location:** 3901 W Van Buren St. Suite 210/220, Phoenix, AZ 85009
- **Phone:** (602) 962-0422
- **Email:** sales@siimedical.com / team@siimedical.com
- **FDA Registration:** #1413711
- **Federal Contract:** SPE2DE-20-D-0014, Catalog #3263
- **TAA/BAA Compliant:** Yes
- **Manufacturer:** Bailey Instruments (UK, est. 1984, 35+ years)
- **Sterilization Partner:** STERIS ($19B+ company, EtO sterilization)
- **Federal Reach:** 40+ VA/DOD/IHS facilities
- **Social:** LinkedIn, Facebook

---

## Standing Rules (Apply to EVERY Phase)

**RESPONSIVE DEVELOPMENT:**
Every element, section, and component MUST be developed for both desktop and 
mobile simultaneously. Do not build desktop-only and "fix mobile later." 
Write mobile-first CSS, then layer on tablet/desktop overrides. After building 
each section, verify it works at 375px, 768px, and 1280px before moving on.

**SCREENSHOT VERIFICATION:**
After every significant edit or completed section, take desktop (1280px) and 
mobile (375px) screenshots of the current page and audit them. Check for:
- Layout breaks, overflow, or misalignment
- Text readability and spacing
- Touch target sizes on mobile (min 44x44px)
- Consistent styling with previously built sections
- Animations functioning correctly
Fix any issues found before proceeding to the next section.

---


## Key Design Principles

1. **Medical credibility** — Clean, precise, trustworthy. No playful or casual design.
2. **Teal as the hero color** — Use `#6aa1a1` strategically for CTAs, accents, and emphasis. Don't overuse it.
3. **Warm metallics for depth** — The browns and taupes from the logo add warmth to an otherwise clinical palette.
4. **White space is your friend** — Let content breathe. Medical audiences scan, they don't scroll endlessly.
5. **Animations serve a purpose** — Guide attention, reveal content, create polish. Never distract.
6. **Mobile is not an afterthought** — Hospital staff browse on tablets and phones between procedures.
7. **Speed matters** — Fast load times. No heavy frameworks unless justified.
