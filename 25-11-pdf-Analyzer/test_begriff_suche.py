#!/usr/bin/env python3
"""
Test-Skript für die Begriffssuche
Zeigt, wie Stemming und Silbentrennung funktionieren
"""

import sys
sys.path.insert(0, '.')

from pdf_begriff_analyse import BegriffSucher


def teste_stemming():
    """Testet die Stemming-Funktion mit verschiedenen Wörtern."""
    
    print("=" * 60)
    print("TEST: Stemming (Wortstamm-Reduktion)")
    print("=" * 60)
    
    sucher = BegriffSucher(use_stemming=True)
    
    test_woerter = [
        "Nachhaltigkeit",
        "Entwicklung",
        "Energien",
        "Ressourcen",
        "Verschwendung",
        "Gerechtigkeit",
        "Demokratie",
        "Gleichstellung",
        "Ernährung",
        "Klimawandel",
        "Verantwortung",
        "Bildung"
    ]
    
    print(f"\n{'Wort':<20} → {'Stamm':<15}")
    print("-" * 40)
    for wort in test_woerter:
        stamm = sucher.erstelle_wortstamm(wort.lower())
        print(f"{wort:<20} → {stamm:<15}")


def teste_silbentrennung():
    """Testet die Silbentrennungs-Behandlung."""
    
    print("\n" + "=" * 60)
    print("TEST: Silbentrennung")
    print("=" * 60)
    
    sucher = BegriffSucher(use_stemming=True)
    
    # Simuliere Text mit Silbentrennung
    test_faelle = [
        {
            'text': 'Die Nach-\nhaltigkeit ist wichtig.',
            'suchbegriff': 'Nachhaltigkeit',
            'beschreibung': 'Silbentrennung am Zeilenende'
        },
        {
            'text': 'Erneuer-\nbare Energien sind die Zukunft.',
            'suchbegriff': 'Energie',
            'beschreibung': 'Silbentrennung + Flexion'
        },
        {
            'text': 'Die Klima\nveränderung schreitet voran.',
            'suchbegriff': 'Klima',
            'beschreibung': 'Zeilenumbruch in zusammengesetztem Wort'
        }
    ]
    
    for i, fall in enumerate(test_faelle, 1):
        print(f"\n{i}. {fall['beschreibung']}")
        print(f"   Original-Text: {repr(fall['text'])}")
        print(f"   Normalisiert:  {repr(sucher.normalisiere_text(fall['text']))}")
        treffer = sucher.suche_begriff(fall['suchbegriff'], fall['text'])
        print(f"   Suche nach '{fall['suchbegriff']}': {treffer} Treffer")


def teste_flexion():
    """Testet die Erkennung von Flexionen."""
    
    print("\n" + "=" * 60)
    print("TEST: Flexion und Wortformen")
    print("=" * 60)
    
    sucher = BegriffSucher(use_stemming=True)
    
    test_faelle = [
        {
            'text': 'Die Energie wird aus verschiedenen Energiequellen gewonnen. Der Energieverbrauch steigt.',
            'suchbegriff': 'Energie',
            'erwartete_varianten': ['Energie', 'Energiequellen', 'Energieverbrauch']
        },
        {
            'text': 'Der Klimawandel und die Klimaveränderungen sind messbar. Das Klima wandelt sich.',
            'suchbegriff': 'Klima',
            'erwartete_varianten': ['Klimawandel', 'Klimaveränderungen', 'Klima']
        },
        {
            'text': 'Nachhaltigkeit bedeutet nachhaltige Entwicklung und nachhaltiges Handeln.',
            'suchbegriff': 'Nachhaltigkeit',
            'erwartete_varianten': ['Nachhaltigkeit', 'nachhaltige', 'nachhaltiges']
        }
    ]
    
    for i, fall in enumerate(test_faelle, 1):
        print(f"\n{i}. Suche nach: '{fall['suchbegriff']}'")
        print(f"   Text: {fall['text']}")
        print(f"   Erwartete Varianten: {', '.join(fall['erwartete_varianten'])}")
        treffer = sucher.suche_begriff(fall['suchbegriff'], fall['text'])
        print(f"   → Gefundene Treffer: {treffer}")


def teste_vergleich_mit_ohne_stemming():
    """Vergleicht Ergebnisse mit und ohne Stemming."""
    
    print("\n" + "=" * 60)
    print("VERGLEICH: Mit vs. Ohne Stemming")
    print("=" * 60)
    
    text = """
    Die nachhaltige Entwicklung erfordert nachhaltiges Handeln.
    Nachhaltigkeit ist ein wichtiges Ziel der Entwicklungspolitik.
    Entwicklungsländer benötigen Entwicklungshilfe.
    """
    
    test_begriffe = ['Nachhaltigkeit', 'Entwicklung']
    
    for begriff in test_begriffe:
        print(f"\n🔍 Suche nach: '{begriff}'")
        print(f"   Text: {text.strip()[:80]}...")
        
        sucher_mit = BegriffSucher(use_stemming=True)
        sucher_ohne = BegriffSucher(use_stemming=False)
        
        treffer_mit = sucher_mit.suche_begriff(begriff, text)
        treffer_ohne = sucher_ohne.suche_begriff(begriff, text)
        
        print(f"   MIT Stemming:   {treffer_mit} Treffer")
        print(f"   OHNE Stemming:  {treffer_ohne} Treffer")
        print(f"   → Unterschied:  {treffer_mit - treffer_ohne} zusätzliche Treffer")


def interaktiver_test():
    """Interaktiver Test zum Ausprobieren."""
    
    print("\n" + "=" * 60)
    print("INTERAKTIVER TEST")
    print("=" * 60)
    
    sucher = BegriffSucher(use_stemming=True)
    
    print("\nGib eigenen Text und Suchbegriff ein (oder Enter zum Überspringen):\n")
    
    text = input("Text: ").strip()
    if not text:
        print("Übersprungen.")
        return
    
    begriff = input("Suchbegriff: ").strip()
    if not begriff:
        print("Übersprungen.")
        return
    
    print("\n" + "-" * 60)
    print(f"Normalisierter Text: {sucher.normalisiere_text(text)}")
    print(f"Wortstamm von '{begriff}': {sucher.erstelle_wortstamm(begriff.lower())}")
    
    treffer = sucher.suche_begriff(begriff, text)
    print(f"\n✓ Ergebnis: {treffer} Treffer für '{begriff}'")
    print("-" * 60)


def main():
    """Führt alle Tests aus."""
    
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 15 + "BEGRIFF-SUCHE TEST-SUITE" + " " * 19 + "║")
    print("╚" + "=" * 58 + "╝")
    
    teste_stemming()
    teste_silbentrennung()
    teste_flexion()
    teste_vergleich_mit_ohne_stemming()
    interaktiver_test()
    
    print("\n" + "=" * 60)
    print("✓ Alle Tests abgeschlossen")
    print("=" * 60)
    print("\nFazit:")
    print("- Stemming erhöht die Trefferrate bei Flexionen")
    print("- Silbentrennung wird automatisch behandelt")
    print("- Du kannst im Hauptskript 'use_stemming' an/ausschalten")
    print("=" * 60)


if __name__ == "__main__":
    main()
