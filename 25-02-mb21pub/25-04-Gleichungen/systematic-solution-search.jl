using Combinatorics

# Funktion zur Überprüfung der Lösungsart
function check_solution(a, b, c, d, e, f, g, h)
    numerator = (f + h) - (b + d)
    denominator = (a + c) - (e + g)
    
    if denominator == 0
        if numerator == 0
            return "allgemeingültig"  # Jedes x ist eine Lösung
        else
            return "keine Lösung"  # Keine Lösung möglich
        end
    else
        x = numerator // denominator  # Rationale Zahl
        
        if denominator(x) == 1  # Wenn der Nenner 1 ist, ist es eine ganze Zahl
            if numerator(x) >= 0
                return "natürliche Zahl"  # x ist eine nicht-negative ganze Zahl
            else
                return "negative ganze Zahl"  # x ist eine negative ganze Zahl
            end
        else
            if x < 0
                return "negative nicht-ganzzahlige Zahl"
            else
                return "positive nicht-ganzzahlige Zahl"
            end
        end
    end
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

# Generiere alle Kombinationen von 8 verschiedenen Ziffern (aus 0-9)
digits = collect(0:9)
count = 0

for combination in combinations(digits, 8)
    # Generiere direkt gültige Koeffizientensätze
    for a_idx in 1:5  # a kann höchstens 5 sein, damit a < c < e < g für 0-9 erfüllt sein kann
        a = combination[a_idx]
        
        for c_idx in (a_idx+1):6  # c > a und höchstens 6
            c = combination[c_idx]
            
            for e_idx in (c_idx+1):7  # e > c und höchstens 7
                e = combination[e_idx]
                
                for g_idx in (e_idx+1):8  # g > e und höchstens 8
                    g = combination[g_idx]
                    
                    # Verbleibende Indizes für b, d, f, h
                    remaining_indices = setdiff(1:8, [a_idx, c_idx, e_idx, g_idx])
                    
                    # Generiere alle möglichen Anordnungen von b, d, f, h
                    for indices in combinations(remaining_indices, 2)  # Wähle 2 Indizes für b und d
                        b_idx, d_idx = indices
                        remaining_indices_fh = setdiff(remaining_indices, [b_idx, d_idx])
                        f_idx, h_idx = remaining_indices_fh
                        
                        b = combination[b_idx]
                        d = combination[d_idx]
                        f = combination[f_idx]
                        h = combination[h_idx]
                        
                        # Überprüfe die Bedingungen b < d und f < h
                        if b < d && f < h
                            result = check_solution(a, b, c, d, e, f, g, h)
                            
                            # Gleichung in der Form ax + b + cx + d = ex + f + gx + h
                            equation = "$(a)x + $b + $(c)x + $d = $(e)x + $f + $(g)x + $h"
                            
                            # Lösungswert berechnen (falls vorhanden)
                            solution = ""
                            numerator = (f + h) - (b + d)
                            denominator = (a + c) - (e + g)
                            
                            if denominator == 0
                                if numerator == 0
                                    solution = ", x ∈ ℝ"
                                else
                                    solution = ", keine Lösung"
                                end
                            else
                                x = numerator // denominator  # Rationale Zahl
                                solution = ", x = $x"
                            end
                            
                            # Gleichung mit Lösung
                            equation_with_solution = equation * solution
                            
                            # Speichern der Gleichung in der entsprechenden Kategorie
                            push!(equations[result], equation_with_solution)
                            count += 1
                        end
                    end
                end
            end
        end
    end
end

println("Gesamtzahl der Gleichungen: $count")

# Ausgabe der Ergebnisse
for (category, eqs) in equations
    println("Kategorie: $category")
    println("Anzahl der Gleichungen: $(length(eqs))")
    
    # Zeige maximal 50 Gleichungen pro Kategorie
    for i in 1:min(50, length(eqs))
        println("  $(eqs[i])")
    end
    println()
end