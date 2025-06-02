using Combinatorics
using Dates

# Wechsel zum Ausgabeverzeichnis
cd("/Users/andreasrichard/Library/CloudStorage/OneDrive-Persönlich/01JupyterAndCo/04GitHub/GitHubCloneMBP/richard4231.github.io/25-02-mb21pub/25-04-Gleichungen/Output")

# Hilfsfunktion zum Extrahieren des x-Werts (für die Sortierung)
function extract_x_value(equation_str)
    if contains(equation_str, "x ∈ ℝ") || contains(equation_str, "keine Lösung")
        return nothing
    end
    
    # Extrahiere den x-Wert nach dem Muster ", x = ..."
    m = match(r", x = (.+)$", equation_str)
    if m === nothing
        return nothing
    end
    
    x_str = m.captures[1]
    
    # Versuche, den Wert als Bruch oder als Integer zu parsen
    if contains(x_str, "//")
        parts = split(x_str, "//")
        return parse(Int, parts[1]) / parse(Int, parts[2])
    else
        return parse(Int, x_str)
    end
end

# Funktion zum Berechnen der Gesamtzahl möglicher Kombinationen
function count_combinations()
    digits = collect(0:9)
    
    # Anzahl der Kombinationen von 5 aus 10 Ziffern
    combinations_count = binomial(10, 5)
    
    # Für jede Kombination gibt es 5! = 120 Permutationen
    permutations_count = 120
    
    # Gesamtzahl der möglichen Koeffizientenkombinationen
    total_combinations = combinations_count * permutations_count
    
    return div(total_combinations, 2)
end

# Funktion zum Speichern der Gleichungen in einer Datei
function save_equations_to_file(equations, count_by_category)
    # Erstelle einen Dateinamen mit aktuellem Zeitstempel
    timestamp = Dates.format(now(), "yyyy-mm-dd_HH-MM-SS")
    filename = "gleichungen_typ3_$(timestamp).txt"
    
    # Berechne zusätzliche Statistiken
    number_of_combinations = count_combinations()
    percent_used = round(100 * sum(values(count_by_category)) / number_of_combinations, digits=2)
    
    open(filename, "w") do file
        # Allgemeine Informationen
        total_count = sum(values(count_by_category))
        write(file, "=== STATISTIK ZU DEN GLEICHUNGEN ===\n\n")
        write(file, "Gleichungen der Form: ax + b + cx = ex + f\n")
        write(file, "Gesamtzahl der gefundenen Gleichungen: $total_count\n")
        write(file, "Mögliche Kombinationen insgesamt: $number_of_combinations\n")
        write(file, "Verwendeter Anteil: $percent_used%\n\n")
        
        # Detaillierte Statistik für jede Kategorie hinzufügen
        write(file, "Anzahl der Gleichungen pro Kategorie:\n")
        for category in ["allgemeingültig", "keine Lösung", "natürliche Zahl", 
                         "negative ganze Zahl", "negative nicht-ganzzahlige Zahl", 
                         "positive nicht-ganzzahlige Zahl"]
            category_count = count_by_category[category]
            percentage = round(100 * category_count / total_count, digits=2)
            write(file, "- $category: $category_count ($percentage%)\n")
        end
        
        # Zusätzliche zusammenfassende Statistiken
        total_integers = count_by_category["natürliche Zahl"] + count_by_category["negative ganze Zahl"]
        total_non_integers = count_by_category["negative nicht-ganzzahlige Zahl"] + count_by_category["positive nicht-ganzzahlige Zahl"]
        total_no_solution = count_by_category["keine Lösung"]
        total_all_solutions = count_by_category["allgemeingültig"]
        
        write(file, "\nZusammenfassung:\n")
        write(file, "- Ganzzahlige Lösungen: $total_integers ($(round(100 * total_integers / total_count, digits=2))%)\n")
        write(file, "- Nicht-ganzzahlige Lösungen: $total_non_integers ($(round(100 * total_non_integers / total_count, digits=2))%)\n")
        write(file, "- Keine Lösung: $total_no_solution ($(round(100 * total_no_solution / total_count, digits=2))%)\n")
        write(file, "- Allgemeingültig: $total_all_solutions ($(round(100 * total_all_solutions / total_count, digits=2))%)\n\n")
        
        write(file, "=== DETAILLIERTE AUFLISTUNG DER GLEICHUNGEN ===\n\n")
        
        # Für jede Kategorie Ergebnisse schreiben
        for category in ["allgemeingültig", "keine Lösung", "natürliche Zahl", 
                         "negative ganze Zahl", "negative nicht-ganzzahlige Zahl", 
                         "positive nicht-ganzzahlige Zahl"]
            
            category_count = count_by_category[category]
            write(file, "Kategorie: $category\n")
            write(file, "Anzahl der Gleichungen: $category_count\n\n")
            
            # Sortiere die Gleichungen, wenn möglich nach dem x-Wert
            eqs = equations[category]
            if category in ["natürliche Zahl", "negative ganze Zahl", 
                            "negative nicht-ganzzahlige Zahl", "positive nicht-ganzzahlige Zahl"]
                sort!(eqs, by=extract_x_value)
            end
            
            # Alle Gleichungen dieser Kategorie in die Datei schreiben
            for eq in eqs
                write(file, "  $eq\n")
            end
            write(file, "\n" * "-"^80 * "\n\n")
        end
    end
    
    println("Alle Ergebnisse wurden in die Datei '$filename' geschrieben.")
    return filename
end

# Hauptfunktion zum Finden und Zählen aller Gleichungen
function find_equations_type3()
    # Kategorisierung der Gleichungen
    equations = Dict(
        "allgemeingültig" => [],
        "keine Lösung" => [],
        "natürliche Zahl" => [],
        "negative ganze Zahl" => [],
        "negative nicht-ganzzahlige Zahl" => [],
        "positive nicht-ganzzahlige Zahl" => []
    )
    
    # Zähler für jede Kategorie
    count_by_category = Dict(
        "allgemeingültig" => 0,
        "keine Lösung" => 0,
        "natürliche Zahl" => 0,
        "negative ganze Zahl" => 0,
        "negative nicht-ganzzahlige Zahl" => 0,
        "positive nicht-ganzzahlige Zahl" => 0
    )
    
    # Für ax + b + cx = ex + f benötigen wir 5 Ziffern: a, b, c, e, f
    digits = collect(0:9)
    
    # Generiere alle Kombinationen von 5 verschiedenen Ziffern (aus 0-9)
    for combination in combinations(digits, 5)
        # Generiere alle möglichen Anordnungen der Koeffizienten
        for perm in permutations(combination)
            a, b, c, e, f = perm

            
            # Berechne die Lösung
            numer = f - b
            denom = a + c - e
            
            if denom == 0
                if numer == 0
                    result = "allgemeingültig"
                    solution = ", x ∈ ℝ"
                else
                    result = "keine Lösung"
                    solution = ", keine Lösung"
                end
            else
                x = numer // denom  # Rationale Zahl
                
                if denominator(x) == 1
                    if numerator(x) >= 0
                        result = "natürliche Zahl"
                    else
                        result = "negative ganze Zahl"
                    end
                    solution = ", x = $(numerator(x))"
                else
                    if x < 0
                        result = "negative nicht-ganzzahlige Zahl"
                    else
                        result = "positive nicht-ganzzahlige Zahl"
                    end
                    solution = ", x = $x"
                end
            end
            
            # Gleichung in der Form ax + b + cx = ex + f
            equation = "$(a)x + $b + $(c)x = $(e)x + $f"
            equation_with_solution = equation * solution
            
            # Speichern der Gleichung in der entsprechenden Kategorie
            push!(equations[result], equation_with_solution)
            count_by_category[result] += 1
        end
    end
    
    return equations, count_by_category
end

# Hauptprogramm
println("Suche nach Gleichungen der Form ax + b + cx = ex + f...")
equations, count_by_category = find_equations_type3()
total_count = sum(values(count_by_category))

println("Gesamtzahl der Gleichungen: $total_count")

# Speichere alle Ergebnisse in einer Datei
filename = save_equations_to_file(equations, count_by_category)

# Ausgabe der Anzahl pro Kategorie auf der Konsole
for (category, count) in count_by_category
    println("$category: $count Gleichungen")
end

# Ausgabe von Beispielgleichungen auf der Konsole
println("\nBeispiele für jede Kategorie:")
for (category, eqs) in equations
    category_count = count_by_category[category]
    println("Kategorie: $category")
    
    # Zeige maximal 10 Gleichungen pro Kategorie
    if category in ["natürliche Zahl", "negative ganze Zahl", "negative nicht-ganzzahlige Zahl", "positive nicht-ganzzahlige Zahl"]
        if length(eqs) <= 10
            for eq in eqs
                println("  $eq")
            end
        else
            # Teile die sortierten Gleichungen in ca. 10 gleichmäßige Abschnitte auf
            step = max(1, length(eqs) ÷ 10)
            selected_indices = 1:step:length(eqs)
            selected_indices = selected_indices[1:min(10, length(selected_indices))]
            
            for idx in selected_indices
                println("  $(eqs[idx])")
            end
        end
    else
        # Für allgemeingültig und keine Lösung: einfach die ersten 10 ausgeben
        for i in 1:min(10, length(eqs))
            println("  $(eqs[i])")
        end
    end
    println()
end