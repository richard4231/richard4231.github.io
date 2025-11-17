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
from typing import Dict, List, Tuple, NamedTuple
from enum import Enum
import sys
import unicodedata


class MatchTyp(Enum):
    """Kategorien von Treffer-Typen mit Gewichten."""
    EXAKT = 1.0           # Perfekte Übereinstimmung: "Gleichheit" → "Gleichheit"
    FLEXION = 0.75        # Flexion/Deklination: "Gleichheit" → "Gleichheiten"
    KOMPOSITUM_PREFIX = 0.6   # Präfix-Kompositum: "Gleichheit" → "Ungleichheit"
    KOMPOSITUM_SUFFIX = 0.5   # Suffix-Kompositum: "Gleichheit" → "Gleichheitsgrundsatz"
    WORTTEIL = 0.1        # Teil eines Wortes: "Gleichheit" → "zugleich"


class Match(NamedTuple):
    """Repräsentiert einen einzelnen Treffer mit Kontext."""
    wort: str           # Das gefundene Wort
    typ: MatchTyp       # Art des Treffers
    gewicht: float      # Gewicht dieses Treffers

# Optionale Fortschrittsanzeige
try:
    from tqdm import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    TQDM_AVAILABLE = False
    print("Info: Für Fortschrittsanzeige 'pip install tqdm' ausführen")


class BegriffSucher:
    """Klasse für intelligente Begriffssuche mit Stemming und Silbentrennung."""
    
    def __init__(self, use_stemming: bool = True, case_sensitive: bool = False, 
                 exact_match: bool = False):
        """
        Initialisiert den Begriffssucher.
        
        Args:
            use_stemming: Wenn True, werden Wortstämme verglichen (findet Flexionen)
            case_sensitive: Wenn True, wird Groß-/Kleinschreibung beachtet
            exact_match: Wenn True, nur exakte Wort-Übereinstimmungen (keine Teilwörter)
        """
        self.use_stemming = use_stemming
        self.case_sensitive = case_sensitive
        self.exact_match = exact_match
        
    def normalisiere_text(self, text: str) -> str:
        """
        – Normalisiert Text: Silbentrennung entfernen, Kleinschreibung, etc.
        – OCR-Korrektur für fehlende Leerzeichen nach Artikeln.
        """
        # Unicode-Normalisierung (ä = ä, nicht a+¨)
        text = unicodedata.normalize('NFKC', text)
        
        # OCR-KORREKTUR: Fehlende Leerzeichen nach Artikeln einfügen
        # Problem: "derBegriff" → "der Begriff"
        artikel = [
            # Bestimmte Artikel
            'der', 'die', 'das', 'den', 'dem', 'des',
            # Unbestimmte Artikel
            'ein', 'eine', 'einem', 'einen', 'eines', 'einer',
            # Präpositionen mit Artikel
            'im', 'am', 'zum', 'zur', 'vom', 'beim', 'ans', 'ins',
            'aufs', 'durchs', 'fürs', 'hinters', 'übers', 'unters', 'ums',
            # Pronomen
            'sich', 'mich', 'dich',
            # Konjunktionen
            'und', 'oder', 'aber', 'denn', 'dass',
            # Präpositionen
            'mit', 'von', 'zu', 'in', 'an', 'auf', 'für', 'über', 'unter',
            'bei', 'durch', 'ohne', 'gegen', 'um', 'nach', 'vor', 'zwischen'
        ]
        
        # Für jeden Artikel: Prüfe ob er direkt an ein Wort (Grossbuchstabe) angefügt ist
        for art in artikel:
            # Muster: artikel + Grossbuchstabe (z.B. "derBegriff")
            # Ersetze mit: artikel + Leerzeichen + Grossbuchstabe
            text = re.sub(
                rf'\b{art}([A-ZÄÖÜ])',  # z.B. "der" direkt vor "B"
                rf'{art} \1',           # Ersetze mit "der B"
                text
            )
        
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
    
    def klassifiziere_match(self, begriff: str, gefundenes_wort: str) -> MatchTyp:
        """
        Klassifiziert, wie gut ein gefundenes Wort zum Suchbegriff passt.
        
        Args:
            begriff: Der gesuchte Begriff (normalisiert)
            gefundenes_wort: Das gefundene Wort (normalisiert)
            
        Returns:
            MatchTyp mit entsprechendem Gewicht
        """
        begriff = begriff.lower()
        wort = gefundenes_wort.lower()
        
        # 1. EXAKT: Perfekte Übereinstimmung
        if wort == begriff:
            return MatchTyp.EXAKT
        
        # 2. FLEXION: Wortstämme stimmen überein
        begriff_stamm = self.erstelle_wortstamm(begriff)
        wort_stamm = self.erstelle_wortstamm(wort)
        
        if len(begriff_stamm) >= 3 and wort_stamm == begriff_stamm:
            return MatchTyp.FLEXION
        
        # 3. KOMPOSITUM: Begriff ist Teil eines zusammengesetzten Wortes
        if begriff in wort and len(begriff) >= 3:
            # Am Anfang: z.B. "Gleichheit" in "Gleichheitsgrundsatz"
            if wort.startswith(begriff):
                return MatchTyp.KOMPOSITUM_SUFFIX
            
            # Am Ende: z.B. "Gleichheit" in "Ungleichheit"
            elif wort.endswith(begriff):
                # Prüfe ob es ein sinnvolles Präfix ist (z.B. Un-, Nicht-)
                prefix = wort[:wort.index(begriff)]
                relevante_prefixe = ['un', 'nicht', 'miss', 'über', 'unter']
                if any(prefix.startswith(p) for p in relevante_prefixe):
                    return MatchTyp.KOMPOSITUM_PREFIX
                else:
                    return MatchTyp.KOMPOSITUM_SUFFIX
            
            # In der Mitte: z.B. "gleich" in "zugleich" - wahrscheinlich irrelevant
            else:
                return MatchTyp.WORTTEIL
        
        # 4. STAMM IN KOMPOSITUM: Wortstamm in zusammengesetztem Wort
        if len(begriff_stamm) >= 4 and begriff_stamm in wort_stamm:
            if wort_stamm.startswith(begriff_stamm):
                return MatchTyp.KOMPOSITUM_SUFFIX
            elif wort_stamm.endswith(begriff_stamm):
                return MatchTyp.KOMPOSITUM_PREFIX
            else:
                return MatchTyp.WORTTEIL
        
        # Fallback: Wortteil
        return MatchTyp.WORTTEIL
    
    def suche_begriff_detailliert(self, begriff: str, text: str) -> Dict[MatchTyp, int]:
        """
        Sucht einen Begriff im Text und klassifiziert die Treffer nach Typ.
        
        Args:
            begriff: Der zu suchende Begriff
            text: Der Text, in dem gesucht wird
            
        Returns:
            Dictionary mit MatchTyp als Key und Anzahl als Value
        """
        # Normalisiere Text (Silbentrennung entfernen, etc.)
        text_norm = self.normalisiere_text(text)
        
        # Normalisiere Suchbegriff
        if self.case_sensitive:
            begriff_norm = begriff.strip()
        else:
            begriff_norm = begriff.lower().strip()
        
        if not begriff_norm:
            return {}
        
        # Tokenisiere Text in Wörter (mit Wortgrenzen!)
        woerter = re.findall(r'\b\w+\b', text_norm)
        
        # Zähler pro Match-Typ
        treffer_nach_typ = defaultdict(int)
        
        # Durchlaufe alle Wörter
        for wort in woerter:
            wort_original = wort
            
            # Case-Sensitivity
            if not self.case_sensitive:
                wort = wort.lower()
            
            # Prüfe ob es ein Match ist
            ist_match = False
            
            if self.exact_match:
                # Nur exakte Übereinstimmung
                if wort == begriff_norm:
                    ist_match = True
                    match_typ = MatchTyp.EXAKT
            elif self.use_stemming:
                # Mit Stemming
                begriff_stamm = self.erstelle_wortstamm(begriff_norm)
                wort_stamm = self.erstelle_wortstamm(wort)
                
                # Prüfe verschiedene Match-Möglichkeiten
                if wort == begriff_norm:
                    ist_match = True
                    match_typ = MatchTyp.EXAKT
                elif len(begriff_stamm) >= 3 and len(wort_stamm) >= 3:
                    if wort_stamm == begriff_stamm:
                        ist_match = True
                        match_typ = MatchTyp.FLEXION
                    elif begriff_norm in wort and len(begriff_norm) >= 3:
                        ist_match = True
                        match_typ = self.klassifiziere_match(begriff_norm, wort)
                    elif begriff_stamm in wort_stamm and len(begriff_stamm) >= 4:
                        ist_match = True
                        match_typ = self.klassifiziere_match(begriff_norm, wort)
            else:
                # Einfach: nur ganzes Wort
                if wort == begriff_norm:
                    ist_match = True
                    match_typ = MatchTyp.EXAKT
            
            # Zähle Treffer
            if ist_match:
                treffer_nach_typ[match_typ] += 1
        
        return dict(treffer_nach_typ)
    def suche_begriff(self, begriff: str, text: str) -> int:
        """
        Sucht einen Begriff im Text und gibt die Gesamtanzahl zurück.
        (Vereinfachte Version für Kompatibilität)
        
        Args:
            begriff: Der zu suchende Begriff
            text: Der Text, in dem gesucht wird
            
        Returns:
            Gesamtanzahl der Treffer
        """
        treffer_nach_typ = self.suche_begriff_detailliert(begriff, text)
        return sum(treffer_nach_typ.values())


class PDFAnalysierer:
    """Hauptklasse für die PDF-Analyse."""
    
    def __init__(self, excel_pfad: str, use_stemming: bool = True,
                 case_sensitive: bool = False, exact_match: bool = False,
                 stufen_filter: List[str] = None):
        """
        Initialisiert den Analysierer.
        
        Args:
            excel_pfad: Pfad zur Excel-Datei mit der Begriffshierarchie
            use_stemming: Ob Stemming verwendet werden soll (findet Flexionen)
            case_sensitive: Ob Groß-/Kleinschreibung beachtet werden soll
            exact_match: Ob nur exakte Wort-Übereinstimmungen gezählt werden
            stufen_filter: Liste von Stufen, die analysiert werden sollen 
                          (z.B. ['Stufe 2', 'Stufe 3']). None = alle Stufen.
        """
        self.excel_pfad = Path(excel_pfad)
        self.sucher = BegriffSucher(
            use_stemming=use_stemming,
            case_sensitive=case_sensitive,
            exact_match=exact_match
        )
        self.stufen_filter = stufen_filter
        self.begriffe_hierarchie = self._lade_begriffe()
        
        # Informiere über Filter
        if self.stufen_filter:
            print(f"📋 Stufenfilter aktiv: {', '.join(self.stufen_filter)}")
        
        # Informiere über Suchmodus
        if exact_match:
            print("🔍 Suchmodus: Exakte Übereinstimmung (nur ganze Wörter)")
        elif use_stemming:
            print("🔍 Suchmodus: Stemming (findet Flexionen)")
        else:
            print("🔍 Suchmodus: Einfach (ganze Wörter)")
        
        if case_sensitive:
            print("🔤 Groß-/Kleinschreibung wird beachtet")
        
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
            
            # Prüfe Stufenfilter
            if self.stufen_filter and stufe not in self.stufen_filter:
                continue  # Diese Stufe überspringen
            
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
        
        if self.stufen_filter:
            print(f"✓ {len(begriffe_liste)} Begriffe extrahiert (nach Stufenfilter)")
        else:
            print(f"✓ {len(begriffe_liste)} Begriffe extrahiert")
        return begriffe_liste
    
    def analysiere_pdf(self, pdf_pfad: str) -> pd.DataFrame:
        """
        Analysiert eine PDF-Datei seitenweise.
        
        Args:
            pdf_pfad: Pfad zur PDF-Datei
            
        Returns:
            DataFrame mit Ergebnissen (mit detaillierten Match-Typen und Score)
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
                # Detaillierte Suche
                treffer_nach_typ = self.sucher.suche_begriff_detailliert(begriff, text)
                
                if treffer_nach_typ:
                    # Zähle Treffer nach Typ
                    exakt = treffer_nach_typ.get(MatchTyp.EXAKT, 0)
                    flexion = treffer_nach_typ.get(MatchTyp.FLEXION, 0)
                    kompositum_prefix = treffer_nach_typ.get(MatchTyp.KOMPOSITUM_PREFIX, 0)
                    kompositum_suffix = treffer_nach_typ.get(MatchTyp.KOMPOSITUM_SUFFIX, 0)
                    wortteil = treffer_nach_typ.get(MatchTyp.WORTTEIL, 0)
                    
                    # Fasse Komposita zusammen
                    kompositum = kompositum_prefix + kompositum_suffix
                    
                    # Berechne gewichteten Score
                    score = (
                        exakt * MatchTyp.EXAKT.value +
                        flexion * MatchTyp.FLEXION.value +
                        kompositum_prefix * MatchTyp.KOMPOSITUM_PREFIX.value +
                        kompositum_suffix * MatchTyp.KOMPOSITUM_SUFFIX.value +
                        wortteil * MatchTyp.WORTTEIL.value
                    )
                    
                    # Gesamtanzahl (ungewichtet)
                    anzahl_gesamt = sum(treffer_nach_typ.values())
                    
                    ergebnisse.append({
                        'PDF': pdf_pfad.name,
                        'Seite': seiten_nr + 1,  # 1-basiert
                        'Leitidee': leitidee,
                        'Stufe': stufe,
                        'Begriff': begriff,
                        'Exakt': exakt,
                        'Flexion': flexion,
                        'Kompositum': kompositum,
                        'Wortteil': wortteil,
                        'Anzahl_Gesamt': anzahl_gesamt,
                        'Score_Gewichtet': round(score, 2)
                    })
        
        doc.close()
        
        if ergebnisse:
            df_ergebnis = pd.DataFrame(ergebnisse)
            print(f"✓ {len(ergebnisse)} Treffer gefunden")
            
            # Zusammenfassung nach Match-Typ
            gesamt_exakt = df_ergebnis['Exakt'].sum()
            gesamt_flexion = df_ergebnis['Flexion'].sum()
            gesamt_kompositum = df_ergebnis['Kompositum'].sum()
            gesamt_wortteil = df_ergebnis['Wortteil'].sum()
            gesamt_score = df_ergebnis['Score_Gewichtet'].sum()
            
            print(f"   Exakt: {gesamt_exakt}, Flexion: {gesamt_flexion}, "
                  f"Kompositum: {gesamt_kompositum}, Wortteil: {gesamt_wortteil}")
            print(f"   Gewichteter Gesamtscore: {gesamt_score:.2f}")
            
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
            print("\n📊 Zusammenfassung:")
            print(f"  Exakte Treffer: {df_gesamt['Exakt'].sum()}")
            print(f"  Flexionen: {df_gesamt['Flexion'].sum()}")
            print(f"  Komposita: {df_gesamt['Kompositum'].sum()}")
            print(f"  Wortteile: {df_gesamt['Wortteil'].sum()}")
            print(f"  Gewichteter Gesamtscore: {df_gesamt['Score_Gewichtet'].sum():.2f}")
            
            print("\n📊 Zusammenfassung nach Leitidee (gewichteter Score):")
            zusammenfassung = df_gesamt.groupby('Leitidee')['Score_Gewichtet'].sum().sort_values(ascending=False)
            for leitidee, score in zusammenfassung.items():
                print(f"  {leitidee}: {score:.2f}")
        else:
            print("\n✗ Keine Treffer in allen PDFs gefunden")


def main():
    """Hauptfunktion mit Beispiel-Verwendung."""
    
    print("=" * 60)
    print("PDF-Begriffsanalyse für BNE-Projekt")
    print("=" * 60)
    
    # ============================================================
    # KONFIGURATION - HIER ANPASSEN
    # ============================================================
    
    # Dateipfade
    excel_pfad = "begriffe_hierarchie.xlsx"  # Deine Excel-Datei
    pdf_ordner = "pdfs_zu_analysieren"        # Ordner mit PDFs
    output_csv = "analyse_ergebnisse.csv"     # Ausgabedatei
    
    # Suchoptionen
    use_stemming = True          # True = findet Flexionen (z.B. Energie → Energien)
                                 # False = nur exakte Wörter
    
    case_sensitive = False       # True = Groß-/Kleinschreibung beachten
                                 # False = ignorieren (empfohlen)
    
    exact_match = False          # True = nur exakte Wort-Übereinstimmung
                                 # False = mit Stemming/Flexionen (empfohlen)
    
    # Stufenfilter
    # Beispiele:
    # stufen_filter = None                           # Alle 4 Stufen
    # stufen_filter = ['Stufe 2', 'Stufe 3']         # Nur Stufe 2 und 3 (empfohlen)
    # stufen_filter = ['Stufe 2', 'Stufe 3', 'Stufe 4']  # Stufe 2, 3 und 4
    # stufen_filter = ['Stufe 2']                    # Nur Stufe 2
    # stufen_filter = ['Stufe 3', 'Stufe 4']         # Nur spezifische Stufen
    stufen_filter = None           
    
    # ============================================================
    
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
    analysierer = PDFAnalysierer(
        excel_pfad,
        use_stemming=use_stemming,
        case_sensitive=case_sensitive,
        exact_match=exact_match,
        stufen_filter=stufen_filter
    )
    analysierer.analysiere_mehrere_pdfs(pdf_ordner, output_csv)
    
    print("\n✓ Analyse abgeschlossen")
    print("=" * 60)


if __name__ == "__main__":
    main()