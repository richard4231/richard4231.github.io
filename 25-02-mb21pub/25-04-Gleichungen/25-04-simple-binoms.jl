using Combinatorics
using Dates
using Plots

# Wechsel zum Ausgabeverzeichnis (anpassen nach Bedarf)
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
function count_combinations(requirements_filter)
    digits = collect(0:9)
    
    # Anzahl der Kombinationen von 6 aus 10 Ziffern
    combinations_count = binomial(10, 6)
    
    # Für jede Kombination gibt es 6! = 720 Permutationen
    permutations_count = 720
    
    # Gesamtzahl der möglichen Koeffizientenkombinationen
    total_combinations = combinations_count * permutations_count
    
    # Wenn wir zusätzliche Anforderungen haben, reduzieren wir
    if requirements_filter
        # Grobe Schätzung basierend auf den Anforderungen
        # Hier nehmen wir an, dass etwa 1/5 der Kombinationen den Anforderungen entsprechen
        return div(total_combinations, 5)
    else
        return total_combinations
    end
end

# Funktion zum Speichern der Gleichungen in einer Datei
function save_equations_to_file(equations, count_by_category, filter_name="", filter_description="")
    # Erstelle einen Dateinamen mit aktuellem Zeitstempel
    timestamp = Dates.format(now(), "yyyy-mm-dd_HH-MM-SS")
    filename = "gleichungen_klammer_$(timestamp).txt"
    
    # Berechne zusätzliche Statistiken
    use_filter = filter_name != ""
    number_of_combinations = count_combinations(use_filter)
    total_count = sum(values(count_by_category))
    percent_used = round(100 * total_count / number_of_combinations, digits=2)
    
    open(filename, "w") do file
        # Allgemeine Informationen
        write(file, "=== STATISTIK ZU DEN GLEICHUNGEN ===\n\n")
        write(file, "Gleichungen der Form: a(bx + c) = d(ex + f)$(filter_description)\n")
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

# Funktion zum Erstellen eines Histogramms der ganzzahligen Lösungen
function create_integer_histogram(equations)
    # Sammle alle ganzzahligen Lösungen
    integer_solutions = []
    
    for category in ["natürliche Zahl", "negative ganze Zahl"]
        for eq in equations[category]
            x_value = extract_x_value(eq)
            if x_value !== nothing
                push!(integer_solutions, x_value)
            end
        end
    end
    
    # Falls keine ganzzahligen Lösungen vorhanden sind
    if isempty(integer_solutions)
        println("Keine ganzzahligen Lösungen zum Darstellen im Histogramm gefunden.")
        return
    end
    
    # Erstelle das Histogramm
    min_val = minimum(integer_solutions)
    max_val = maximum(integer_solutions)
    
    # Bestimme eine geeignete Anzahl von Bins basierend auf der Spannweite
    range_val = max_val - min_val
    # Für kleine Bereiche verwenden wir einen Bin pro Wert
    if range_val <= 30
        bins = Int(range_val) + 1
    else
        # Für größere Bereiche teilen wir in etwa 20-30 Bins ein
        bins = min(30, max(20, Int(ceil(sqrt(length(integer_solutions))))))
    end
    
    timestamp = Dates.format(now(), "yyyy-mm-dd_HH-MM-SS")
    hist_filename = "histogramm_ganzzahlige_loesungen_$(timestamp).png"
    
    # Erstelle und speichere das Histogramm
    p = histogram(integer_solutions, bins=bins, 
                 title="Verteilung der ganzzahligen Lösungen",
                 xlabel="Wert von x", ylabel="Häufigkeit",
                 label="Ganzzahlige Lösungen",
                 color=:blue, alpha=0.7)
    
    savefig(p, hist_filename)
    println("Histogramm der ganzzahligen Lösungen wurde als '$hist_filename' gespeichert.")
end

# Hauptfunktion zum Finden und Zählen aller Gleichungen
function find_bracket_equations(use_filter=false, a_min=0, d_min=0)
    filter_name = ""
    filter_description = ""
    
    if use_filter
        filter_name = "a_d_min"
        filter_description = " mit a ≥ $a_min und d ≥ $d_min"
    end
    
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
    
    # Für a(bx + c) = d(ex + f) benötigen wir 6 Ziffern: a, b, c, d, e, f
    digits = collect(0:9)
    
    # Generiere alle Kombinationen von 6 verschiedenen Ziffern (aus 0-9)
    for combination in combinations(digits, 6)
        # Generiere alle möglichen Anordnungen der Koeffizienten
        for perm in permutations(combination)
            a, b, c, d, e, f = perm
            
            # Wir können zusätzliche Filter anwenden, wenn gewünscht
            if use_filter && (a < a_min || d < d_min)
                continue
            end
            
            # Berechne die Lösung: a(bx + c) = d(ex + f)
            # abx + ac = dex + df
            # x(ab - de) = df - ac
            
            # Koeffizienten der umgeformten Gleichung
            numer = d*f - a*c
            denom = a*b - d*e
            
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
                
                # Speichere die Gleichung in der entsprechenden Kategorie
                equation = "$a($b x + $c) = $d($e x + $f)$solution"
                push!(equations[result], equation)
                count_by_category[result] += 1
            end
        end
    end
    
    # Speichere die Ergebnisse in einer Datei und erstelle ein Histogramm
    filename = save_equations_to_file(equations, count_by_category, filter_name, filter_description)
    create_integer_histogram(equations)
    
    return equations, count_by_category
end

function main()
    find_bracket_equations(true, 0, 9)
end

main()