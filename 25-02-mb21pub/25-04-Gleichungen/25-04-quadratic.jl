using Combinatorics
using LinearAlgebra
using Dates

# Funktion zur Überprüfung der Lösungsart für die quadratische Gleichung
function check_quadratic_solution(a, b, c, d, e, f, g, h)
    # Ausmultiplizieren: (ax + b) · (cx + d) = (ex + f) · (gx + h)
    # (ac)x² + (ad + bc)x + bd = (eg)x² + (eh + fg)x + fh
    # In Standardform: Ax² + Bx + C = 0
    
    A = a*c - e*g
    B = a*d + b*c - e*h - f*g
    C = b*d - f*h
    
    if A == 0
        # Linear oder konstant
        if B == 0
            # Konstant
            if C == 0
                return "allgemeingültig", [] # Allgemeingültig, jedes x erfüllt die Gleichung
            else
                return "keine Lösung", [] # Keine Lösung
            end
        else
            # Linear mit einer Lösung
            x = -C / B
            return "eine Lösung", [x]
        end
    else
        # Quadratisch
        D = B^2 - 4*A*C # Diskriminante
        
        if D < 0
            return "keine Lösung", [] # Keine reellen Lösungen
        elseif D == 0
            # Eine doppelte Lösung
            x = -B / (2*A)
            return "eine Lösung", [x]
        else
            # Zwei verschiedene Lösungen
            x1 = (-B + sqrt(D)) / (2*A)
            x2 = (-B - sqrt(D)) / (2*A)
            return "zwei Lösungen", [x1, x2]
        end
    end
end

# Hilfsfunktion zur Überprüfung, ob eine Zahl ganzzahlig ist
function is_integer(x)
    return isapprox(x, round(x), atol=1e-10)
end

# Hilfsfunktion zur Überprüfung, ob eine Zahl natürlich ist (0 eingeschlossen)
function is_natural(x)
    return is_integer(x) && x >= 0
end

# Hilfsfunktion zur Überprüfung, ob eine Zahl eine negative ganze Zahl ist
function is_negative_integer(x)
    return is_integer(x) && x < 0
end

# Hilfsfunktion zur Klassifizierung der Lösungen
function classify_solutions(solutions)
    if isempty(solutions)
        return [] # Keine Lösungen zu klassifizieren
    end
    
    classifications = []
    for x in solutions
        if is_natural(x)
            push!(classifications, "natürliche Zahl")
        elseif is_negative_integer(x)
            push!(classifications, "negative ganze Zahl")
        elseif x < 0
            push!(classifications, "negative nicht-ganzzahlige Zahl")
        else
            push!(classifications, "positive nicht-ganzzahlige Zahl")
        end
    end
    
    return classifications
end

# Hilfsfunktion zum Formatieren der Lösungen für die Ausgabe
function format_solution(x)
    if is_integer(x)
        return "$(Int(round(x)))"
    else
        # Versuche, die Lösung als Bruch darzustellen
        for denom in 1:100
            numer = x * denom
            if is_integer(numer)
                return "$(Int(round(numer)))//$(denom)"
            end
        end
        # Wenn kein passender Bruch gefunden wurde, verwende Dezimaldarstellung
        return "$(round(x, digits=6))"
    end
end

# Hauptfunktion zum Finden und Zählen aller Gleichungen
function find_all_quadratic_equations()
    # Kategorisierung der Gleichungen
    equations = Dict(
        "allgemeingültig" => [],
        "keine Lösung" => [],
        "eine Lösung" => [],
        "zwei Lösungen" => []
    )
    
    # Zähler für jede Kategorie
    count_by_category = Dict(
        "allgemeingültig" => 0,
        "keine Lösung" => 0,
        "eine Lösung" => 0,
        "zwei Lösungen" => 0
    )
    
    # Weitere Klassifikation für Lösungstypen
    solution_types = Dict(
        "eine Lösung" => Dict(
            "natürliche Zahl" => 0,
            "negative ganze Zahl" => 0,
            "negative nicht-ganzzahlige Zahl" => 0,
            "positive nicht-ganzzahlige Zahl" => 0
        ),
        "zwei Lösungen" => Dict(
            "beide natürliche Zahlen" => 0,
            "beide negative ganze Zahlen" => 0,
            "eine natürliche, eine negative ganze Zahl" => 0,
            "eine natürliche, eine negative nicht-ganzzahlige Zahl" => 0,
            "eine natürliche, eine positive nicht-ganzzahlige Zahl" => 0,
            "eine negative ganze, eine negative nicht-ganzzahlige Zahl" => 0,
            "eine negative ganze, eine positive nicht-ganzzahlige Zahl" => 0,
            "beide negative nicht-ganzzahlige Zahlen" => 0,
            "beide positive nicht-ganzzahlige Zahlen" => 0,
            "eine negative nicht-ganzzahlige, eine positive nicht-ganzzahlige Zahl" => 0
        )
    )
    
    # Generiere alle Kombinationen von 8 verschiedenen Ziffern (aus 0-9)
    digits = collect(0:9)
    verification_failures = 0
    
    for combination in combinations(digits, 8)
        # Generiere alle möglichen Anordnungen der Koeffizienten
        for perm in permutations(combination)
            a, b, c, d, e, f, g, h = perm
            
            # Überprüfe die Bedingungen a < c und e < g
            if a < c && e < g
                result, solutions = check_quadratic_solution(a, b, c, d, e, f, g, h)
                
                # Gleichung in der Form (ax + b) · (cx + d) = (ex + f) · (gx + h)
                equation = "($(a)x + $b) · ($(c)x + $d) = ($(e)x + $f) · ($(g)x + $h)"
                
                # Lösungswert formatieren
                solution_text = ""
                if result == "allgemeingültig"
                    solution_text = ", x ∈ ℝ"
                elseif result == "keine Lösung"
                    solution_text = ", keine Lösung"
                elseif result == "eine Lösung"
                    x = solutions[1]
                    solution_text = ", x = $(format_solution(x))"
                    
                    # Zähle die Art der Lösung
                    class = classify_solutions(solutions)[1]
                    solution_types[result][class] += 1
                elseif result == "zwei Lösungen"
                    x1, x2 = solutions
                    solution_text = ", x₁ = $(format_solution(x1)), x₂ = $(format_solution(x2))"
                    
                    # Klassifiziere beide Lösungen
                    classes = classify_solutions(solutions)
                    
                    # Kombinationen der Lösungstypen zählen
                    if "natürliche Zahl" in classes && "natürliche Zahl" in setdiff(classes, ["natürliche Zahl"])
                        solution_types[result]["beide natürliche Zahlen"] += 1
                    elseif "negative ganze Zahl" in classes && "negative ganze Zahl" in setdiff(classes, ["negative ganze Zahl"])
                        solution_types[result]["beide negative ganze Zahlen"] += 1
                    elseif "natürliche Zahl" in classes && "negative ganze Zahl" in classes
                        solution_types[result]["eine natürliche, eine negative ganze Zahl"] += 1
                    elseif "natürliche Zahl" in classes && "negative nicht-ganzzahlige Zahl" in classes
                        solution_types[result]["eine natürliche, eine negative nicht-ganzzahlige Zahl"] += 1
                    elseif "natürliche Zahl" in classes && "positive nicht-ganzzahlige Zahl" in classes
                        solution_types[result]["eine natürliche, eine positive nicht-ganzzahlige Zahl"] += 1
                    elseif "negative ganze Zahl" in classes && "negative nicht-ganzzahlige Zahl" in classes
                        solution_types[result]["eine negative ganze, eine negative nicht-ganzzahlige Zahl"] += 1
                    elseif "negative ganze Zahl" in classes && "positive nicht-ganzzahlige Zahl" in classes
                        solution_types[result]["eine negative ganze, eine positive nicht-ganzzahlige Zahl"] += 1
                    elseif "negative nicht-ganzzahlige Zahl" in classes && "negative nicht-ganzzahlige Zahl" in setdiff(classes, ["negative nicht-ganzzahlige Zahl"])
                        solution_types[result]["beide negative nicht-ganzzahlige Zahlen"] += 1
                    elseif "positive nicht-ganzzahlige Zahl" in classes && "positive nicht-ganzzahlige Zahl" in setdiff(classes, ["positive nicht-ganzzahlige Zahl"])
                        solution_types[result]["beide positive nicht-ganzzahlige Zahlen"] += 1
                    elseif "negative nicht-ganzzahlige Zahl" in classes && "positive nicht-ganzzahlige Zahl" in classes
                        solution_types[result]["eine negative nicht-ganzzahlige, eine positive nicht-ganzzahlige Zahl"] += 1
                    end
                end
                
                # Gleichung mit Lösung
                equation_with_solution = equation * solution_text
                
                # Speichern der Gleichung in der entsprechenden Kategorie
                push!(equations[result], equation_with_solution)
                count_by_category[result] += 1
            end
        end
    end
    
    return equations, count_by_category, solution_types
end

# Funktion zum Speichern aller Ergebnisse in einer Datei
function save_all_equations_to_file(equations, count_by_category, solution_types)
    # Erstelle einen Dateinamen mit aktuellem Zeitstempel
    timestamp = Dates.format(now(), "yyyy-mm-dd_HH-MM-SS")
    filename = "quadratische_gleichungen_$(timestamp).txt"
    
    open(filename, "w") do file
        # Allgemeine Informationen
        total_count = sum(values(count_by_category))
        write(file, "Quadratische Gleichungen der Form: (ax + b) · (cx + d) = (ex + f) · (gx + h)\n")
        write(file, "Gesamtzahl der gefundenen Gleichungen: $total_count\n\n")
        
        # Detaillierte Statistiken zu den Lösungstypen
        write(file, "Statistik zu den Lösungstypen:\n")
        write(file, "------------------------------\n")
        
        for category in ["allgemeingültig", "keine Lösung", "eine Lösung", "zwei Lösungen"]
            category_count = count_by_category[category]
            write(file, "$category: $category_count Gleichungen\n")
            
            if category == "eine Lösung" || category == "zwei Lösungen"
                write(file, "  Davon:\n")
                for (subtype, count) in solution_types[category]
                    if count > 0
                        write(file, "    $subtype: $count\n")
                    end
                end
            end
        end
        
        write(file, "\n" * "="^80 * "\n\n")
        
        # Für jede Kategorie Ergebnisse schreiben
        for category in ["allgemeingültig", "keine Lösung", "eine Lösung", "zwei Lösungen"]
            category_count = count_by_category[category]
            write(file, "Kategorie: $category\n")
            write(file, "Anzahl der Gleichungen: $category_count\n\n")
            
            # Alle Gleichungen dieser Kategorie in die Datei schreiben
            for eq in equations[category]
                write(file, "  $eq\n")
            end
            write(file, "\n" * "-"^80 * "\n\n")
        end
    end
    
    println("Alle Ergebnisse wurden in die Datei '$filename' geschrieben.")
    return filename
end

# Hauptprogramm
println("Suche nach quadratischen Gleichungen...")
equations, count_by_category, solution_types = find_all_quadratic_equations()
total_count = sum(values(count_by_category))

println("Gesamtzahl der Gleichungen: $total_count")

# Speichere alle Ergebnisse in einer Datei
filename = save_all_equations_to_file(equations, count_by_category, solution_types)

# Ausgabe der Anzahl pro Kategorie auf der Konsole
for (category, count) in count_by_category
    println("$category: $count Gleichungen")
    
    if category == "eine Lösung" || category == "zwei Lösungen"
        for (subtype, subcount) in solution_types[category]
            if subcount > 0
                println("  $subtype: $subcount")
            end
        end
    end
end

# Ausgabe von Beispielgleichungen auf der Konsole
println("\nBeispiele für jede Kategorie:")
for (category, eqs) in equations
    category_count = count_by_category[category]
    println("Kategorie: $category")
    
    # Zeige maximal 10 Gleichungen pro Kategorie in der Konsolenausgabe
    for i in 1:min(10, length(eqs))
        println("  $(eqs[i])")
    end
    println()
end

println("Alle Ergebnisse wurden in die Datei '$filename' geschrieben.")