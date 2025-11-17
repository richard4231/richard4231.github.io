#!/usr/bin/env python3
"""
Generiert eine Beispiel-Excel-Datei mit BNE-Begriffen
basierend auf der Projektstruktur (Leitideen mit Spezifitätsstufen)
"""

import pandas as pd

def erstelle_beispiel_excel():
    """Erstellt eine Excel-Datei mit der Begriffsstruktur aus dem Projekt."""
    
    # Begriffe nach Leitideen und Stufen organisiert
    # Basierend auf den Dokumenten im Projekt
    
    begriffe_daten = [
        # Politik, Demokratie und Menschenrechte
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Wahl, Verteilung, Beteiligung, Gerechtigkeit, Gleichheit, Rechte, Zugang, Macht, Vertretung, Mitsprache'
        },
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Wahlsystem, Stimmenverteilung, Repräsentation, Machtverteilung, Diskriminierungsschutz, Menschenrechtsverletzung, Partizipation, Gewaltenteilung, Rechtsstaatlichkeit'
        },
        
        # Natürliche Umwelt und Ressourcen
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Natur, Erde, Leben, Stoff, Tier, Pflanze, Wetter'
        },
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Umwelt, Klima, Energie, Wasser, Wald, Arten, Natur, Ressourcen, Verbrauch, Emissionen, Schutz, Recycling, Fläche, Rohstoffe'
        },
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Biodiversität, Ökosystem, ökologischer Fußabdruck, Regenerationsrate, Nachhaltigkeit, Klimawandel, erneuerbare Energien, CO2, Treibhausgas'
        },
        
        # Geschlechter und Gleichstellung
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Gehalt, Lohn, Frauen, Männer, Mädchen, Jungen, Arbeitszeit, Verteilung, Berufe, Anteil, Unterschied, Familie, Ausbildung, Quote'
        },
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Lohngleichheit, Gender Pay Gap, Frauenquote, Elternzeit, Care-Arbeit, Geschlechterstereotypen, Chancengleichheit'
        },
        
        # Gesundheit
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Ernährung, Bewegung, Versorgung, Belastung, Wohlbefinden, Prävention, Qualität, Zugang, Ausgaben, Lebensdauer, Lebenserwartung'
        },
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Gesundheitssystem, Krankenversicherung, Prävention, psychische Gesundheit, Ernährungssicherheit, Gesundheitsversorgung'
        },
        
        # Globale Entwicklung und Frieden
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Entwicklung, Verteilung, Armut, Wohlstand, Frieden, Migration, Bildung, Bevölkerung, Stadt, Land, Chancen, Zusammenarbeit, Globaler Süden'
        },
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Entwicklungshilfe, Entwicklungsländer, Entwicklungszusammenarbeit, Konfliktprävention, Friedenssicherung, Flucht, Integration, Nord-Süd-Gefälle'
        },
        
        # Kulturelle Identitäten und interkulturelle Verständigung
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Sprache, Kultur, Vielfalt, Integration, Minderheit, Austausch, Gemeinschaft, Tradition, Kommunikation, Zusammenleben'
        },
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 3',
            'Begriffe': 'kulturelle Vielfalt, Multikulturalität, interkultureller Dialog, Diskriminierung, Inklusion, kulturelle Identität'
        },
        
        # Wirtschaft und Konsum
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Produktion, Konsum, Transport, Handel, Kosten, Preis, Effizienz, Lebensmittel, Regional, Verschwendung, Nutzen, Verbrauch, Kette, Schulden'
        },
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 3',
            'Begriffe': 'nachhaltiger Konsum, Konsumverhalten, Produktionsbedingungen, Lieferkette, fairer Handel, Kreislaufwirtschaft, Lebensmittelverschwendung, ökologischer Fußabdruck'
        }
    ]
    
    # DataFrame erstellen
    df = pd.DataFrame(begriffe_daten)
    
    # Als Excel speichern
    output_datei = 'begriffe_hierarchie.xlsx'
    df.to_excel(output_datei, index=False, engine='openpyxl')
    
    print(f"✓ Beispiel-Excel-Datei erstellt: {output_datei}")
    print(f"  {len(df)} Zeilen mit Begriffen")
    print("\nStruktur:")
    print(df.head(3))
    
    # Statistik
    print(f"\n📊 Statistik:")
    for leitidee in df['Leitidee'].unique():
        anzahl_stufen = len(df[df['Leitidee'] == leitidee])
        print(f"  {leitidee}: {anzahl_stufen} Stufen")
    
    return output_datei


def erstelle_beispiel_excel_einzelbegriffe():
    """
    Alternative: Erstellt Excel-Datei mit einem Begriff pro Spalte.
    Dieser Ansatz ist übersichtlicher für manuelle Bearbeitung.
    """
    
    begriffe_daten = []
    
    # Beispiel mit einzelnen Begriffen pro Spalte
    begriffe_sets = {
        'Politik, Demokratie und Menschenrechte - Stufe 2': 
            ['Wahl', 'Verteilung', 'Beteiligung', 'Gerechtigkeit', 'Gleichheit', 'Rechte', 'Zugang', 'Macht', 'Vertretung', 'Mitsprache'],
        'Natürliche Umwelt und Ressourcen - Stufe 2': 
            ['Umwelt', 'Klima', 'Energie', 'Wasser', 'Wald', 'Arten', 'Natur', 'Ressourcen', 'Verbrauch', 'Emissionen', 'Schutz', 'Recycling', 'Fläche', 'Rohstoffe'],
        'Gesundheit - Stufe 2': 
            ['Ernährung', 'Bewegung', 'Versorgung', 'Belastung', 'Wohlbefinden', 'Prävention', 'Qualität', 'Zugang', 'Ausgaben', 'Lebensdauer', 'Lebenserwartung'],
    }
    
    # Maximale Anzahl an Begriffen finden
    max_begriffe = max(len(begriffe) for begriffe in begriffe_sets.values())
    
    # DataFrame aufbauen
    for kategorie, begriffe in begriffe_sets.items():
        leitidee, stufe = kategorie.rsplit(' - ', 1)
        row = {'Leitidee': leitidee, 'Stufe': stufe}
        
        # Begriffe einzeln in Spalten
        for i, begriff in enumerate(begriffe, 1):
            row[f'Begriff_{i}'] = begriff
        
        # Fehlende Spalten mit None auffüllen
        for i in range(len(begriffe) + 1, max_begriffe + 1):
            row[f'Begriff_{i}'] = None
        
        begriffe_daten.append(row)
    
    df = pd.DataFrame(begriffe_daten)
    
    output_datei = 'begriffe_hierarchie_einzeln.xlsx'
    df.to_excel(output_datei, index=False, engine='openpyxl')
    
    print(f"\n✓ Alternative Excel-Datei erstellt: {output_datei}")
    print("  (Mit einzelnen Begriffen pro Spalte)")
    
    return output_datei


if __name__ == "__main__":
    print("=" * 60)
    print("Beispiel-Excel-Datei Generator für BNE-Begriffsanalyse")
    print("=" * 60)
    print()
    
    # Standard-Version: Komma-separiert
    datei1 = erstelle_beispiel_excel()
    
    # Alternative Version: Einzelne Spalten
    print()
    datei2 = erstelle_beispiel_excel_einzelbegriffe()
    
    print("\n" + "=" * 60)
    print("✓ Fertig! Zwei Varianten wurden erstellt:")
    print(f"  1. {datei1} (komma-separiert, kompakt)")
    print(f"  2. {datei2} (einzelne Spalten, übersichtlich)")
    print("\nDu kannst beide öffnen und die Version verwenden,")
    print("die dir besser gefällt. Beide funktionieren mit dem Analyse-Skript.")
    print("=" * 60)
