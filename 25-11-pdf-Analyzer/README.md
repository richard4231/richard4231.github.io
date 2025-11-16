# PDF-Begriffsanalyse für BNE-Projekt

Dieses Tool analysiert PDF-Dokumente seitenweise auf Begriffe aus einer hierarchischen Liste und berücksichtigt dabei Silbentrennung und Flexion/Deklination.

## Features

✓ **Intelligente Begriffssuche**
  - Findet Begriffe auch bei Silbentrennung (z.B. "Nach-haltigkeit" → "Nachhaltigkeit")
  - Erkennt Flexionen (z.B. "Energie" findet auch "Energien", "Energieverbrauch")
  - Deutsches Stemming (Wortstamm-Reduktion)

✓ **Hierarchische Analyse**
  - Unterstützt Leitideen und Spezifitätsstufen
  - Importiert Begriffe aus Excel (xlsx)
  - Exportiert Ergebnisse als CSV

✓ **Robust und effizient**
  - Verarbeitet große PDFs (bis 300 MB)
  - Seitenweise Zählung
  - Fortschrittsanzeige (optional)

## Installation

### Schritt 1: Python installieren

Falls noch nicht vorhanden, Python 3.8+ installieren:
- macOS: `brew install python3` (mit Homebrew)
- Oder von https://www.python.org/downloads/

### Schritt 2: Benötigte Bibliotheken installieren

Terminal öffnen und folgende Befehle ausführen:

```bash
pip install pymupdf pandas openpyxl --break-system-packages

# Optional: Für Fortschrittsanzeige
pip install tqdm --break-system-packages
```

**Hinweis für macOS:** Das Flag `--break-system-packages` ist unter macOS mit System-Python oft nötig. Alternativ kannst du auch ein virtuelles Environment verwenden:

```bash
python3 -m venv venv
source venv/bin/activate
pip install pymupdf pandas openpyxl tqdm
```

## Verwendung

### 1. Excel-Datei vorbereiten

Erstelle eine Excel-Datei `begriffe_hierarchie.xlsx` mit folgender Struktur:

| Leitidee | Stufe | Begriffe |
|----------|-------|----------|
| Politik, Demokratie und Menschenrechte | Stufe 2 | Wahl, Verteilung, Beteiligung, Gerechtigkeit, Gleichheit |
| Natürliche Umwelt und Ressourcen | Stufe 2 | Umwelt, Klima, Energie, Wasser, Wald |
| Gesundheit | Stufe 2 | Ernährung, Bewegung, Versorgung, Belastung |

**Wichtig:**
- Erste Spalte: Leitidee
- Zweite Spalte: Spezifitätsstufe
- Ab dritter Spalte: Begriffe (komma-separiert)
- Du kannst auch mehrere Spalten mit Begriffen haben

**Alternative Struktur** (einzelne Begriffe pro Spalte):

| Leitidee | Stufe | Begriff_1 | Begriff_2 | Begriff_3 |
|----------|-------|-----------|-----------|-----------|
| Politik... | Stufe 2 | Wahl | Verteilung | Beteiligung |

### 2. PDF-Ordner erstellen

```bash
mkdir pdfs_zu_analysieren
```

Lege deine PDF-Dateien in diesen Ordner.

### 3. Skript ausführen

```bash
python3 pdf_begriff_analyse.py
```

### 4. Ergebnisse prüfen

Die Ergebnisse werden in `analyse_ergebnisse.csv` gespeichert mit folgenden Spalten:

- **PDF**: Name der PDF-Datei
- **Seite**: Seitennummer
- **Leitidee**: Zugehörige Leitidee
- **Stufe**: Spezifitätsstufe
- **Begriff**: Gefundener Begriff
- **Anzahl**: Wie oft wurde der Begriff auf dieser Seite gefunden

## Konfiguration

Im Skript `pdf_begriff_analyse.py` kannst du am Anfang der `main()`-Funktion folgendes anpassen:

```python
excel_pfad = "begriffe_hierarchie.xlsx"  # Pfad zur Excel-Datei
pdf_ordner = "pdfs_zu_analysieren"        # Ordner mit PDFs
output_csv = "analyse_ergebnisse.csv"     # Name der Ausgabedatei
use_stemming = True                        # Stemming an/aus
```

## Beispiel-Workflow

```bash
# 1. Ordnerstruktur erstellen
mkdir bne_analyse
cd bne_analyse

# 2. Skript kopieren
# (Datei pdf_begriff_analyse.py hier ablegen)

# 3. PDF-Ordner erstellen und PDFs hinzufügen
mkdir pdfs_zu_analysieren
cp ~/Documents/Mathbuch*.pdf pdfs_zu_analysieren/

# 4. Excel-Datei vorbereiten
# (begriffe_hierarchie.xlsx erstellen)

# 5. Analyse starten
python3 pdf_begriff_analyse.py

# 6. Ergebnisse öffnen
open analyse_ergebnisse.csv
```

## Tipps & Tricks

### Große PDF-Dateien

Für sehr große PDFs (>100 MB):
- Das Skript nutzt PyMuPDF, das sehr effizient ist
- Bei Speicherproblemen: PDFs einzeln analysieren

### Begriffe optimieren

1. **Zu viele False Positives?** 
   - Verwende spezifischere Begriffe
   - Oder deaktiviere Stemming: `use_stemming = False`

2. **Zu wenige Treffer?**
   - Verwende allgemeinere Begriffe
   - Prüfe, ob Begriffe wirklich im PDF vorkommen

### CSV in Excel öffnen

Falls Umlaute falsch dargestellt werden:
- Excel: Daten > Aus Text/CSV
- Kodierung: UTF-8 auswählen

## Fehlerbehebung

### "ModuleNotFoundError: No module named 'pymupdf'"

```bash
pip install pymupdf --break-system-packages
```

### "Excel-Datei nicht gefunden"

Prüfe, ob die Datei `begriffe_hierarchie.xlsx` im gleichen Ordner wie das Skript liegt:

```bash
ls -la begriffe_hierarchie.xlsx
```

### "Keine PDFs gefunden"

Prüfe den Ordner:

```bash
ls -la pdfs_zu_analysieren/
```

## Erweiterte Nutzung

### Nur eine einzelne PDF analysieren

Du kannst das Skript auch in Python importieren und einzelne PDFs analysieren:

```python
from pdf_begriff_analyse import PDFAnalysierer

analysierer = PDFAnalysierer("begriffe_hierarchie.xlsx")
df = analysierer.analysiere_pdf("mein_dokument.pdf")
df.to_csv("einzelne_analyse.csv", index=False)
```

### Ergebnisse weiterverarbeiten

Mit pandas kannst du die Ergebnisse aggregieren:

```python
import pandas as pd

df = pd.read_csv("analyse_ergebnisse.csv")

# Häufigste Begriffe
print(df.groupby('Begriff')['Anzahl'].sum().sort_values(ascending=False))

# Pro Leitidee
print(df.groupby('Leitidee')['Anzahl'].sum())

# Pro PDF und Seite
pivot = df.pivot_table(
    values='Anzahl',
    index=['PDF', 'Seite'],
    columns='Leitidee',
    aggfunc='sum',
    fill_value=0
)
pivot.to_csv("analyse_pivot.csv")
```

## Kontakt

Bei Fragen: Andreas, PHBern
Projekt: Mathematik und BNE
