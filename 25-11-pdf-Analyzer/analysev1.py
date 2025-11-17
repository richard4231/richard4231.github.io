#!/usr/bin/env python3
"""
PDF-Begriffsanalyse für BNE-Projekt
====================================
Analysiert PDF-Dokumente seitenweise auf Begriffe aus einer hierarchischen Liste.
Berücksichtigt Silbentrennung und Flexion/Deklination.

Autor: Andreas (PHBern)
Datum: November 2025
"""

import re
import pandas as pd
import pymupdf  # PyMuPDF (schneller als pypdf)
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple
import sys
import unicodedata

# Optionale Fortschrittsanzeige
try:
    from tqdm import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    TQDM_AVAILABLE = False
    print("Info: Für Fortschrittsanzeige 'pip install tqdm' ausführen")


class BegriffSucher:
    """Klasse für intelligente Begriffssuche mit Stemming und Silbentrennung."""
    
    def __init__(self, use_stemming: bool = True):
        self.use_stemming = use_stemming
        
    def normalisiere_text(self, text: str) -> str:
        """
        Normalisiert Text: Silbentrennung entfernen, Kleinschreibung, etc.
        """
        # Unicode-Normalisierung (ä = ä, nicht a+¨)
        text = unicodedata.normalize('NFKC', text)
        
        # Silbentrennung: Entferne Bindestriche am Zeilenende
        # Muster: Wort-\n wird zu Wort
        text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
        
        # Auch normale Zeilenumbrüche in Wörtern behandeln
        text = re.sub(r'(\w)\s*\n\s*(\w)', r'\1\2', text)
        
        # Mehrfache Leerzeichen normalisieren
        text = re.sub(r'\s+', ' ', text)
        
        return text.lower().strip()
    
    def erstelle_wortstamm(self, wort: str) -> str:
        """
        Einfaches deutsches Stemming (Wortstamm-Reduktion).
        Entfernt typische deutsche Endungen.
        """
        if not self.use_stemming or len(wort) < 4:
            return wort
        
        # Typische deutsche Endungen (nach Häufigkeit sortiert)
        endungen = [
            'ungen', 'keit', 'heit', 'schaft', 'tion', 'tät',
            'ung', 'en', 'er', 'es', 'em', 'el', 'ig', 'isch',
            'e', 's', 'n'
        ]
        
        wort_stamm = wort
        for endung in endungen:
            if wort.endswith(endung) and len(wort) - len(endung) >= 3:
                wort_stamm = wort[:-len(endung)]
                break
        
        return wort_stamm
    
    def suche_begriff(self, begriff: str, text: str) -> int:
        """
        Sucht einen Begriff im Text unter Berücksichtigung von Flexion.
        Gibt Anzahl der Treffer zurück.
        """
        text_norm = self.normalisiere_text(text)
        begriff_norm = begriff.lower().strip()
        
        if not begriff_norm:
            return 0
        
        # Wortstamm des Suchbegriffs
        begriff_stamm = self.erstelle_wortstamm(begriff_norm)
        
        # Zähler
        treffer = 0
        
        # Tokenisiere Text in Wörter
        woerter = re.findall(r'\b\w+\b', text_norm)
        
        for wort in woerter:
            # Exakte Übereinstimmung (immer zählen)
            if begriff_norm in wort:
                treffer += 1
            # Stamm-basierte Übereinstimmung (wenn Stemming aktiv)
            elif self.use_stemming:
                wort_stamm = self.erstelle_wortstamm(wort)
                if begriff_stamm and len(begriff_stamm) >= 3:
                    if begriff_stamm in wort_stamm:
                        treffer += 1
        
        return treffer


class PDFAnalysierer:
    """Hauptklasse für die PDF-Analyse."""
    
    def __init__(self, excel_pfad: str, use_stemming: bool = True):
        """
        Initialisiert den Analysierer.
        
        Args:
            excel_pfad: Pfad zur Excel-Datei mit der Begriffshierarchie
            use_stemming: Ob Stemming verwendet werden soll
        """
        self.excel_pfad = Path(excel_pfad)
        self.sucher = BegriffSucher(use_stemming=use_stemming)
        self.begriffe_hierarchie = self._lade_begriffe()
        
    def _lade_begriffe(self) -> pd.DataFrame:
        """
        Lädt die Begriffshierarchie aus der Excel-Datei.
        
        Erwartete Struktur:
        - Spalte 1: Leitidee (z.B. "Politik, Demokratie und Menschenrechte")
        - Spalte 2: Spezifitätsstufe (z.B. "Stufe 2")
        - Spalte 3+: Begriffe (komma-separiert oder einzeln)
        """
        try:
            df = pd.read_excel(self.excel_pfad)
            print(f"✓ Excel geladen: {len(df)} Zeilen")
            print(f"  Spalten: {list(df.columns)}")
            return df
        except Exception as e:
            print(f"✗ Fehler beim Laden der Excel-Datei: {e}")
            sys.exit(1)
    
    def extrahiere_begriffe_liste(self) -> List[Tuple[str, str, str]]:
        """
        Extrahiert eine flache Liste aller Begriffe mit Hierarchie-Info.
        
        Returns:
            Liste von (Leitidee, Stufe, Begriff) Tupeln
        """
        begriffe_liste = []
        
        # Annahme: Spalten sind "Leitidee", "Stufe", dann Begriffe
        for _, row in self.begriffe_hierarchie.iterrows():
            leitidee = str(row.iloc[0]) if pd.notna(row.iloc[0]) else "Unbekannt"
            stufe = str(row.iloc[1]) if pd.notna(row.iloc[1]) else "Unbekannt"
            
            # Alle weiteren Spalten durchgehen
            for col_idx in range(2, len(row)):
                zelle = row.iloc[col_idx]
                if pd.notna(zelle):
                    # Falls komma-separiert, aufteilen
                    begriffe = str(zelle).split(',')
                    for begriff in begriffe:
                        begriff = begriff.strip()
                        if begriff:
                            begriffe_liste.append((leitidee, stufe, begriff))
        
        print(f"✓ {len(begriffe_liste)} Begriffe extrahiert")
        return begriffe_liste
    
    def analysiere_pdf(self, pdf_pfad: str) -> pd.DataFrame:
        """
        Analysiert eine PDF-Datei seitenweise.
        
        Args:
            pdf_pfad: Pfad zur PDF-Datei
            
        Returns:
            DataFrame mit Ergebnissen (Leitidee, Stufe, Begriff, Seite, Anzahl)
        """
        pdf_pfad = Path(pdf_pfad)
        if not pdf_pfad.exists():
            print(f"✗ PDF nicht gefunden: {pdf_pfad}")
            return pd.DataFrame()
        
        print(f"\n📄 Analysiere: {pdf_pfad.name}")
        print(f"   Größe: {pdf_pfad.stat().st_size / 1024 / 1024:.1f} MB")
        
        # PDF öffnen
        try:
            doc = pymupdf.open(pdf_pfad)
            print(f"   Seiten: {len(doc)}")
        except Exception as e:
            print(f"✗ Fehler beim Öffnen der PDF: {e}")
            return pd.DataFrame()
        
        # Begriffsliste vorbereiten
        begriffe_liste = self.extrahiere_begriffe_liste()
        
        # Ergebnisse sammeln
        ergebnisse = []
        
        # Seitenweise analysieren
        seiten_iterator = range(len(doc))
        if TQDM_AVAILABLE:
            seiten_iterator = tqdm(seiten_iterator, desc="Seiten")
        
        for seiten_nr in seiten_iterator:
            seite = doc[seiten_nr]
            text = seite.get_text()
            
            # Jeden Begriff suchen
            for leitidee, stufe, begriff in begriffe_liste:
                anzahl = self.sucher.suche_begriff(begriff, text)
                
                if anzahl > 0:
                    ergebnisse.append({
                        'PDF': pdf_pfad.name,
                        'Seite': seiten_nr + 1,  # 1-basiert
                        'Leitidee': leitidee,
                        'Stufe': stufe,
                        'Begriff': begriff,
                        'Anzahl': anzahl
                    })
        
        doc.close()
        
        if ergebnisse:
            df_ergebnis = pd.DataFrame(ergebnisse)
            print(f"✓ {len(ergebnisse)} Treffer gefunden")
            return df_ergebnis
        else:
            print("  Keine Treffer gefunden")
            return pd.DataFrame()
    
    def analysiere_mehrere_pdfs(self, pdf_ordner: str, output_csv: str):
        """
        Analysiert alle PDFs in einem Ordner und speichert Ergebnisse.
        
        Args:
            pdf_ordner: Pfad zum Ordner mit PDFs
            output_csv: Pfad für die Ausgabe-CSV
        """
        pdf_ordner = Path(pdf_ordner)
        pdf_dateien = list(pdf_ordner.glob("*.pdf"))
        
        if not pdf_dateien:
            print(f"✗ Keine PDFs gefunden in: {pdf_ordner}")
            return
        
        print(f"\n🔍 Starte Analyse von {len(pdf_dateien)} PDF-Datei(en)")
        print("=" * 60)
        
        alle_ergebnisse = []
        
        for pdf_pfad in pdf_dateien:
            df = self.analysiere_pdf(pdf_pfad)
            if not df.empty:
                alle_ergebnisse.append(df)
        
        # Zusammenfassen
        if alle_ergebnisse:
            df_gesamt = pd.concat(alle_ergebnisse, ignore_index=True)
            
            # Sortieren
            df_gesamt = df_gesamt.sort_values(
                by=['PDF', 'Seite', 'Leitidee', 'Begriff']
            )
            
            # Speichern
            df_gesamt.to_csv(output_csv, index=False, encoding='utf-8-sig')
            print(f"\n✓ Ergebnisse gespeichert: {output_csv}")
            print(f"  Gesamt-Treffer: {len(df_gesamt)}")
            
            # Zusammenfassung
            print("\n📊 Zusammenfassung nach Leitidee:")
            zusammenfassung = df_gesamt.groupby('Leitidee')['Anzahl'].sum().sort_values(ascending=False)
            for leitidee, anzahl in zusammenfassung.items():
                print(f"  {leitidee}: {anzahl}")
        else:
            print("\n✗ Keine Treffer in allen PDFs gefunden")


def main():
    """Hauptfunktion mit Beispiel-Verwendung."""
    
    print("=" * 60)
    print("PDF-Begriffsanalyse für BNE-Projekt")
    print("=" * 60)
    
    # KONFIGURATION - HIER ANPASSEN
    excel_pfad = "begriffe_hierarchie.xlsx"  # Deine Excel-Datei
    pdf_ordner = "pdfs_zu_analysieren"        # Ordner mit PDFs
    output_csv = "analyse_ergebnisse.csv"     # Ausgabedatei
    use_stemming = True                        # Stemming aktivieren
    
    # Prüfe ob Excel existiert
    if not Path(excel_pfad).exists():
        print(f"\n✗ Excel-Datei nicht gefunden: {excel_pfad}")
        print("\nErwartete Struktur der Excel-Datei:")
        print("┌──────────────────────┬─────────┬──────────────────────────┐")
        print("│ Leitidee             │ Stufe   │ Begriffe                 │")
        print("├──────────────────────┼─────────┼──────────────────────────┤")
        print("│ Politik, Demokratie  │ Stufe 2 │ Wahl, Verteilung, Recht  │")
        print("│ Natürliche Umwelt    │ Stufe 2 │ Umwelt, Klima, Energie   │")
        print("└──────────────────────┴─────────┴──────────────────────────┘")
        return
    
    # Prüfe ob PDF-Ordner existiert
    if not Path(pdf_ordner).exists():
        print(f"\n✗ PDF-Ordner nicht gefunden: {pdf_ordner}")
        print(f"\nErstelle Ordner: {pdf_ordner}")
        Path(pdf_ordner).mkdir(parents=True, exist_ok=True)
        print("→ Bitte PDFs in den Ordner legen und Skript erneut starten")
        return
    
    # Analyse starten
    analysierer = PDFAnalysierer(excel_pfad, use_stemming=use_stemming)
    analysierer.analysiere_mehrere_pdfs(pdf_ordner, output_csv)
    
    print("\n✓ Analyse abgeschlossen")
    print("=" * 60)


if __name__ == "__main__":
    main()