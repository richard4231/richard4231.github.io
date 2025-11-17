#!/usr/bin/env python3
"""
Generiert Excel-Datei mit BNE-Begriffen aus Set 2
Alle 4 Stufen, mit ß → ss Konvertierung (CH/DE)
Quelle: Schlagworte_deHaan_x_Leitideen_x_SDG_.docx
"""

import pandas as pd


def konvertiere_ss(text):
    """Konvertiert ß zu ss (Schweizer Rechtschreibung)."""
    return text.replace('ß', 'ss').replace('Ü', 'ü')  # Auch Groß-ü normalisieren


def erstelle_begriffe_set2():
    """
    Erstellt Excel-Datei mit Set 2 Begriffen (alle 4 Stufen).
    Quelle: Schlagworte_deHaan_x_Leitideen_x_SDG_.docx, Set 2
    """
    
    # Set 2 - Alle 4 Stufen
    begriffe_daten = []
    
    # Politik, Demokratie und Menschenrechte
    begriffe_daten.extend([
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Recht, Staat, Stimme, Regeln, Macht, Gruppe, Ordnung, Freiheit, Verwaltung, Gesellschaft, System, Wert, Entscheidung'
        },
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Wahl, Verteilung, Beteiligung, Rechte, Mitsprache, Bürger, Gesetz, Volk, Pflicht, Zusammenleben, Entscheidung, Regierung, Politik'
        },
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Gerechtigkeit, Mitsprache, Gleichheit, Zugang, Beteiligung, Grundrechte, Schutz, Teilhabe, Minderheit, Mehrheit, Demokratie, Frieden, Entscheidungsprozess'
        },
        {
            'Leitidee': 'Politik, Demokratie und Menschenrechte',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Wahlsystem, Stimmenverteilung, Repräsentation, Machtverteilung, Diskriminierungsschutz, Menschenrechtsverletzung, Partizipationsverfahren, Gewaltenteilung, Rechtsstaatlichkeit, Bildungszugang, Verfassungsrecht, Mindeststandards'
        }
    ])
    
    # Natürliche Umwelt und Ressourcen
    begriffe_daten.extend([
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Natur, Erde, Leben, Stoff, Tier, Pflanze, Wetter, Boden, Berg, Wasser, Wald, Wiese, Luft, Rohstoff'
        },
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Umwelt, Energie, Wasser, Klima, Wald, Arten, Natur, Ressourcen, Landschaft, Lebensraum, Boden, Material, Sonne, Stein'
        },
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Verbrauch, Schutz, Emissionen, Ressourcen, Nachhaltigkeit, Artenvielfalt, Kreislauf, Erneuerbarkeit, Recycling, Umweltbelastung, Naturschutz, Ökologie, Flächennutzung'
        },
        {
            'Leitidee': 'Natürliche Umwelt und Ressourcen',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Biodiversität, Ökosystem, ökologischer Fussabdruck, Regenerationsrate, Klimawandel, CO2-Emission, Energieverbrauch, Wasserverbrauch, Flächenverbrauch, Naturschutzgebiet, Waldanteil, Bodenerosion, Umweltindikator, Schadstoffbelastung'
        }
    ])
    
    # Geschlechter und Gleichstellung
    begriffe_daten.extend([
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Mann, Frau, gleich, Rolle, Mensch, Person, Gruppe, Kind, Erwachsene, Arbeit, Familie, Partner, Eltern'
        },
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Arbeit, Anteil, Lohn, Beruf, Ausbildung, Familie, Recht, Bildung, Teilhabe, Entscheidung, Zugang, Anerkennung, Zusammenleben'
        },
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Verteilung, Unterschied, Gehalt, Quote, Aufgaben, Berufswahl, Bildungschancen, Teilzeit, Vollzeit, Rollenverständnis, Chancengleichheit, Mitbestimmung, Diskriminierung'
        },
        {
            'Leitidee': 'Geschlechter und Gleichstellung',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Lohnungleichheit, Führungspositionen, Care-Arbeit, Geschlechterquote, Elternzeit, Berufseinstieg, Aufstiegschancen, Rollenstereotype, Vereinbarkeit, Betreuungsangebote, Karriereunterbrechung, Diskriminierungsschutz, paritätische Besetzung'
        }
    ])
    
    # Gesundheit
    begriffe_daten.extend([
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Körper, Essen, Leben, Luft, Rein, Krankheit, Arzt, Medizin, Sport, Pflege, Alter, Ruhe, Nahrung, Bewegung'
        },
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Ernährung, Bewegung, Wohlbefinden, Qualität, Versorgung, Medikament, Krankheit, Hygiene, Beratung, Vorsorge, Therapie, Behandlung, Stress'
        },
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Versorgung, Belastung, Zugang, Prävention, Umweltfaktoren, Vorsorgeuntersuchung, Gesundheitssystem, Lebensstil, Risikofaktoren, Früherkennung, Gesundheitsförderung, Ernährungsbildung, Gesundheitskompetenz'
        },
        {
            'Leitidee': 'Gesundheit',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Lebenserwartung, Krankheitsrate, Gesundheitsausgaben, Mortalitätsrate, Präventionsprogramme, Gesundheitsmonitoring, Ernährungssicherheit, Kalorienverbrauch, Bewegungsmangel, Impfrate, Medikamentenversorgung, Trinkwasserqualität, Luftverschmutzung, medizinische Grundversorgung'
        }
    ])
    
    # Globale Entwicklung und Frieden
    begriffe_daten.extend([
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Welt, Land, Hilfe, Armut, Gruppe, Krieg, Frieden, Staat, Region, Nation, Gemeinschaft, Unterstützung, Handel, Zusammenarbeit'
        },
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Entwicklung, Zusammenarbeit, Chancen, Verteilung, Frieden, Migration, Welthandel, International, Wirtschaft, Hilfsorganisation, Politik, Kommunikation, Diplomatie, Handel'
        },
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Wohlstand, Bildung, Migration, Bevölkerung, Wirtschaftswachstum, Entwicklungshilfe, Diplomatie, Krisenregion, Flüchtlinge, Konflikte, Kooperation, Handelsbeziehungen, Friedenssicherung, globale Partnerschaft'
        },
        {
            'Leitidee': 'Globale Entwicklung und Frieden',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Nord-Süd-Gefälle, Entwicklungsindex, Friedenssicherung, Alphabetisierungsrate, Entwicklungszusammenarbeit, Armutsbekämpfung, Bevölkerungswachstum, Migrationsbewegungen, Konfliktlösung, Wohlstandsverteilung, Ressourcenkonflikte, humanitäre Hilfe, Nachhaltigkeitsziele, Ungleichheitsindikator'
        }
    ])
    
    # Kulturelle Identitäten und interkulturelle Verständigung
    begriffe_daten.extend([
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Sprache, Gruppe, Art, Brauch, Fest, Glauben, Musik, Kunst, Essen, Kleidung, Familie, Wohnen, Tradition, Religion'
        },
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Kultur, Vielfalt, Tradition, Austausch, Religion, Gemeinschaft, Werte, Begegnung, Dialog, Heimat, Geschichte, Selbstverständnis, Zugehörigkeit, Feiertag'
        },
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Integration, Minderheit, Zusammenleben, Kommunikation, Verständigung, Religionsgemeinschaft, Herkunftskultur, Mehrsprachigkeit, Unterschiede, Gemeinsamkeiten, Kulturerbe, Toleranz, Kulturaustausch, Erinnerungskultur'
        },
        {
            'Leitidee': 'Kulturelle Identitäten und interkulturelle Verständigung',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Sprachenvielfalt, kulturelle Diversität, Identitätsbildung, interkulturelle Kommunikation, Migrationsgeschichte, kollektives Gedächtnis, kulturelle Aneignung, Traditionsbewusstsein, kulturelle Missverständnisse, Integrationsprogramme, Minderheitenrechte, kulturhistorisches Erbe, Kulturtransfer, Sozialisation'
        }
    ])
    
    # Wirtschaft und Konsum
    begriffe_daten.extend([
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 1',
            'Begriffe': 'Geld, Ware, Tausch, Kauf, Markt, Handel, Preis, Verkauf, Arbeit, Geschäft, Leistung, Produkt, Lohn, Werbung'
        },
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 2',
            'Begriffe': 'Handel, Preis, Kosten, Verbrauch, Verkauf, Regional, Angebot, Nachfrage, Qualität, Marke, Einkauf, Produktion, Hersteller, Kunde'
        },
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 3',
            'Begriffe': 'Produktion, Konsum, Transport, Effizienz, Lieferkette, Verpackung, Verschwendung, Rohstoffe, Langlebigkeit, Wertschöpfung, Umweltfolgen, Vermarktung, Handelsströme, Produktionsbedingungen, Schulden'
        },
        {
            'Leitidee': 'Wirtschaft und Konsum',
            'Stufe': 'Stufe 4',
            'Begriffe': 'Kreislaufwirtschaft, Lieferketten, Ressourceneffizienz, faire Handelsbeziehungen, Produktlebenszyklus, Verbraucherschutz, ökologischer Rucksack, Lebensmittelverschwendung, nachhaltiges Wirtschaftswachstum, soziale Produktionsbedingungen, Konsummuster, Regionalvermarktung, Transportwege, Wertschöpfungsketten'
        }
    ])
    
    # Konvertiere alle ß zu ss (CH/DE)
    for row in begriffe_daten:
        row['Leitidee'] = konvertiere_ss(row['Leitidee'])
        row['Stufe'] = konvertiere_ss(row['Stufe'])
        row['Begriffe'] = konvertiere_ss(row['Begriffe'])
    
    # DataFrame erstellen
    df = pd.DataFrame(begriffe_daten)
    
    # Als Excel speichern
    output_datei = 'begriffe_hierarchie.xlsx'
    df.to_excel(output_datei, index=False, engine='openpyxl')
    
    print(f"✓ Excel-Datei erstellt: {output_datei}")
    print(f"  {len(df)} Zeilen mit Begriffen (Set 2, alle 4 Stufen)")
    print(f"  ß → ss konvertiert (CH/DE)")
    
    # Statistik
    print(f"\n📊 Statistik nach Leitidee:")
    for leitidee in df['Leitidee'].unique():
        anzahl_stufen = len(df[df['Leitidee'] == leitidee])
        print(f"  {leitidee}: {anzahl_stufen} Stufen")
    
    print(f"\n📋 Stufen-Verteilung:")
    stufen_count = df['Stufe'].value_counts().sort_index()
    for stufe, anzahl in stufen_count.items():
        print(f"  {stufe}: {anzahl} Leitideen")
    
    return output_datei


if __name__ == "__main__":
    print("=" * 70)
    print("Excel-Generator: BNE Set 2 (alle 4 Stufen)")
    print("=" * 70)
    print()
    
    erstelle_begriffe_set2()
    
    print("\n" + "=" * 70)
    print("✓ Fertig! Excel-Datei kann nun verwendet werden.")
    print("=" * 70)