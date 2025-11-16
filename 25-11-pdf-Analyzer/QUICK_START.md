# 🚀 Quick Start - In 5 Minuten zur ersten Analyse

## Schritt 1: Installation (2 Minuten)

```bash
# Bibliotheken installieren
pip install pymupdf pandas openpyxl tqdm --break-system-packages
```

## Schritt 2: Excel-Datei erstellen (1 Minute)

```bash
# Beispiel-Excel generieren
python3 erstelle_beispiel_excel.py
```

Das erstellt die Datei `begriffe_hierarchie.xlsx` mit deinen BNE-Begriffen.

**Anpassen:** Öffne die Excel-Datei und passe die Begriffe nach Bedarf an.

## Schritt 3: PDF-Ordner vorbereiten (1 Minute)

```bash
# Ordner erstellen
mkdir pdfs_zu_analysieren

# Deine PDFs hineinkopieren (Beispiel)
cp ~/Documents/Mathbuch*.pdf pdfs_zu_analysieren/
```

## Schritt 4: Analyse starten (1 Minute)

```bash
# Analyse ausführen
python3 pdf_begriff_analyse.py
```

Die Analyse läuft und zeigt Fortschritt an:

```
📄 Analysiere: Mathbuch_1.pdf
   Größe: 45.2 MB
   Seiten: 234
Seiten: 100%|████████████████████| 234/234 [00:23<00:00, 10.1 Seiten/s]
✓ 1,247 Treffer gefunden
```

## Schritt 5: Ergebnisse prüfen

```bash
# CSV in Excel öffnen (macOS)
open analyse_ergebnisse.csv

# Oder in Numbers
open -a Numbers analyse_ergebnisse.csv
```

## Ergebnis-Struktur

Die CSV-Datei enthält:

| PDF | Seite | Leitidee | Stufe | Begriff | Anzahl |
|-----|-------|----------|-------|---------|--------|
| Mathbuch_1.pdf | 23 | Natürliche Umwelt... | Stufe 2 | Energie | 3 |
| Mathbuch_1.pdf | 23 | Natürliche Umwelt... | Stufe 2 | Verbrauch | 2 |
| Mathbuch_1.pdf | 45 | Wirtschaft und Konsum | Stufe 2 | Kosten | 5 |

## Optional: Test-Suite ausführen

Um die Funktionsweise zu verstehen:

```bash
python3 test_begriff_suche.py
```

Das zeigt dir:
- Wie Stemming funktioniert
- Wie Silbentrennung behandelt wird
- Wie Flexionen erkannt werden

## Troubleshooting

### Problem: "ModuleNotFoundError"
**Lösung:** 
```bash
pip install pymupdf pandas openpyxl --break-system-packages
```

### Problem: "Excel-Datei nicht gefunden"
**Lösung:** 
```bash
# Beispiel-Excel erstellen
python3 erstelle_beispiel_excel.py
```

### Problem: "Keine PDFs gefunden"
**Lösung:**
```bash
# Prüfen
ls pdfs_zu_analysieren/

# PDFs hineinkopieren
cp deine_pdfs/*.pdf pdfs_zu_analysieren/
```

## Nächste Schritte

1. **Excel anpassen:** Öffne `begriffe_hierarchie.xlsx` und füge deine spezifischen Begriffe hinzu
2. **Mehr PDFs:** Lege weitere PDFs in `pdfs_zu_analysieren/`
3. **Ergebnisse analysieren:** Nutze Excel/Numbers/R für weitere Auswertungen

## Konfiguration anpassen

Im Skript `pdf_begriff_analyse.py` (ganz unten in der `main()`-Funktion):

```python
# Diese Zeilen anpassen:
excel_pfad = "begriffe_hierarchie.xlsx"     # Deine Excel-Datei
pdf_ordner = "pdfs_zu_analysieren"          # Dein PDF-Ordner
output_csv = "analyse_ergebnisse.csv"       # Ausgabe-Name
use_stemming = True                          # False = nur exakte Treffer
```

## Fortgeschritten: Batch-Verarbeitung

Für viele PDFs in verschiedenen Ordnern:

```bash
# Mehrere Ordner analysieren
for ordner in Mathbuch Mathwelt Zahlenbuch; do
    python3 pdf_begriff_analyse.py --ordner "$ordner" --output "${ordner}_analyse.csv"
done
```

(Hinweis: Skript muss dafür mit Kommandozeilen-Argumenten erweitert werden)

---

**Das war's!** Du hast jetzt ein funktionierendes System zur PDF-Analyse. 🎉
