#!/usr/bin/env python3
"""Aktionskarten für das Hybridspiel «Seestadt 2045» (einfache Version) als Word-Datei.
Inspiriert durch Postfossil Cities. Anders als im Vorbild beruhen die Annahmen nicht auf wissenschaftlich fundierten Werten, sondern sind grobe Schätzungen.

Liest die Massnahmen direkt aus einfach.html, damit Karten und Spiel immer übereinstimmen.
Die Texte lassen sich danach in Word bearbeiten.

    pip install python-docx
    python3 karten.py                      # liest ../einfach.html, schreibt Aktionskarten.docx
    python3 karten.py pfad/einfach.html ausgabe.docx

Die Hinweise (Kombinationen, Überschneidungen, Klimabonus) folgen denselben Regeln wie
cardFacts() in einfach.html. Wer dort Regeln ändert, passt card_facts() hier mit an.
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.table import WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

HERE = Path(__file__).resolve().parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / 'einfach.html'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'Aktionskarten.docx'

# ---------------------------------------------------------------- JS-Daten lesen
TOKEN = re.compile(r"\s+|//[^\n]*|'((?:\\.|[^'\\])*)'|(-?\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*)|([{}\[\]:,])")


def js_value(src, start):
    """Liest ein JS-Literal (Objekt, Array, String, Zahl) ab Position start."""
    toks, pos, depth = [], start, 0
    while True:
        m = TOKEN.match(src, pos)
        if not m:
            raise ValueError(f'Unerwartetes Zeichen bei {pos}: {src[pos:pos + 30]!r}')
        pos = m.end()
        s, n, ident, p = m.groups()
        if s is not None:
            toks.append(('s', re.sub(r"\\(.)", r"\1", s)))
        elif n is not None:
            toks.append(('n', float(n) if '.' in n else int(n)))
        elif ident is not None:
            toks.append(('i', ident))
        elif p is not None:
            toks.append(('p', p))
            depth += p in '{[' or -(p in '}]')
        else:
            continue
        if depth == 0:
            break
    it = iter(toks)

    def val(t):
        kind, v = t
        if kind == 'p' and v == '{':
            obj = {}
            while True:
                k = next(it)
                if k == ('p', '}'):
                    return obj
                if k == ('p', ','):
                    continue
                assert next(it) == ('p', ':'), 'Doppelpunkt erwartet'
                obj[str(k[1])] = val(next(it))
        if kind == 'p' and v == '[':
            arr = []
            while True:
                t2 = next(it)
                if t2 == ('p', ']'):
                    return arr
                if t2 != ('p', ','):
                    arr.append(val(t2))
        if kind == 'i':
            return {'true': True, 'false': False, 'null': None}.get(v, v)
        return v
    return val(next(it))


def js_const(src, name):
    m = re.search(r'const ' + re.escape(name) + r'\s*=\s*', src)
    if not m:
        raise SystemExit(f'«{name}» nicht in {SRC} gefunden.')
    return js_value(src, m.end())


html = SRC.read_text(encoding='utf-8')
CFG = js_const(html, 'CFG')
CATS = {c['id']: c for c in js_const(html, 'CATS')}
MEASURES = js_const(html, 'MEASURES')
LEVEL = js_const(html, 'LEVEL')
TAGS = js_const(html, 'TAGS')
CLIMATE = js_const(html, 'CLIMATE')
DIM_LABEL = js_const(html, 'DIM_LABEL')
HEAT_E = js_value(html, re.search(r'const HEAT_E = ', html).end())
CAR_E = js_value(html, re.search(r'CAR_E = ', html).end())
NR = {m['id']: i + 1 for i, m in enumerate(MEASURES)}
LV = {3: 'gross', 2: 'mittel', 1: 'wenig', -1: 'rückläufig'}
LVL = {'G': 'Gemeinde', 'K': 'Kanton', 'B': 'Bund'}
CAT_COL = {'energie': 'D97706', 'gebaeude': 'DC2626', 'mobil': '0284C7', 'essen': '65A30D',
           'kreislauf': '059669', 'regeln': 'BE123C', 'politik': '7C3AED'}


def nrs(ids):
    return 'Nr. ' + ', '.join(str(NR[x]) for x in ids)


def card_facts(m):
    fx = m['fx']
    clim = [fx[d] for d in CLIMATE if d in fx]
    pos = [x for x in clim if x > 0]
    klima = 0 if not clim else (max(pos) if pos else -1)
    strom = fx.get('strom', 0)
    where = [DIM_LABEL[d] for d in CLIMATE if fx.get(d, 0) > 0]
    hints = []
    if m['id'] in HEAT_E:
        hints.append(f"🤝 Mit Sanierung ({nrs(['daemm'])}): kein Strom-Abzug.")
    if m['id'] in CAR_E:
        hints.append(f"🤝 Mit Solarstrom oder Batterien ({nrs(['solar', 'balkon', 'smartgrid'])}): kein Strom-Abzug.")
    if m['id'] == 'daemm':
        hints.append(f'🤝 {nrs(HEAT_E)} brauchen dann keinen Zusatzstrom.')
    if m['id'] in ('solar', 'balkon', 'smartgrid'):
        hints.append(f'🤝 {nrs(CAR_E)} brauchen dann keinen Zusatzstrom.')
    for grp, what in ((CAR_E, 'Autos'), (HEAT_E, 'Ölheizungen')):
        if m['id'] in grp:
            hints.append(f"⤵ Ersetzt dieselben {what} wie {nrs([x for x in grp if x != m['id']])}: Die spätere Karte wirkt schwächer.")
    if m.get('abgabe'):
        hints.append(f"💌 Mit Klimabonus ({nrs(['klimabonus'])}): kein Geld, dafür nicht mehr umstritten.")
    elif m['acc'] < 0:
        hints.append(f"🤝 Mit Mitsprache ({nrs(['buerger'])}): weniger Gegenwind.")
    return {
        'nr': f"{NR[m['id']]:02d}", 'lvl': LVL[LEVEL[m['id']]],
        'tags': ' · '.join(CATS[t]['label'] for t in TAGS.get(m['id'], [m['cat']])),
        'klima': klima, 'strom': strom, 'kreis': LV.get(fx.get('kreis')),
        'where': ('weniger CO₂: ' + ', '.join(where)) if where else ('keine direkte Wirkung' if not clim else 'mehr CO₂ im Inland'),
        'cost': ('Einnahmen +' + '●' * -m['cost']) if m['cost'] < 0 else ('Kosten ' + '●' * m['cost']),
        'acc': '👍 beliebt' if m['acc'] > 0 else '👎 umstritten' if m['acc'] < 0 else '😐 neutral',
        'hints': hints,
    }


# ---------------------------------------------------------------- Word-Hilfen
def shade(el, fill):
    """Hintergrund für Lauf (w:r) oder Absatz (w:p); Reihenfolge laut Word-Schema."""
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), fill)
    if el.tag == qn('w:r'):
        el.get_or_add_rPr().append(shd)        # nach b/color/sz: gültig
    else:
        el.get_or_add_pPr().insert(0, shd)     # vor spacing/ind


def borders(cell, top_color):
    tcPr = cell._tc.get_or_add_tcPr()
    b = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right'):
        e = OxmlElement(f'w:{side}')
        if side == 'top':
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '36'); e.set(qn('w:color'), top_color)
        else:
            e.set(qn('w:val'), 'dashed'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), '94A3B8')
        b.append(e)
    tcPr.append(b)
    mar = OxmlElement('w:tcMar')
    for side, v in (('top', 110), ('left', 170), ('bottom', 80), ('right', 170)):
        e = OxmlElement(f'w:{side}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); mar.append(e)
    tcPr.append(mar)


def run(p, text, size=8, bold=False, color=None, fill=None):
    r = p.add_run(text)
    r.font.size = Pt(size); r.bold = bold
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    if fill:
        shade(r._r, fill)
    return r


def para(cell, first=False, after=1.5):
    p = cell.paragraphs[0] if first else cell.add_paragraph()
    p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    return p


def bars(lv):
    return '▼' if lv < 0 else '▮' * lv + '▯' * (3 - lv) if lv else ''


LV_FILL = {3: 'D1FAE5', 2: 'ECFCCB', 1: 'F1F5F9', -1: 'FFE4E6', 0: 'F1F5F9'}


def fill_card(cell, m):
    f = card_facts(m)
    col = CAT_COL.get(m['cat'], '475569')
    borders(cell, col)
    p = para(cell, first=True)
    run(p, f['nr'] + '  ', 12, True, col)
    run(p, f['tags'] + '  ', 7, color='475569')
    run(p, f['lvl'], 7, True, '0F172A', 'E2E8F0')
    p = para(cell, after=2)
    run(p, f"{m['icon']} {m['title']}", 13, True, '0F172A')
    p = para(cell)
    run(p, f" Klima {bars(f['klima'])} {LV.get(f['klima'], '–')} ", 9, True, fill=LV_FILL[f['klima']])
    run(p, '  ')
    run(p, f" Strom {bars(f['strom'])} {LV.get(f['strom'], '–')} ", 9, True, fill=LV_FILL[f['strom']])
    if f['kreis']:
        run(p, '  ')
        run(p, f" ♻️ Kreislauf {f['kreis']} ", 9, True, fill='F1F5F9')
    p = para(cell)
    run(p, f['where'], 8, color='475569')
    p = para(cell, after=2.5)
    run(p, m['why'], 9.5)
    for h in f['hints']:
        p = para(cell, after=1)
        shade(p._p, 'F1F5F9')
        run(p, h, 8, color='334155')
    p = para(cell, after=0)
    p.paragraph_format.space_before = Pt(3)
    run(p, f['cost'], 10, True)
    run(p, '      ' + f['acc'], 9)


# ---------------------------------------------------------------- Dokument
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.left_margin = sec.right_margin = sec.top_margin = sec.bottom_margin = Mm(8)
st = doc.styles['Normal']
st.font.name = 'Arial'; st.font.size = Pt(9)

# Spielregeln (erste Seite)
picks = CFG['picks']
rules = doc.add_paragraph(); rules.paragraph_format.left_indent = Mm(12)
run(rules, 'Seestadt 2045 – Hybridspiel mit Karten', 20, True)
steps = [
    ('Vorbereitung', 'Karten ausschneiden, mischen und an vier Gruppen verteilen. Die Spielleitung startet die einfache Version am Beamer.'),
    ('Vorschlagen', 'Pro Legislatur wählt jede Gruppe höchstens eine Karte und stellt sie den anderen vor.'),
    ('Verhandeln', f'Alle Beschlüsse zusammen dürfen das Budget (●, siehe Beamer) nicht übersteigen. Abgaben bringen Geld. Höchstens {picks} Beschlüsse, bei Gegenwind {picks - 1}. Tauschen und Passen sind erlaubt.'),
    ('Beschliessen', 'Karten der Spielleitung geben. Sie tippt die Nummern ins Suchfeld (z. B. «10 15 24 36») und drückt Enter.'),
    ('Auswerten', 'Ereignis und Drehmeter gemeinsam anschauen. Beschlossene Karten offen in die Mitte legen.'),
]
for i, (k, t) in enumerate(steps, 1):
    p = doc.add_paragraph(); p.paragraph_format.left_indent = Mm(12); p.paragraph_format.space_after = Pt(6)
    run(p, f'{i}. {k}: ', 12, True); run(p, t, 12)
p = doc.add_paragraph(); p.paragraph_format.left_indent = Mm(12); p.paragraph_format.space_before = Pt(12)
run(p, 'Gut zu wissen', 14, True)
for t in ['Ziel 2045: alle Drehmeter im grünen Bereich. Ungenutztes Budget bleibt für später.',
          'Ende 2034 geht ein Kernkraftwerk vom Netz.',
          '🤝 Manche Karten wirken zusammen besser, ⤵ andere ersetzen dasselbe.',
          'Wirkung: ▮▮▮ gross · ▮▮ mittel · ▮ wenig · ▼ rückläufig. Wer entscheidet: Gemeinde, Kanton oder Bund.']:
    p = doc.add_paragraph(); p.paragraph_format.left_indent = Mm(12); p.paragraph_format.space_after = Pt(4)
    run(p, '• ' + t, 12)
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# Karten: 2 × 4 pro Seite, Schnittlinien gestrichelt
rows = (len(MEASURES) + 1) // 2
tbl = doc.add_table(rows=rows, cols=2)
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl.autofit = False
for r_i, row in enumerate(tbl.rows):
    row.height = Mm(69); row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
    trPr = row._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); trPr.append(cs)
    for c_i, cell in enumerate(row.cells):
        cell.width = Mm(97)
        k = r_i * 2 + c_i
        if k < len(MEASURES):
            fill_card(cell, MEASURES[k])
doc.save(OUT)
print(f'{len(MEASURES)} Karten → {OUT}')
