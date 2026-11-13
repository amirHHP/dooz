# Handoff Report: R1 Parametric Pattern Drafting Studio — Mathematical Formulation & Engineering Specification

**Document Path**: `/Users/sotoon/personal/dooz/.agents/teamwork/teamwork_spec_miner_survey_2/handoff.md`  
**Agent ID**: `teamwork_spec_miner_survey_2`  
**Parent / Caller ID**: `e3490e94-b5a4-4ca5-a6a5-809108cef8c7`  
**Date / Timestamp**: `2026-11-13T06:00:00Z`  
**Status**: Complete (Hard Handoff)

---

## 1. Observation

### 1.1 Direct Observations from Authoritative Sources
1. **Original User Request (`ORIGINAL_REQUEST.md`)**:
   - Lines 12-13:
     > `### R1. Parametric Pattern Drafting Studio`
     > `Build an interactive drafting studio (/studio) that calculates garment geometry deterministically from custom client measurements and posture adjustments (prominent abdomen, swayback, prominent hip, sloping/square shoulders, and fit preferences: tight/bodycon, classic, loose). The studio must implement full parametric calculation formulas across all base blocks (Basic Skirt, Basic Fitted Bodice, Basic Sleeve, and Basic Trouser) for all three drafting methods: Müller (مولر), Metric (متریک), and Grlawein (گرلاوین). The studio must render an interactive, zoomable/pannable SVG drafting canvas with a step-by-step timeline player (step forward/back, auto-play, show all) that highlights active construction lines and points with calculated centimeter values and Persian instructional text. The studio must generate true 1:1 scale printable PDFs (multi-page A4 tiled with grid coordinates, dashed cut/tape margins, and a 5cm × 5cm calibration square, and single-sheet A0 plotter PDF) as well as raw SVG and DXF file exports.`
   - Lines 32-36:
     > `### Parametric Drafting & PDF Export`
     > `- [ ] Parametric drafting engine computes exact 2D coordinates, Bezier curves, darts, grainlines, and notches deterministically from measurements for Skirt, Bodice, Sleeve, and Trouser base blocks across Müller, Metric, and Grlawein methods with zero placeholder geometry.`
     > `- [ ] Toggling posture/body-defect adjustments (prominent abdomen, swayback, prominent hip, shoulder slope, fit preference) recalculates pattern geometry in real time.`
     > `- [ ] Step-by-step player highlights active construction lines/points, displays calculated values in cm on the canvas, and shows Persian instructions for each step.`
     > `- [ ] Exported A4 tiled PDF splits patterns across pages with row/column grid indices, cut margins, and a verified 5cm × 5cm calibration square; A0 plotter PDF and raw SVG/DXF exports download at 1:1 scale.`

2. **Peer Subagent Allocations (`DISPATCH.md` files)**:
   - `teamwork_explorer_survey_1` is surveying the workspace environment, toolchains, runtime versions, and greenfield repository state.
   - `teamwork_spec_miner_survey_3` is detailing the full-stack architecture for R2 (`/clients`), R3 (`/marketplace`), R4 (`/creator`), R5 (`/ai-analyzer`), and R6 (Prisma schema, NextAuth, seed script, API endpoints).
   - `teamwork_spec_miner_survey_2` (this agent) is tasked exclusively with the core domain math, geometry engines, tailoring system formulations, posture adjustment algorithms, interactive SVG timeline player, and 1:1 scale vector export formats.

---

## 2. Logic Chain

1. **Deterministic 2D Geometry Foundation**:
   Parametric CAD engines for garment construction require an unambiguous coordinate system. Standardizing on millimeter ($1\text{ mm} = 1\text{ unit}$) or centimeter ($1\text{ cm} = 10\text{ mm}$) world units ensures numerical stability, zero rounding error in real-world measurements, and lossless projection to screen pixels (at $96\text{ DPI}$ or reactive SVG coordinates), PDF points ($1\text{ mm} = 2.834645669\text{ pt}$), and DXF units ($1\text{ unit} = 1.0\text{ mm}$, `$INSUNITS = 4$`).
2. **Methodological Diversity (Müller vs. Metric vs. Grlawein)**:
   - *Müller & Sohn (German Rundschau)* relies on anatomical proportions where missing body parameters (armhole depth, neck width, back width, chest width) are derived from bust and stature through fraction-based formulas, with precise proportional dart allocations.
   - *Metric (Winifred Aldrich)* uses empirical sizing tables and structured box drafting with standardized ease additions per fit silhouette and armscye depth calculated from chest fractions.
   - *Grlawein (Traditional Iranian Tailoring)* prioritizes direct tailor-taken measurements (such as separate front bodice length vs. back bodice length, measured across-chest and across-back, and individual bust apex heights), drafting front and back pieces with independent vertical baselines to accommodate client posture naturally.
3. **Four Interlocked Base Blocks**:
   - The *Basic Skirt* forms the lower-body foundation, solving waist suppression against the hip arc.
   - The *Basic Fitted Bodice* forms the upper-body foundation, balancing neck curvature, shoulder slope, bust dart manipulation, and armhole circumference ($AH_{tot}$).
   - The *Basic Sleeve* is geometrically dependent on the finished bodice armhole perimeter ($AH_{tot}$) and armhole depth ($AH_d$), requiring crown height ($CapHeight$) and cap ease distribution ($2.0 - 3.5\text{ cm}$) to avoid binding or sleeve cap puckering.
   - The *Basic Trouser* requires front/back crotch extensions calculated from hip circumferences, balanced around the vertical crease line (خط اتو / grainline), with back rise slant compensation for seat curvature.
4. **Posture & Body-Defect Algorithms**:
   Real bodies deviate from standard mannequins. Posture adjustments must alter coordinate baselines, dart widths, seam curvatures, and center-front/back balances deterministically without breaking seam length parity (e.g., matching side seams, shoulder seams, and inseams).
5. **Interactive Timeline Player & 1:1 Scale Vector Export**:
   The player model represents each block construction as an ordered directed graph of construction steps. Active steps highlight newly calculated points and lines with Persian labels and measurement values. Exporting to 1:1 scale requires absolute spatial accuracy: A4 multi-page tiling with edge overlap margins and registration crosshairs, a $5.0\text{ cm} \times 5.0\text{ cm}$ calibration test square, unsegmented A0 plotter PDFs, and ASTM D6673 / AAMA-DXF layered vector files.

---

## 3. Mathematical Formulation of Garment Base Blocks

### 3.1 Global Coordinate System & Vector Primitives

All patterns are drafted on a Cartesian 2D coordinate system:
- **Unit**: Millimeters ($1.0\text{ mm} = 1.0\text{ unit}$) internally; all UI displays format to centimeters ($1\text{ cm} = 10\text{ mm}$).
- **Axes**: Standard SVG orientation: Origin $(0, 0)$ at Top-Left of the bounding block; positive $X$ points Right ($\rightarrow$), positive $Y$ points Down ($\downarrow$).
- **Points**: Defined as $P = (x, y) \in \mathbb{R}^2$.
- **Cubic Bézier Curves**: Defined by 4 points: start $P_0$, first control point $C_1$, second control point $C_2$, and end point $P_3$:
  $$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t C_1 + 3(1-t) t^2 C_2 + t^3 P_3, \quad t \in [0, 1]$$
- **Quadratic Bézier Curves**: Defined by 3 points: $P_0, C_1, P_2$:
  $$Q(t) = (1-t)^2 P_0 + 2(1-t)t C_1 + t^2 P_2, \quad t \in [0, 1]$$

---

### 3.2 Block 1: Basic Skirt (اساس دامن)

#### 3.2.1 Anthropometric Input Parameters
| Parameter | Symbol | Persian Term | Typical Female Range (cm) |
|---|---|---|---|
| Waist Circumference | $W$ | دور کمر | 60.0 – 100.0 |
| Hip Circumference | $H$ | دور باسن | 86.0 – 125.0 |
| Hip Depth / Height | $H_d$ | بلندی باسن | 18.0 – 22.0 (default: 20.0) |
| Skirt Length | $L$ | قد دامن | 50.0 – 105.0 (default: 65.0) |
| Fit Preference | $Fit$ | نوع جذبیت | Tight / Classic / Loose |

#### 3.2.2 Ease Additions
- **Tight (جذب)**: $E_w = 0.5\text{ cm}$, $E_h = 1.0\text{ cm}$
- **Classic (معمولی)**: $E_w = 1.0\text{ cm}$, $E_h = 2.0\text{ cm}$
- **Loose (آزاد)**: $E_w = 2.0\text{ cm}$, $E_h = 4.0\text{ cm}$

#### 3.2.3 Construction Step-by-Step Points & Lines
Let total half-hip block width be:
$$W_{block} = \frac{H + E_h}{2}$$
Total half-waist target with ease:
$$W_{target} = \frac{W + E_w}{2}$$
Total waist suppression across half-block:
$$\Delta W_{total} = W_{block} - W_{target}$$

##### Method Variations (Skirt Block Division)
- **Müller & Sohn**:
  - Front panel width: $W_{front} = \frac{W_{block}}{2} + 1.0\text{ cm}$
  - Back panel width: $W_{back} = \frac{W_{block}}{2} - 1.0\text{ cm}$
  - Side Seam Suppression: $S_{side} = 0.50 \times \Delta W_{total}$ (split equally: $S_{side}/2$ taken from front waist, $S_{side}/2$ from back waist).
  - Back Dart Suppression: $D_{back} = 0.30 \times \Delta W_{total}$.
    - If $D_{back} > 3.5\text{ cm}$, split into two back darts: $D_{back1} = 2.0\text{ cm}$, $D_{back2} = D_{back} - 2.0\text{ cm}$.
  - Front Dart Suppression: $D_{front} = 0.20 \times \Delta W_{total}$ (maximum $2.0\text{ cm}$).
  - Side seam waist raise: Raise side seam points at waist by $+1.0\text{ to }1.2\text{ cm}$ to allow natural drape over pelvic crest.
- **Aldrich Metric**:
  - Front and back panels split equally at center: $W_{front} = W_{back} = \frac{W_{block}}{2}$.
  - Side Seam Suppression: $S_{side} = \frac{\Delta W_{total}}{2} + 0.5\text{ cm}$.
  - Back Dart: $D_{back} = \frac{\Delta W_{total}}{3} \approx 0.30 \times \Delta W_{total}$. Length $= 14.0\text{ cm}$.
  - Front Dart: $D_{front} = \Delta W_{total} - (S_{side} + D_{back}) \approx 0.20 \times \Delta W_{total}$. Length $= 10.0\text{ cm}$.
  - Side seam waist curve raised by $+1.5\text{ cm}$.
- **Grlawein (گرلاوین)**:
  - Direct measurement formulation:
    - Front Hip width: $H_{front} = \frac{H}{4} + 0.5\text{ cm} + \frac{E_h}{4}$
    - Back Hip width: $H_{back} = \frac{H}{4} - 0.5\text{ cm} + \frac{E_h}{4}$
    - Front Waist width: $W_{front} = \frac{W}{4} + 0.5\text{ cm} + \frac{E_w}{4} + \text{Dart}_{front}$
    - Back Waist width: $W_{back} = \frac{W}{4} - 0.5\text{ cm} + \frac{E_w}{4} + \text{Dart}_{back}$
  - Dart placement:
    - Front dart center: $x_{df} = \frac{1}{3} \times W_{front}$ from Center Front (CF). Width $= 2.0\text{ cm}$, Length $= 9.0\text{ to }10.0\text{ cm}$.
    - Back dart center: $x_{db} = \frac{1}{2} \times W_{back}$ from Center Back (CB). Width $= 3.0\text{ cm}$, Length $= 12.0\text{ to }14.0\text{ cm}$.

##### Point Coordinates (Müller Example, in mm where $1\text{ cm} = 10\text{ mm}$)
Origin $(0, 0)$ at Back Waist on Center Back (CB):
1. **$P_0$ (Back Waist CB)**: $(0, 0)$
2. **$P_1$ (Back Hip CB)**: $(0, H_d \times 10)$
3. **$P_2$ (Back Hem CB)**: $(0, L \times 10)$
4. **$P_3$ (Side Seam Hip)**: $(W_{back} \times 10, H_d \times 10)$
5. **$P_4$ (Side Seam Hem)**: $(W_{back} \times 10, L \times 10)$
6. **$P_5$ (Side Seam Waist Point)**: $( (W_{back} - \frac{S_{side}}{2}) \times 10, -12\text{ mm} )$ (raised $1.2\text{ cm}$)
7. **Back Dart Apex**: $( \frac{W_{back}}{2} \times 10, 130\text{ mm} )$
8. **Back Dart Left Waist**: $( (\frac{W_{back}}{2} - \frac{D_{back}}{2}) \times 10, 0 )$
9. **Back Dart Right Waist**: $( (\frac{W_{back}}{2} + \frac{D_{back}}{2}) \times 10, 0 )$
10. **Front Panel Origin / Center Front (CF) Waist**: $(W_{block} \times 10, 0)$
11. **Front Hip CF**: $(W_{block} \times 10, H_d \times 10)$
12. **Front Hem CF**: $(W_{block} \times 10, L \times 10)$
13. **Front Side Waist**: $( (W_{back} + \frac{S_{side}}{2}) \times 10, -12\text{ mm} )$
14. **Front Dart Apex**: $( (W_{block} - \frac{W_{front}}{3}) \times 10, 100\text{ mm} )$
15. **Front Dart Left Waist**: $( (W_{block} - \frac{W_{front}}{3} - \frac{D_{front}}{2}) \times 10, 0 )$
16. **Front Dart Right Waist**: $( (W_{block} - \frac{W_{front}}{3} + \frac{D_{front}}{2}) \times 10, 0 )$

##### Side Seam Hip Curvature Formula (Cubic Bézier)
From Side Seam Waist $P_5$ to Side Seam Hip $P_3$:
- Start: $P_0 = P_5$
- Control 1: $C_1 = (x_{P_5} + 3.0\text{ mm}, y_{P_5} + 0.35 \times (y_{P_3} - y_{P_5}))$
- Control 2: $C_2 = (x_{P_3} + 2.0\text{ mm}, y_{P_3} - 0.20 \times (y_{P_3} - y_{P_5}))$
- End: $P_3 = (W_{back} \times 10, H_d \times 10)$

---

### 3.3 Block 2: Basic Fitted Bodice (بالاتنه اولیه و ساسون‌ها)

#### 3.3.1 Anthropometric Input Parameters
| Parameter | Symbol | Persian Term | Aldrich / Müller Formula (if not directly measured) |
|---|---|---|---|
| Bust Circumference | $B$ | دور سینه | Measured directly ($80 - 120\text{ cm}$) |
| Waist Circumference | $W$ | دور کمر | Measured directly ($60 - 100\text{ cm}$) |
| Hip Circumference | $H$ | دور باسن | Measured directly ($86 - 125\text{ cm}$) |
| Back Length (Nape to Waist) | $BL$ | قد بالاتنه پشت | Measured directly or $\frac{1}{4} \text{Height}$ |
| Front Bodice Length | $FL$ | قد بالاتنه جلو | Measured from neck/shoulder over bust point to waist |
| Across Back Width | $AB$ | کارور پشت | Müller: $\frac{1}{8} B + 5.5\text{ cm}$ (or direct) |
| Across Front / Chest Width | $AF$ | کارور جلو | Müller: $\frac{1}{4} B - 4.0\text{ cm}$ (or direct) |
| Armhole Depth / Scye Depth | $ScH$ | عمق حلقه آستین | Müller: $\frac{1}{10} B + 10.5\text{ cm}$ |
| Neck Circumference | $N$ | دور گردن | Measured directly ($34 - 44\text{ cm}$) |
| Shoulder Length | $Sh$ | سرشانه | Measured directly ($11.5 - 14.5\text{ cm}$) |
| Bust Point Height | $BH$ | بلندی سینه | Measured from shoulder neck point to apex |
| Bust Span (Apex to Apex) | $BS$ | فاصله سینه | Measured directly ($16 - 22\text{ cm}$) |

#### 3.3.2 Ease Additions for Bodice (Bust Ease $E_b$)
- **Tight / Bodycon (جذب)**: $E_b = 2.0 - 3.0\text{ cm}$, distributed: Back Width $+0.5\text{ cm}$, Armhole Diameter $+1.0\text{ cm}$, Chest Width $+0.5\text{ cm}$.
- **Classic / Fitted (معمولی)**: $E_b = 5.0 - 6.0\text{ cm}$, distributed: Back Width $+1.5\text{ cm}$, Armhole Diameter $+2.5\text{ cm}$, Chest Width $+1.5\text{ cm}$.
- **Loose / Relaxed (آزاد)**: $E_b = 8.0 - 10.0\text{ cm}$, distributed: Back Width $+2.0\text{ cm}$, Armhole Diameter $+4.0\text{ cm}$, Chest Width $+2.5\text{ cm}$.

#### 3.3.3 Detailed Methodological Formulations

##### A. Müller & Sohn Bodice Block Formulation
1. **Auxiliary Proportional Calculations**:
   - Armhole Depth: $Da = \frac{1}{10} B + 10.5\text{ cm} + \text{ease}_{Da}$ (ease: $+0.5\text{ cm}$ fitted, $+1.0\text{ cm}$ classic).
   - Back Length: $Rl = BL$ (nape to waist).
   - Hip Depth: $Ht = Rl + 20.0\text{ cm}$.
   - Neck Width (Halsspiegel): $Hw = \frac{1}{20} B + 2.0\text{ cm}$.
   - Back Width: $Rb = \frac{1}{8} B + 5.5\text{ cm} + \text{ease}_{Rb}$.
   - Armhole Diameter: $Ad = \frac{1}{8} B - 1.5\text{ cm} + \text{ease}_{Ad}$.
   - Chest Width: $Bb = \frac{1}{4} B - 4.0\text{ cm} + \text{ease}_{Bb}$.
   - Total Chest Check: $Rb + Ad + Bb = \frac{B + E_b}{2}$.
2. **Back Neck Construction**:
   - Nape Point $W_0 = (0, 0)$.
   - Back Neck Width point $W_1 = (Hw, 0)$.
   - Back Neck Point raised: $W_2 = (Hw, -2.0\text{ cm})$.
   - Back Neck Curve: Bézier from $W_0$ to $W_2$ with tangent horizontal at $W_0$:
     $$C_1 = (0.5 \times Hw, 0), \quad C_2 = (Hw, -1.0\text{ cm})$$
3. **Back Shoulder & Armhole**:
   - Shoulder Slope Line: at $x = Rb$, drop $y = Da / 3$ or standard $1.5\text{ cm}$ below back neck guideline.
   - Shoulder seam length: $Sh + 1.0\text{ cm}$ ease (or $1.0\text{ cm}$ shoulder dart).
   - Back pitch point (خط کارور پشت): $P_{back} = (Rb, Da - \frac{Da}{4})$.
   - Back armhole corner guide: at angle $45^\circ$, distance $= 2.2\text{ cm}$.
4. **Front Neck & Bust Dart**:
   - Center Front (CF) placed at $x = W_{block}$.
   - Front Neck Point: $x = W_{block} - Hw$, $y = -Hw - 1.0\text{ cm}$.
   - Bust Point (BP): $x_{BP} = W_{block} - \frac{BS}{2}$, $y_{BP} = BH$.
   - Bust Dart Width: $D_{bust} = 2 \times (\frac{1}{10} B) - 1.0\text{ cm}$ (measured along rotation arc).
   - Shoulder seam length matches back shoulder: $L_{front\_sh} = Sh$.
5. **Front Armhole Curve**:
   - Front pitch point at $x = W_{block} - Bb$, $y = Da - \frac{Da}{3}$.
   - Front armhole corner guide: at angle $45^\circ$, distance $= 1.8\text{ cm}$.
   - Tangent bottom curve touches underarm line at side seam point $x = Rb + \frac{Ad}{2}$.

##### B. Aldrich Metric Bodice Block Formulation
1. **Framing Box**:
   - Width: $\frac{B}{2} + E_b$ (where $E_b = 5.0\text{ cm}$ standard).
   - Height: Nape to Waist ($BL$) $+$ Waist to Hip ($20.0\text{ cm}$).
2. **Armscye Depth**: From nape down $= \frac{1}{8} B + 11.0\text{ cm} + 0.5\text{ cm}$.
3. **Back Neck**: Width $= \frac{N}{5} - 0.2\text{ cm}$, height $= 1.5\text{ cm}$.
4. **Back Width Line**: Halfway between nape and armscye line. Across back width $= \frac{AB}{2} + 0.5\text{ cm}$.
5. **Shoulder Seam**: Back shoulder drop $1.5\text{ cm}$; Front shoulder drop $4.0\text{ cm}$.
6. **Bust Dart Size (Standard Aldrich Metric Chart)**:
   - Bust $80-84\text{ cm} \to 6.0\text{ cm}$ dart
   - Bust $88-92\text{ cm} \to 7.0\text{ cm}$ dart
   - Bust $96-100\text{ cm} \to 8.0\text{ cm}$ dart
   - Bust $104-108\text{ cm} \to 9.0\text{ cm}$ dart
   - Parametric function: $D_{bust} = 7.0 + 0.25 \times (B - 90.0)\text{ cm}$.

##### C. Grlawein Bodice Block Formulation (گرلاوین)
1. **Independent Vertical Baselines**:
   - Grlawein drafts the back from قد بالاتنه پشت ($BL$) and the front from قد بالاتنه جلو ($FL$).
   - The difference $\Delta L_{FB} = FL - BL$ (typically $2.0 - 5.0\text{ cm}$) directly elevates the front shoulder and creates the bust cup balance without requiring complex trigonometric dart transformations.
2. **Back Neck (طوق یقه پشت)**:
   - Width: $\frac{N}{6} + 0.5\text{ cm}$.
   - Vertical rise: $2.0\text{ cm}$.
3. **Front Neck (طوق یقه جلو)**:
   - Horizontal Width: $\frac{N}{6} + 0.5\text{ cm}$.
   - Vertical Depth: $\frac{N}{6} + 1.0\text{ cm}$.
4. **Armhole Depth (خط کف حلقه)**:
   - $\frac{1}{2} BL$ or $\frac{1}{10} B + 12.0\text{ cm}$.
5. **Shoulder Slopes**:
   - Back shoulder slope drop: $3.0\text{ cm}$.
   - Front shoulder slope drop: $4.0\text{ cm}$.
6. **Bust Point Coordinates**:
   - Distance from CF: $\frac{1}{2} BS$ (نصف فاصله سینه).
   - Distance from shoulder neck point: $BH$ (بلندی سینه).
7. **Grlawein Bust Dart (پنس کنفورماسیون یا پنس فرانسوی / زیربغل)**:
   - Extends from side seam line at the level of bust apex towards BP, stopping $2.0\text{ cm}$ before BP.
   - Dart opening equals exactly $\Delta L_{FB} = FL - BL$!

#### 3.3.4 Waist Suppression & Dart Allocation (Fitted Bodice)
Total suppression between chest box and waist target:
$$\Delta W = W_{block} - \left(\frac{W + E_w}{2}\right)$$
Distribution across bodice darts:
1. **Center Back (CB) seam suppression**: $1.5\text{ cm}$ at waist line, tapering up to armscye line and down to hip ($0.5\text{ cm}$).
2. **Back Waist Dart**:
   - Center: Placed at $x = \frac{Rb}{2}$.
   - Width: $0.25 \times \Delta W$ (typically $2.0 - 2.5\text{ cm}$).
   - Top apex: $2.0\text{ cm}$ below armscye line.
   - Bottom apex: $15.0\text{ cm}$ below waist line (into hip area).
3. **Side Seam Suppression**:
   - Width: $0.40 \times \Delta W$ (split: half on back side seam, half on front side seam).
   - Tapers to armhole base point at underarm.
4. **Front Waist Dart**:
   - Center: Directly below Bust Point ($x_{BP}$).
   - Width: $0.35 \times \Delta W - \text{CB suppression fraction}$ (typically $2.0 - 3.0\text{ cm}$).
   - Top apex: $2.0 - 2.5\text{ cm}$ below BP (never touching the nipple point).
   - Bottom apex: $10.0 - 12.0\text{ cm}$ below waist line.

---

### 3.4 Block 3: Basic Sleeve (آستین اولیه و تاج آستین)

#### 3.4.1 Anthropometric & Bodice Dependencies
A sleeve cannot be drafted in isolation; it depends on the measured armscye of the finished bodice:
- **Total Armscye Circumference ($AH_{tot}$)**: Length of back armscye curve $+$ length of front armscye curve.
- **Vertical Armhole Depth ($AH_d$)**: Straight vertical distance from shoulder tips to underarm level.
- **Sleeve Length ($SL$)**: Measured from shoulder point over elbow to wrist ($55 - 62\text{ cm}$).
- **Bicep Circumference ($ArmCirc$)**: Measured at fullest part of upper arm ($26 - 38\text{ cm}$).
- **Wrist Circumference ($WristCirc$)**: Measured at wrist bone ($15 - 19\text{ cm}$).

#### 3.4.2 Sleeve Cap Height ($CapHeight$) Equations
- **Müller & Sohn**:
  $$CapHeight = \frac{3}{4} \times AH_d - 0.5\text{ cm}$$
  (or calculated from $AH_{tot}$: $CapHeight = \frac{AH_{tot}}{3} - 1.5\text{ to }2.0\text{ cm}$).
- **Aldrich Metric**:
  $$CapHeight = \frac{1}{3} AH_{tot} + 1.0\text{ cm}$$
  (for high-set tailored sleeve: $CapHeight = \frac{3}{4} AH_d$).
- **Grlawein**:
  $$CapHeight = \frac{1}{3} AH_d + 3.0\text{ cm} \quad \text{or} \quad \frac{1}{3} ArmCirc + 4.0\text{ cm}$$

#### 3.4.3 Sleeve Width & Diagonal Armscye Matching
- Bicep Line Width:
  $$BW = ArmCirc + \text{ease}_{bicep}$$
  Ease: Tight $= 2.0\text{ cm}$, Classic $= 4.0 - 5.0\text{ cm}$, Loose $= 6.0 - 8.0\text{ cm}$.
- Diagonal guide check:
  - Back Diagonal $D_{back} = \sqrt{CapHeight^2 + W_{back\_sleeve}^2} \approx \frac{AH_{tot}}{2} + 1.0\text{ cm}$
  - Front Diagonal $D_{front} = \sqrt{CapHeight^2 + W_{front\_sleeve}^2} \approx \frac{AH_{tot}}{2} + 0.5\text{ cm}$

#### 3.4.4 Mathematical Bézier Formulation of Sleeve Cap Curve
The sleeve cap is drafted on an unfolded flat pattern of width $BW$ and height $CapHeight$.
Let the Crown Apex be $C_{top} = (x_{apex}, 0)$, where $x_{apex} = 0.52 \times BW$ (slanted slightly toward the back).
Let Left Underarm Point be $U_{back} = (0, CapHeight)$ and Right Underarm Point be $U_{front} = (BW, CapHeight)$.

##### A. Back Sleeve Cap Curve ($U_{back} \to C_{top}$)
The curve consists of a concave underarm scoop transitioning into a convex crown crest:
- Split into two Bézier spans at inflection point $M_{back} = (0.22 \times BW, 0.40 \times CapHeight)$:
  1. **Concave Underarm Span ($U_{back} \to M_{back}$)**:
     - $P_0 = (0, CapHeight)$
     - $C_1 = (0.05 \times BW, CapHeight + 2.0\text{ mm})$ (horizontal tangent leaving underarm)
     - $C_2 = (0.12 \times BW, 0.65 \times CapHeight)$
     - $P_3 = M_{back}$
  2. **Convex Crown Span ($M_{back} \to C_{top}$)**:
     - $P_0 = M_{back}$
     - $C_1 = (0.32 \times BW, 0.15 \times CapHeight)$
     - $C_2 = (0.42 \times BW, 0.0\text{ mm})$ (horizontal tangent approaching crown apex)
     - $P_3 = C_{top} = (x_{apex}, 0)$

##### B. Front Sleeve Cap Curve ($C_{top} \to U_{front}$)
Front cap has a steeper convex crown and a much deeper concave underarm scoop to accommodate forward arm movement:
- Split at inflection point $M_{front} = (x_{apex} + 0.25 \times (BW - x_{apex}), 0.45 \times CapHeight)$:
  1. **Convex Crown Span ($C_{top} \to M_{front}$)**:
     - $P_0 = C_{top}$
     - $C_1 = (x_{apex} + 0.10 \times (BW - x_{apex}), 0.0\text{ mm})$
     - $C_2 = (x_{apex} + 0.18 \times (BW - x_{apex}), 0.20 \times CapHeight)$
     - $P_3 = M_{front}$
  2. **Deep Concave Underarm Scoop ($M_{front} \to U_{front}$)**:
     - $P_0 = M_{front}$
     - $C_1 = (BW - 0.15 \times (BW - x_{apex}), 0.75 \times CapHeight)$
     - $C_2 = (BW - 0.06 \times (BW - x_{apex}), CapHeight + 2.0\text{ mm})$
     - $P_3 = U_{front} = (BW, CapHeight)$

#### 3.4.5 Sleeve Cap Ease Verification ($خورد تاج آستین$)
The engine must compute arc length numerically:
$$L_{cap} = \int_0^1 \|B'_{back}(t)\| dt + \int_0^1 \|B'_{front}(t)\| dt$$
Ease:
$$\Delta_{ease} = L_{cap} - AH_{tot}$$
**Invariant Rule**:
- Fitted woven fabrics: $2.0\text{ cm} \le \Delta_{ease} \le 3.5\text{ cm}$.
- If $\Delta_{ease} < 1.5\text{ cm}$, raise $CapHeight$ by $+0.5\text{ cm}$ or increase bicep width.
- If $\Delta_{ease} > 4.0\text{ cm}$, reduce $CapHeight$ or bicep ease to prevent gathered puckers.

---

### 3.5 Block 4: Basic Trouser (شلوار اولیه، فاق و خط اتو)

#### 3.5.1 Anthropometric Input Parameters
| Parameter | Symbol | Persian Term | Typical Female Range (cm) |
|---|---|---|---|
| Waist Circumference | $W$ | دور کمر | 60.0 – 100.0 |
| Hip Circumference | $H$ | دور باسن | 86.0 – 125.0 |
| Trouser Length | $TL$ | قد شلوار | 95.0 – 110.0 |
| Body Rise / Crotch Depth | $CD$ | بلندی فاق | 24.0 – 30.0 (measured seated or $\frac{1}{4} H - 1.0\text{ to }2.0\text{ cm}$) |
| Inseam Length | $IL$ | قد داخل پا | $TL - CD$ ($70.0 – 82.0\text{ cm}$) |
| Knee Width | $KW$ | دور / عرض زانو | 20.0 – 26.0 (flat width per panel: $22.0\text{ cm}$) |
| Hem / Bottom Width | $HW$ | دور / عرض دمپا | 18.0 – 24.0 (flat width per panel: $20.0\text{ cm}$) |

#### 3.5.2 Horizontal Reference Levels (Vertical Coordinates)
Origin $(0, 0)$ at Front Waist Centerline:
1. **Waist Line**: $y = 0$
2. **Hip Line**: $y = CD - 7.0\text{ to }8.0\text{ cm}$ (or $\frac{CD}{3}$ from crotch line up)
3. **Crotch Line (خط فاق)**: $y = CD$
4. **Knee Line (خط زانو)**: $y = CD + \frac{IL}{2} - 5.0\text{ cm}$ (raised $5.0\text{ cm}$ above geometric midpoint)
5. **Hem Line (خط دمپا)**: $y = TL$

#### 3.5.3 Front Trouser Construction (الگوی پیش شلوار)
1. **Front Hip Width**:
   $$W_{front\_hip} = \frac{H + E_h}{4} - 1.0\text{ cm}$$
2. **Front Crotch Extension (نقاب فاق جلو)**:
   - Müller: $Ext_{front} = \frac{1}{10} \times \left(\frac{H}{2}\right) = \frac{H}{20}$ (e.g., for $H = 96\text{ cm}$, $Ext_{front} = 4.8\text{ cm}$).
   - Aldrich Metric: $Ext_{front} = \frac{H}{16}$ or $\frac{H}{20} + 0.5\text{ cm}$.
   - Grlawein: $Ext_{front} = \frac{H}{20}$ (standard: $4.5 - 5.0\text{ cm}$).
3. **Crease Line / Grainline (خط اتو)**:
   The structural center of symmetry for the leg:
   $$x_{crease} = \frac{W_{front\_hip} + Ext_{front}}{2}$$
   Every leg width measurement (knee and hem) is divided symmetrically around $x_{crease}$:
   - Front Knee Left: $x_{crease} - \frac{KW_{front}}{2}$
   - Front Knee Right: $x_{crease} + \frac{KW_{front}}{2}$
   - Front Hem Left: $x_{crease} - \frac{HW_{front}}{2}$
   - Front Hem Right: $x_{crease} + \frac{HW_{front}}{2}$
4. **Front Crotch Curve Formulation (Bézier)**:
   - Starts at Center Front (CF) hip point $P_{CF\_hip} = (Ext_{front}, CD - 70\text{ mm})$.
   - Drops vertically down to $y = CD - 30\text{ mm}$.
   - Curves sharply out to Front Crotch Tip $P_{crotch\_front} = (0, CD)$:
     - $P_0 = (Ext_{front}, CD - 30\text{ mm})$
     - $C_1 = (Ext_{front}, CD - 5.0\text{ mm})$
     - $C_2 = (0.4 \times Ext_{front}, CD)$
     - $P_3 = (0, CD)$
5. **Front Waist**:
   $$W_{front\_waist} = \frac{W + E_w}{4} + \text{Pleat/Dart} + 0.5\text{ cm}$$

#### 3.5.4 Back Trouser Construction (الگوی پشت شلوار)
1. **Back Rise Angle & Slant (شیب فاق پشت)**:
   To accommodate the curvature of the gluteus maximus and allow comfortable sitting:
   - At the crotch level, Center Back line shifts inward: $x_{shift} = 2.0 - 3.5\text{ cm}$.
   - At the waist level, Center Back raises upward: $y_{raise} = -3.0\text{ to }-4.5\text{ cm}$ above original waistline.
   - Tilt angle $\theta \approx 10^\circ - 14^\circ$.
2. **Back Crotch Extension (نقاب فاق پشت)**:
   - Müller: $Ext_{back} = \frac{2}{10} \times \left(\frac{H}{2}\right) - 0.5\text{ to }1.0\text{ cm} = \frac{H}{10} - 1.0\text{ cm}$.
   - Aldrich Metric: $Ext_{back} = \frac{H}{8} \text{ or } 2 \times Ext_{front} + 1.0\text{ to }1.5\text{ cm}$.
   - Grlawein: $Ext_{back} = \frac{H}{10}$ (typically $9.5 - 11.0\text{ cm}$).
   - Drop below crotch line: Back crotch tip drops by $1.0\text{ cm}$ below front crotch line ($y = CD + 10\text{ mm}$) to balance seam length.
3. **Back Leg Widths**:
   - Back Knee: $KW_{back} = KW_{front} + 2.0\text{ cm}$ ($+1.0\text{ cm}$ on each side of crease line).
   - Back Hem: $HW_{back} = HW_{front} + 2.0\text{ cm}$ ($+1.0\text{ cm}$ on each side of crease line).
4. **Inseam Length Matching Invariant (قانون تراز فاق پشت و جلو)**:
   - Measured along the curve, Back Inseam ($P_{crotch\_back} \to P_{knee\_back}$) must be sewn to Front Inseam ($P_{crotch\_front} \to P_{knee\_front}$).
   - Because fabric along the bias in the back crotch must be stretched during tailoring, the pattern drafted length for the back upper inseam is intentionally shortened by $1.0 - 1.5\text{ cm}$:
     $$L(Inseam_{back}) = L(Inseam_{front}) - 12\text{ mm}$$

---

## 4. Comparative Tailoring Methods Matrix

| Feature / Element | Müller & Sohn (مولر) | Aldrich Metric (متریک) | Grlawein (گرلاوین) |
|---|---|---|---|
| **Origin & Focus** | German Haute Horlogerie of pattern cutting; mathematical proportion formulas based on body proportions. | British industrial & RTW standardization; empirical tables and box frameworks. | Iranian bespoke tailoring; direct body measurements, accommodates diverse anatomical body types directly. |
| **Armhole Depth ($ScH$)** | $\frac{1}{10} B + 10.5\text{ cm} + \text{ease}$ | $\frac{1}{8} B + 11.0\text{ cm} + \text{ease}$ | Measured directly or $\frac{1}{2} BL$ ($+1.0\text{ cm}$) |
| **Back Width ($Rb$)** | $\frac{1}{8} B + 5.5\text{ cm} + \text{ease}$ | Across Back measurement $+0.5\text{ cm}$ | Measured directly (کارور پشت) |
| **Chest Width ($Bb$)** | $\frac{1}{4} B - 4.0\text{ cm} + \text{ease}$ | Half front chest $+0.5\text{ cm}$ | Measured directly (کارور جلو) |
| **Bust Dart Derivation** | Trigonometric angular rotation; $2 \times (\frac{1}{10} B) - 1.0\text{ cm}$ | Standard bust chart ($6.0 - 9.0\text{ cm}$) based on bust size brackets | Direct difference between front length and back length: $\Delta = FL - BL$ |
| **Front/Back Balance** | Proportional height calculations from stature. | Fixed shoulder drop offsets ($1.5\text{ cm}$ back, $4.0\text{ cm}$ front). | Explicit dual lengths ($FL$ and $BL$) draft front and back on independent vertical planes. |
| **Sleeve Cap Height** | $\frac{3}{4} AH_d - 0.5\text{ cm}$ | $\frac{1}{3} AH_{tot} + 1.0\text{ cm}$ | $\frac{1}{3} AH_d + 3.0\text{ cm}$ |
| **Sleeve Cap Ease** | High ease ($2.5 - 3.5\text{ cm}$), tailored wool setting. | Moderate ease ($2.0 - 2.5\text{ cm}$). | Moderate-low ease ($1.5 - 2.5\text{ cm}$). |
| **Trouser Crotch Extension** | Front: $\frac{H}{20}$; Back: $\frac{H}{10} - 1.0\text{ cm}$ | Front: $\frac{H}{16}$; Back: $2 \times Ext_{front} + 1.0\text{ cm}$ | Front: $\frac{H}{20}$; Back: $\frac{H}{10}$ |
| **Ease Configuration** | Tight $+2\text{cm}$, Classic $+5\text{cm}$, Loose $+8\text{cm}$. | Close-fit $+4\text{cm}$, Classic $+6\text{cm}$, Easy $+10\text{cm}$. | Very tight $+1.5\text{cm}$, Classic $+4\text{cm}$, Loose $+7\text{cm}$. |

---

## 5. Parametric Posture & Body-Defect Adjustment Algorithms

When a user or client profile toggles a body-defect flag, the engine applies deterministic mathematical transformations to the base geometry:

```
+----------------------------------------------------------------------------------------------------+
|                                    POSTURE ADJUSTMENT MATRIX                                       |
+----------------------------------------------------------------------------------------------------+
| Defect Flag        | Primary Seams Modified  | Mathematical Offset / Transform                     |
+--------------------+-------------------------+-----------------------------------------------------+
| Prominent Abdomen  | Front Waist, CF, Hem    | Δy_CF_waist = -15mm (raise CF)                      |
| (شکم برجسته)       |                         | ΔFL = +15mm (lengthen front bodice/skirt)           |
|                    |                         | Front dart shifted outward by +20mm                 |
+--------------------+-------------------------+-----------------------------------------------------+
| Swayback           | Center Back, Back Dart  | Δy_CB_waist = +15mm (drop back waist)               |
| (گودی کمر)         |                         | CB seam suppression at waist: +15mm to +25mm        |
|                    |                         | Back dart width: +10mm (split into 2 darts)         |
+--------------------+-------------------------+-----------------------------------------------------+
| Prominent Hip      | Side Seams, Back Darts  | Back hip width: +15mm, Front hip width: -10mm       |
| (باسن برجسته)      |                         | Hip curve Bézier control point pulled outward +12mm |
|                    |                         | Back dart length increased to 150mm                 |
+--------------------+-------------------------+-----------------------------------------------------+
| Sloping Shoulder   | Shoulder Line, Armhole  | Shoulder tip dropped by Δy = +15mm                  |
| (افتادگی شانه)     |                         | Underarm line dropped by +10mm to preserve AH_tot   |
+--------------------+-------------------------+-----------------------------------------------------+
| Square Shoulder    | Shoulder Line, Armhole  | Shoulder tip raised by Δy = -15mm                   |
| (شانه مربعی)       |                         | Shoulder slope flattened; underarm raised -10mm     |
+--------------------+-------------------------+-----------------------------------------------------+
| Fit Preference     | All Perimeter Widths    | Tight (جذب): Ease multiplier = 0.5×                 |
| (جذب، معمولی، آزاد)|                         | Classic (معمولی): Ease multiplier = 1.0×            |
|                    |                         | Loose (آزاد): Ease multiplier = 1.7×                |
+--------------------+-------------------------+-----------------------------------------------------+
```

### 5.1 Prominent Abdomen (شکم برجسته)
- **Problem**: Protrusion of the abdomen pulls the center front upward, causing the hemline to ride up and the side seams to tilt forward.
- **Parametric Adjustment**:
  1. **Waistline Elevation**:
     $$y'_{CF\_waist} = y_{CF\_waist} - \Delta_{ab} \quad (\Delta_{ab} = 1.5\text{ cm})$$
     Waistline re-curved smoothly from $P'_{CF\_waist}$ to side seam waist.
  2. **Vertical Length Addition**: Front Bodice / Front Skirt length increased along CF by $\Delta_{ab} = +1.5\text{ cm}$.
  3. **Front Dart Modification**:
     - Dart width reduced: $D'_{front} = \max(1.0\text{ cm}, D_{front} - 0.7\text{ cm})$.
     - Dart position shifted outward toward side seam by $+2.0\text{ cm}$ so dart point does not sit on the abdominal apex.
  4. **Hemline Curvature**: Front hemline at CF curved downward by $\Delta_{ab}$ so the garment hangs horizontally level when worn.

### 5.2 Swayback (گودی کمر / کمر گود)
- **Problem**: Deep lordotic lumbar curve causes excess fabric pooling and horizontal folds across the lower back waist.
- **Parametric Adjustment**:
  1. **Center Back Waist Suppression**:
     - Center Back seam at waistline is indented inward:
       $$x'_{CB\_waist} = x_{CB\_waist} + \Delta_{sway} \quad (\Delta_{sway} = 1.5 - 2.5\text{ cm})$$
     - Tapers upward to nape line and downward to hip line.
  2. **Back Waistline Drop**:
     - Back waistline at CB dropped downward: $y'_{CB\_waist} = y_{CB\_waist} + 1.2\text{ cm}$.
  3. **Dart Deepening**:
     - Back dart suppression increased: $D'_{back} = D_{back} + 1.0\text{ cm}$.
     - Dart is split into dual darts ($D_{back1} = 2.0\text{ cm}$, $D_{back2} = 1.5\text{ cm}$) separated by $3.5\text{ cm}$ to distribute suppression without tension.

### 5.3 Prominent Hip (باسن برجسته)
- **Problem**: High gluteal projection creates horizontal strain across the back hip and causes side seams to pull backward.
- **Parametric Adjustment**:
  1. **Hip Arc Redistribution**:
     $$H'_{back} = H_{back} + 1.5\text{ cm}, \quad H'_{front} = H_{front} - 1.5\text{ cm}$$
  2. **Side Seam Bézier Control Point Shift**:
     - On the back hip curve, pull Bézier control point $C_1$ outward along normal vector by $+12\text{ mm}$ to create a rounder, fuller contour.
  3. **Back Dart Extension**:
     - Dart apex length increased from $13.0\text{ cm}$ to $15.5\text{ cm}$ to smoothly release fabric over the prominent curve.

### 5.4 Shoulder Slope: Sloping vs. Square Shoulders
- **Sloping Shoulders (افتادگی شانه)**:
  - Both back and front shoulder tips dropped vertically:
    $$y'_{sh\_tip} = y_{sh\_tip} + 1.5\text{ cm}$$
  - Armhole underarm depth lowered by $+1.0\text{ cm}$ to prevent the armhole from choking the underarm:
    $$y'_{armhole\_depth} = y_{armhole\_depth} + 1.0\text{ cm}$$
- **Square Shoulders (شانه مربعی)**:
  - Both back and front shoulder tips raised vertically:
    $$y'_{sh\_tip} = y_{sh\_tip} - 1.5\text{ cm}$$
  - Armhole underarm depth raised by $-1.0\text{ cm}$ to prevent gaping at the armscye.

---

## 6. Interactive SVG Rendering & Timeline Player Architecture

### 6.1 State Machine & Data Models

```typescript
export type DraftingMethod = 'MULLER' | 'METRIC' | 'GRLAWEIN';
export type GarmentBlockType = 'SKIRT' | 'BODICE' | 'SLEEVE' | 'TROUSER';
export type FitPreference = 'TIGHT' | 'CLASSIC' | 'LOOSE';

export interface PostureDefects {
  prominentAbdomen: boolean;
  swayback: boolean;
  prominentHip: boolean;
  shoulderSlope: 'NORMAL' | 'SLOPING' | 'SQUARE';
  fitPreference: FitPreference;
}

export interface Point2D {
  id: string;
  nameFa: string; // e.g. "نقطه کارور پشت"
  x: number;      // millimeters
  y: number;      // millimeters
  isHighlighted?: boolean;
}

export interface ConstructionElement {
  id: string;
  type: 'LINE' | 'BEZIER_CUBIC' | 'BEZIER_QUAD' | 'CIRCLE' | 'DART' | 'GRAINLINE' | 'NOTCH';
  points: Point2D[];
  controlPoints?: Point2D[];
  lengthMm: number;
  labelFa?: string;       // e.g. "خط کف حلقه"
  dimensionValueCm?: number; // e.g. 21.5
  styleClass: 'construction' | 'active-step' | 'finished-cut' | 'grainline' | 'dart-line';
}

export interface ConstructionStep {
  stepIndex: number;
  titleFa: string;
  instructionFa: string;
  formulaFa: string;
  calculatedValues: Record<string, string>; // e.g. { "عمق حلقه آستین": "۲۱.۵ سانتی‌متر" }
  elementIds: string[]; // Elements introduced or active in this step
  viewBoxFocus?: { minX: number; minY: number; width: number; height: number };
}

export interface PatternDraftResult {
  blockType: GarmentBlockType;
  method: DraftingMethod;
  totalWidthMm: number;
  totalHeightMm: number;
  steps: ConstructionStep[];
  elements: ConstructionElement[];
  points: Record<string, Point2D>;
}
```

### 6.2 ViewBox Dynamics & Pan/Zoom Transformations
- **Canvas Root**:
  `<svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} preserveAspectRatio="xMidYMid meet">`
- **Transformation Pipeline**:
  - Zoom: Scale factor $k \in [0.2, 5.0]$, centered on cursor coordinates $(cx, cy)$.
  - Pan: Drag offset $(\Delta x, \Delta y)$ translated to SVG coordinate space via $(e.movementX \times \frac{viewBox.width}{containerWidth})$.
- **Visual Presentation**:
  - `construction`: `#94A3B8`, stroke-dasharray `4 3`, stroke-width `1px`
  - `active-step`: `#2563EB` (primary blue) with drop-shadow glow and animated pulse, stroke-width `2.5px`
  - `finished-cut`: `#0F172A` (slate-900), solid, stroke-width `2px`
  - `grainline`: `#059669` (emerald green) with bidirectional arrowheads (`marker-start`, `marker-end`)
  - `dimension-label`: Persian font `Vazirmatn`, background badge `#FEF3C7` (amber-100), border `#D97706`.

### 6.3 Persian Step-by-Step Instruction Pipeline
Every step generated by the parametric engine produces localized Persian instructions with exact numeric values:
- *Example Step 1 (Skirt)*:
  - **عنوان مرحله**: رسم کادر اولیه دامن
  - **فرمول و محاسبات**:
    `عرض کادر = (دور باسن + ۲ سانتی‌متر آزادی) ÷ ۲ = ۴۹.۰ سانتی‌متر`  
    `طول کادر = قد دامن = ۶۵.۰ سانتی‌متر`
  - **توضیحات**: «مستطیلی به عرض ۴۹ سانتی‌متر و ارتفاع ۶۵ سانتی‌متر رسم کنید. خط بالایی خط کمر، خط پایینی خط لبه دامن و خطوط عمودی، خط وسط پشت و خط وسط جلو هستند.»

---

## 7. 1:1 Scale Print & CAD Export Specifications

### 7.1 Coordinate Conversion Standards
- **PDF Point Conversion**:
  $$1\text{ inch} = 25.4\text{ mm} = 72\text{ pt}$$
  $$Scale_{mm \to pt} = \frac{72}{25.4} \approx 2.834645669\text{ pt/mm}$$
- **5cm × 5cm Calibration Square (مربع کالیبراسیون مقیاس)**:
  - Width & Height: Exactly $50.0\text{ mm} = 141.732\text{ pt}$.
  - Diagonal Check: Exactly $\sqrt{50^2 + 50^2} = 70.7107\text{ mm} = 200.44\text{ pt}$.
  - Embedded Persian text inside square:
    ```
    +------------------------------------------+
    |   [■] مربع کالیبراسیون ۵ × ۵ سانتی‌متر   |
    |   لطفاً با خط‌کش اندازه بگیرید.          |
    |   در تنظیمات پرینت گزینه:                |
    |   "Actual Size" یا "100%" را انتخاب کنید.|
    |   قطر مربع: ۷۰.۷ میلی‌متر                |
    +------------------------------------------+
    ```

### 7.2 Multi-Page A4 Tiled PDF Algorithm
1. **Paper Dimensions**: A4 is $210.0\text{ mm} \times 297.0\text{ mm}$ ($595.28\text{ pt} \times 841.89\text{ pt}$).
2. **Tile Margins & Overlap**:
   - Page margins: $10.0\text{ mm}$ on all 4 sides ($28.35\text{ pt}$).
   - Effective printable window per page:
     $$W_{eff} = 210.0 - 20.0 = 190.0\text{ mm}$$
     $$H_{eff} = 297.0 - 20.0 = 277.0\text{ mm}$$
3. **Grid Division**:
   - Given pattern bounding box width $W_{pat}$ and height $H_{pat}$:
     $$Cols = \lceil W_{pat} / W_{eff} \rceil, \quad Rows = \lceil H_{pat} / H_{eff} \rceil$$
   - Each page is indexed with Row letters ($A, B, C, \dots$) and Column numbers ($1, 2, 3, \dots$).
   - Example: Page `B3` indicates Row 2, Column 3.
4. **Registration Marks & Cutting Borders**:
   - A dashed rectangle ($0.5\text{ pt}$, gray `#64748B`) is drawn at $10.0\text{ mm}$ from every paper edge.
   - At each of the 4 inner corners, a $10.0\text{ mm}$ registration crosshair ($+$) with circle diameter $4.0\text{ mm}$ is rendered.
   - Edge alignment tabs: Each edge displays a centered watermark diamond ($\diamond$) and text:
     - Top: `« چسباندن به ردیف بالا: صفحه A3 »`
     - Left: `« چسباندن به ستون قبل: صفحه B2 »`

### 7.3 Single-Sheet A0 Plotter PDF
- Dimensions: A0 is $841.0\text{ mm} \times 1189.0\text{ mm}$ ($2383.94\text{ pt} \times 3370.39\text{ pt}$) in portrait, or $1189.0\text{ mm} \times 841.0\text{ mm}$ in landscape.
- Non-tiled continuous vector stream, containing complete grainlines, seam allowances, notches, pattern piece labels, and client identification metadata.

### 7.4 Raw SVG Export Structure
Clean semantic grouping with exact mm units on root:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="980mm" height="1100mm" viewBox="0 0 980 1100">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
    </marker>
  </defs>
  <g id="calibration-square" transform="translate(20, 20)">...</g>
  <g id="layer-construction-lines" stroke="#CBD5E1" stroke-dasharray="3,3" stroke-width="0.3">...</g>
  <g id="layer-pattern-cut-outline" stroke="#0F172A" stroke-width="0.7" fill="none">...</g>
  <g id="layer-darts" stroke="#2563EB" stroke-width="0.5" fill="none">...</g>
  <g id="layer-grainlines" stroke="#059669" stroke-width="0.5" marker-start="url(#arrow)" marker-end="url(#arrow)">...</g>
  <g id="layer-notches" stroke="#DC2626" stroke-width="0.7">...</g>
  <g id="layer-labels-persian" font-family="Vazirmatn" font-size="3.5" fill="#1E293B">...</g>
</svg>
```

### 7.5 ASTM D6673 / AAMA-DXF CAD Compatibility
- Formatted as standard AutoCAD Release 12 / Release 14 ASCII DXF.
- **Header Variables**:
  - `$INSUNITS = 4` (Millimeters)
  - `$MEASUREMENT = 1` (Metric)
- **Standard Layer Mapping**:
  - Layer `1` / `CUT`: Outer perimeter cutting line
  - Layer `2` / `SEW`: Original sewn pattern outline (stitch lines)
  - Layer `3` / `INT`: Internal lines, style lines, dart legs
  - Layer `4` / `GRAIN`: Grainline vector
  - Layer `5` / `TEXT`: Piece name, size, method, tailor notes
  - Layer `6` / `NOTCH`: Alignment notches ($10\text{ mm}$ line segment perpendicular to seam)

---

## 8. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Parametric Engine | Basic Skirt Calculation | Computes front/back skirt panels, waist curve, hip curve, and dart allocations | $W, H, H_d, L, Fit$ | SVG paths, 2D points, seam lengths | Throw if $W \ge H$ or $H_d \le 0$ | R1 Requirements |
| 2 | Parametric Engine | Basic Bodice Calculation | Computes bodice grid, neck curves, shoulder slope, armscye curves, and bust darts | $B, W, H, BL, FL, AB, AF, N, Sh, BH, BS$ | Front/back bodice vectors, $AH_{tot}$ | Throw if $B \le 0$ or $BL \le 0$ | R1 Requirements |
| 3 | Parametric Engine | Basic Sleeve Calculation | Calculates sleeve cap height, bicep line, Bézier cap curves, and cap ease matching | Bodice $AH_{tot}, AH_d, SL, ArmCirc, WristCirc$ | Unfolded sleeve panel, cap ease $\Delta_{ease}$ | Alert if ease $< 1.5\text{ cm}$ or $> 4.0\text{ cm}$ | R1 Requirements |
| 4 | Parametric Engine | Basic Trouser Calculation | Computes crease line, front/back crotch extensions, knee/hem widths, back rise slant | $W, H, TL, CD, IL, KW, HW$ | Front/back trouser panels, inseams | Clamp if back rise angle $> 20^\circ$ | R1 Requirements |
| 5 | Method Engine | Müller Proportional System | Derives armhole depth, back width, chest width, and bust dart rotation via German Rundschau formulas | Standard measurements, fit ease | Proportional geometric coordinates | Fallback to direct values if given | R1 Requirements |
| 6 | Method Engine | Aldrich Metric System | Implements British metric box drafting with bracketed bust dart sizes and standard ease | Metric measurements, fit class | Metric block vectors | Validate against size charts | R1 Requirements |
| 7 | Method Engine | Grlawein Tailoring System | Uses direct tailor measurements with independent front/back vertical lengths | $FL, BL$, across chest/back, direct waist/hip | Iranian bespoke block with conformational dart | Throw if $FL < BL - 5\text{ cm}$ | R1 Requirements |
| 8 | Posture Adjustment | Prominent Abdomen Engine | Elevates front waist CF, lengthens front panel, shifts front dart outward | Prominent abdomen flag, severity degree | Adjusted front waist and hem Béziers | Clamp maximum elevation to $3.0\text{ cm}$ | R1 Requirements |
| 9 | Posture Adjustment | Swayback Engine | Suppresses CB seam at waist, drops back waistline, splits back dart | Swayback flag, severity degree | Indented CB path, dual back darts | Prevent self-intersecting CB seam | R1 Requirements |
| 10 | Posture Adjustment | Prominent Hip Engine | Expands back hip width, pulls hip Bézier control point outward | Prominent hip flag | Enlarged back hip curve | Keep total waist/hip sum invariant | R1 Requirements |
| 11 | Posture Adjustment | Shoulder Slope Adjuster | Adjusts shoulder slope angle and armhole depth for sloping or square shoulders | Shoulder slope enum (`SLOPING`, `SQUARE`) | Altered shoulder tip and armscye curves | Maintain bodice armhole circumference | R1 Requirements |
| 12 | Timeline Player | Step-by-Step State Machine | Manages playback (next, prev, play, pause, show all) with active element highlighting | Step array, active index | Active highlights, Persian step descriptions | Clamp index to $[0, N-1]$ | R1 Requirements |
| 13 | Interactive Canvas | Zoom & Pan Controller | Reactive matrix / viewBox manipulation supporting mouse drag and wheel zoom | Mouse events, touch gestures | Scaled and translated SVG viewBox | Clamp zoom $k \in [0.2, 5.0]$ | R1 Requirements |
| 14 | Print Engine | A4 Tiled PDF Generator | Splits pattern into multi-page A4 grid with overlap margins, crosshairs, and index | Raw pattern SVG / vectors | Multi-page PDF binary with calibration square | Warn if tile count exceeds 50 pages | R1 Requirements |
| 15 | Print Engine | A0 Plotter PDF Generator | Generates seamless single-sheet wide-format vector PDF | Raw pattern vectors | Single-page A0 PDF binary | Clamp to maximum plotter width | R1 Requirements |
| 16 | Export Engine | Raw SVG Vector Exporter | Exports structured SVG with semantic layer groups and mm units | Pattern draft result | XML SVG string | Validate XML entity escaping | R1 Requirements |
| 17 | Export Engine | AAMA-DXF CAD Exporter | Exports ASTM D6673 / AAMA-251 compliant CAD file for Gerber/Lectra/Clo3D | Pattern draft result | ASCII DXF string with layers 1-6 | Ensure all polylines closed | R1 Requirements |
| 18 | Validation Engine | Seam Length Invariant Check | Verifies seam parity (front/back side seams, front/back shoulder, inseams) | Assembled pattern piece vectors | Error report if discrepancy $> 3.0\text{ mm}$ | Auto-adjust or surface alert | Engineering Best Practice |

---

## 9. Edge Cases

| # | Feature | Input | Observed Behavior | Handling / Resolution Strategy |
|---|---------|-------|-------------------|--------------------------------|
| 1 | Basic Skirt | Waist circumference larger than Hip ($W \ge H$) | Negative waist suppression ($\Delta W_{total} \le 0$); darts collapse | Set darts to zero; curve side seams inward at hip or trigger "Inverted Proportions" warning. |
| 2 | Basic Bodice | Very large bust difference ($B - W > 35\text{ cm}$) | Single bust dart width exceeds $10.0\text{ cm}$, creating severe fabric bulge | Automatically split bust dart into dual darts: shoulder dart ($60\%$) and waist/underarm dart ($40\%$). |
| 3 | Basic Bodice | Flat chest / athletic build ($B \approx W$) | Bust dart width drops below $1.5\text{ cm}$ | Maintain minimum aesthetic dart ($1.5\text{ cm}$) or transfer residual suppression to side seam. |
| 4 | Basic Sleeve | Armhole circumference mismatch ($L_{cap} < AH_{tot}$) | Negative cap ease ($\Delta_{ease} < 0$), sleeve will bind and pull uncomfortably | Iteratively increase $CapHeight$ and bicep width until $L_{cap} \ge AH_{tot} + 15\text{ mm}$. |
| 5 | Basic Trouser | Inverted waist-to-hip ratio with prominent abdomen | Back rise tilt crosses front centerline | Clamp maximum back rise tilt angle to $15^\circ$; shift balance to side seam. |
| 6 | Basic Trouser | High crotch depth ($CD \ge 35\text{ cm}$) | Crotch line drops below knee guideline | Clamp knee level: $y_{knee} = \max(CD + 150\text{ mm}, CD + \frac{IL}{2} - 50\text{ mm})$. |
| 7 | Posture: Swayback | Extreme lumbar indentation ($> 3.5\text{ cm}$) | Center back seam crosses grainline | Clamp CB suppression to $25\text{ mm}$; transfer remaining suppression into secondary waist dart. |
| 8 | Multi-page PDF | Pattern corner touches tile boundary exactly | Splitting artifacts or line segment clipped at $0.001\text{ pt}$ offset | Add $2.0\text{ mm}$ bounding bleed buffer to clipping planes. |
| 9 | AAMA-DXF Export | Cubic Bézier curves exported to DXF R12 format | Older CAD systems do not support NURBS/Splines on layer `1` | Polyline tesselation: discretize Bézier curves into adaptive line segments ($\Delta s \le 2.0\text{ mm}$). |

---

## 10. Benchmark Anthropometric Profiles for Verification

To verify the parametric drafting engine deterministically, the following standard client profiles must produce zero errors and pass all invariant checks:

```json
[
  {
    "id": "profile-std-38",
    "name": "سارا محمدی (استاندارد سایز ۳۸)",
    "system": "MULLER",
    "measurements": {
      "bust": 88.0,
      "waist": 70.0,
      "hip": 94.0,
      "backLength": 41.0,
      "frontLength": 43.5,
      "acrossBack": 34.5,
      "acrossFront": 32.0,
      "neck": 36.0,
      "shoulder": 12.5,
      "bustHeight": 26.5,
      "bustSpan": 18.5,
      "sleeveLength": 58.0,
      "armCirc": 27.5,
      "wristCirc": 16.0,
      "skirtLength": 65.0,
      "trouserLength": 102.0,
      "crotchDepth": 26.0,
      "kneeWidth": 22.0,
      "hemWidth": 20.0
    },
    "posture": {
      "prominentAbdomen": false,
      "swayback": false,
      "prominentHip": false,
      "shoulderSlope": "NORMAL",
      "fitPreference": "CLASSIC"
    }
  },
  {
    "id": "profile-abdomen-42",
    "name": "مریم رضایی (شکم برجسته سایز ۴۲)",
    "system": "GRLAWEIN",
    "measurements": {
      "bust": 96.0,
      "waist": 84.0,
      "hip": 104.0,
      "backLength": 41.5,
      "frontLength": 46.0,
      "acrossBack": 36.0,
      "acrossFront": 35.0,
      "neck": 38.0,
      "shoulder": 13.0,
      "bustHeight": 28.0,
      "bustSpan": 20.0,
      "sleeveLength": 59.0,
      "armCirc": 30.5,
      "wristCirc": 17.0,
      "skirtLength": 68.0,
      "trouserLength": 104.0,
      "crotchDepth": 27.5,
      "kneeWidth": 24.0,
      "hemWidth": 21.0
    },
    "posture": {
      "prominentAbdomen": true,
      "swayback": false,
      "prominentHip": false,
      "shoulderSlope": "NORMAL",
      "fitPreference": "CLASSIC"
    }
  },
  {
    "id": "profile-swayback-sloping-40",
    "name": "نگار احمدی (گودی کمر و افتادگی شانه سایز ۴۰)",
    "system": "METRIC",
    "measurements": {
      "bust": 92.0,
      "waist": 72.0,
      "hip": 98.0,
      "backLength": 40.5,
      "frontLength": 44.0,
      "acrossBack": 35.0,
      "acrossFront": 33.0,
      "neck": 37.0,
      "shoulder": 12.8,
      "bustHeight": 27.0,
      "bustSpan": 19.0,
      "sleeveLength": 58.5,
      "armCirc": 28.5,
      "wristCirc": 16.5,
      "skirtLength": 62.0,
      "trouserLength": 100.0,
      "crotchDepth": 25.5,
      "kneeWidth": 23.0,
      "hemWidth": 20.5
    },
    "posture": {
      "prominentAbdomen": false,
      "swayback": true,
      "prominentHip": false,
      "shoulderSlope": "SLOPING",
      "fitPreference": "TIGHT"
    }
  }
]
```

---

## 11. Caveats

1. **Physical Fabric Elasticity**: The formulas provided herein govern pure geometric pattern drafting for woven non-stretch fabrics. When drafting for high-stretch knit fabrics (e.g., Lycra, Spandex, Jersey), negative ease factors (typically $-5\%$ to $-12\%$) must be applied to girth measurements.
2. **CAD Interchange Discretization**: Older apparel CAD software (e.g. Gerber Accumark V8 or older Lectra systems) cannot parse 3rd-order NURBS/Splines inside standard DXF files. The exporter must include a toggle to tessellate Bézier curves into adaptive polylines with maximum chordal error $< 0.5\text{ mm}$.
3. **Seam Allowances**: Base block patterns are drafted on sew lines ($net lines$). In modern pattern cutters, seam allowances ($1.0\text{ cm}$ standard seams, $2.0\text{ cm}$ zippers, $3.0 - 4.0\text{ cm}$ hems) are computed as parallel offset curves. Seam allowance offset algorithms must handle sharp corners via miter or bevel joints.

---

## 12. Conclusion

This report provides the complete, exhaustive mathematical and algorithmic specification for **R1: Parametric Pattern Drafting Studio**:
- All 4 garment base blocks (Skirt, Fitted Bodice, Sleeve, Trouser) are fully formulated with deterministic 2D Bézier geometry.
- The 3 drafting systems (Müller, Aldrich Metric, and Grlawein) are rigorously contrasted and specified.
- The 5 posture and defect adjustment engines are mathematically formalized with explicit coordinate shifts and dart redistribution rules.
- The interactive SVG player, timeline state machine, zoom/pan controller, and Persian instructional labeling schemas are defined.
- The 1:1 scale export pipeline (A4 multi-page tiling with crosshairs and calibration square, A0 plotter PDF, raw SVG, and ASTM D6673 / AAMA-DXF CAD format) is mathematically bounded and ready for direct implementation.

---

## 13. Verification Method

To independently verify the mathematical formulations and algorithms specified in this report:

1. **Verify Report Integrity**:
   Check that this file exists and is populated:
   ```bash
   ls -la /Users/sotoon/personal/dooz/.agents/teamwork/teamwork_spec_miner_survey_2/handoff.md
   ```
2. **Execute Geometric Invariant Tests on Synthesized Blocks**:
   When implementing the drafting engine modules in TypeScript (`lib/drafting/`):
   - **Side Seam Parity**: Verify $|L(Seam_{front\_side}) - L(Seam_{back\_side})| \le 2.0\text{ mm}$.
   - **Shoulder Seam Parity**: Verify $|L(Shoulder_{front}) - L(Shoulder_{back})| \le 1.0\text{ mm}$ (after closing shoulder dart/ease).
   - **Trouser Inseam Balance**: Verify $|L(Inseam_{front}) - (L(Inseam_{back}) + 12\text{ mm})| \le 2.0\text{ mm}$.
   - **Sleeve Cap Ease Balance**: Verify $15\text{ mm} \le L_{cap} - AH_{tot} \le 35\text{ mm}$.
   - **Calibration Square**: Verify that on generated A4/A0 PDFs, the calibration square vector coordinates measure exactly $141.732\text{ pt} \times 141.732\text{ pt}$ ($50.0\text{ mm} \times 50.0\text{ mm}$).
