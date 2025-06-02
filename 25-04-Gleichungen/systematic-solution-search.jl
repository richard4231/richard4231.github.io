using Combinatorics
using LinearAlgebra
using Dates

# Funktion zum Lösen einer linearen Gleichung mit LinearAlgebra
function solve_linear(a, b, c, d, e, f, g, h)
    # Gleichung: (a+c)x + (b+d) = (e+g)x + (f+h)
    # Umformen zu Ax = B
    A = a + c - e - g  # Koeffizient von x
    B = f + h - b - d  # Konstante
    
    if A == 0
        if B == 0
            return :allgemeingültig
        else
            return :keine_lösung
        end
    else
        return B / A  # Lösung
    end
end

# Funktion zur Überprüfung der Lösung durch Einsetzen
function verify_solution(a, b, c, d, e, f, g, h, x)
    if x == :allgemeingültig || x == :keine_lösung
        return true
    end
    
    left_side = (a + c) * x + (b + d)
    right_side = (e + g) * x + (f + h)
    
    return isapprox(left_side, right_side, atol=1e-10)
end

# Funktion zur Überprüfung der Lösungsart
function check_solution(a, b, c, d, e, f, g, h)
    numer = (f + h) - (b + d)
    denom = (a + c) - (e + g)
    
    if denom == 0
        if numer == 0
            return "allgemeingültig", nothing  # Jedes x ist eine Lösung
        else
            return "keine Lösung", nothing  # Keine Lösung möglich
        end
    else
        x = numer // denom  # Rationale Zahl
        
        if denominator(x) == 1  # Funktion denominator() auf x anwenden
            if numerator(x) >= 0
                return "natürliche Zahl", x  # x ist eine nicht-negative ganze Zahl
            else
                return "negative ganze Zahl", x  # x ist eine negative ganze Zahl
            end
        else
            if x < 0
                return "negative nicht-ganzzahlige Zahl", x
            else
                return "positive nicht-ganzzahlige Zahl", x
            end
        end
    end
end

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

# Hauptfunktion zum Finden und Zählen aller Gleichungen
function find_all_equations()
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
    
    # Generiere alle Kombinationen von 8 verschiedenen Ziffern (aus 0-9)
    digits = collect(0:9)
    verification_failures = 0
    
    for combination in combinations(digits, 8)
        # Generiere alle möglichen Anordnungen der Koeffizienten
        for perm in permutations(combination)
            a, b, c, d, e, f, g, h = perm
            
            # Überprüfe die Bedingungen
            if a < c && e < g && b < d && f < h && 
               (a + c) <= (e + g) && ((a + c) != (e + g) || (b + d) <= (f + h))
                
                result, x_value = check_solution(a, b, c, d, e, f, g, h)
                
                # Lösung mit der alternativen Methode berechnen zur Verifikation
                alt_solution = solve_linear(a, b, c, d, e, f, g, h)
                
                # Gleichung in der Form ax + b + cx + d = ex + f + gx + h
                equation = "$(a)x + $b + $(c)x + $d = $(e)x + $f + $(g)x + $h"
                
                # Lösungswert berechnen (falls vorhanden)
                solution = ""
                numer = (f + h) - (b + d)
                denom = (a + c) - (e + g)
                
                if denom == 0
                    if numer == 0
                        solution = ", x ∈ ℝ"
                        # Verifiziere, dass die alternative Lösung übereinstimmt
                        if alt_solution != :allgemeingültig
                            verification_failures += 1
                            println("Verifikationsfehler bei: $equation")
                        end
                    else
                        solution = ", keine Lösung"
                        # Verifiziere, dass die alternative Lösung übereinstimmt
                        if alt_solution != :keine_lösung
                            verification_failures += 1
                            println("Verifikationsfehler bei: $equation")
                        end
                    end
                else
                    x = numer // denom  # Rationale Zahl
                    
                    # Verifiziere, dass die alternative Lösung übereinstimmt
                    if !isapprox(Float64(x), Float64(alt_solution), atol=1e-10)
                        verification_failures += 1
                        println("Verifikationsfehler bei: $equation, x=$x, alt=$alt_solution")
                    end
                    
                    # Wenn der Nenner 1 ist, zeige nur den Zähler als Integer an
                    if denominator(x) == 1
                        solution = ", x = $(numerator(x))"
                    else
                        solution = ", x = $x"
                    end
                    
                    # Extra Verifikation durch Einsetzen der Lösung
                    if !verify_solution(a, b, c, d, e, f, g, h, x)
                        verification_failures += 1
                        println("Einsetzen-Verifikationsfehler bei: $equation, x=$x")
                    end
                end
                
                # Gleichung mit Lösung
                equation_with_solution = equation * solution
                
                # Speichern der Gleichung in der entsprechenden Kategorie
                push!(equations[result], equation_with_solution)
                count_by_category[result] += 1
            end
        end
    end
    
    println("Verifikationsfehler: $verification_failures")
    return equations, count_by_category
end

# Funktion zum Speichern aller Ergebnisse in einer Datei
function save_all_equations_to_file(equations, count_by_category)
    # Erstelle einen Dateinamen mit aktuellem Zeitstempel
    timestamp = Dates.format(now(), "yyyy-mm-dd_HH-MM-SS")
    filename = "gleichungen_$(timestamp).txt"
    
    open(filename, "w") do file
        # Allgemeine Informationen
        total_count = sum(values(count_by_category))
        write(file, "Gleichungen der Form: ax + b + cx + d = ex + f + gx + h\n")
        write(file, "Gesamtzahl der gefundenen Gleichungen: $total_count\n\n")
        
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

# Hauptprogramm
println("Suche nach Gleichungen...")
equations, count_by_category = find_all_equations()
total_count = sum(values(count_by_category))

println("Gesamtzahl der Gleichungen: $total_count")

# Speichere alle Ergebnisse in einer Datei
filename = save_all_equations_to_file(equations, count_by_category)

# Ausgabe der Anzahl pro Kategorie auf der Konsole
for (category, count) in count_by_category
    println("$category: $count Gleichungen")
end

# Sortieren der Gleichungen nach x-Wert (wo möglich)
for category in ["natürliche Zahl", "negative ganze Zahl", "negative nicht-ganzzahlige Zahl", "positive nicht-ganzzahlige Zahl"]
    if !isempty(equations[category])
        sort!(equations[category], by=extract_x_value)
    end
end

# Ausgabe von Beispielgleichungen auf der Konsole
println("\nBeispiele für jede Kategorie:")
for (category, eqs) in equations
    category_count = count_by_category[category]
    println("Kategorie: $category")
    
    # Zeige maximal 10 Gleichungen pro Kategorie in der Konsolenausgabe
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

println("Alle Ergebnisse wurden in die Datei '$filename' geschrieben.")