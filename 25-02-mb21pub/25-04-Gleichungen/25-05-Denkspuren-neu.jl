using Combinatorics

function find_solutions()
    solutions = []
    
    # Generiere alle Kombinationen von 5 verschiedenen Ziffern aus 0-9
    for digits in combinations(0:9, 5)
        # Generiere alle Permutationen dieser 5 Ziffern
        for perm in permutations(digits)
            a, b, c, d, e = perm
            
            # Prüfe, ob c = 0 (Division durch Null vermeiden)
            if c == 0
                continue
            end
            
            # Berechne a - cd (Nenner)
            denominator = a - c * d
            
            # Nenner darf nicht 0 sein
            if denominator == 0
                continue
            end
            
            # Berechne ce - b (Zähler)
            numerator = c * e - b
            
            # Prüfe, ob der Bruch eine positive ganze Zahl ergibt
            if numerator % denominator == 0 && numerator * denominator > 0
                x = numerator ÷ denominator
                
                # Wenn x eine natürliche Zahl ist, speichere die Lösung
                if x > 0
                    push!(solutions, (a=a, b=b, c=c, d=d, e=e, x=x))
                end
            end
        end
    end
    
    return solutions
end

# Finde alle Lösungen
solutions = find_solutions()

# Sortiere die Lösungen nach x
sort!(solutions, by = s -> s.x)

# Gib die Lösungen aus
println("Gefundene Lösungen: ", length(solutions))
println("a b c d e | x | Gleichung")
println("-----------------+---+------------------")

for sol in solutions
    a, b, c, d, e, x = sol.a, sol.b, sol.c, sol.d, sol.e, sol.x
    println("$a $b $c $d $e | $x | $(a)·$x + $b = $c·($d·$x + $e)")
end

# Überprüfe die Lösungen
for sol in solutions
    a, b, c, d, e, x = sol.a, sol.b, sol.c, sol.d, sol.e, sol.x
    left = a * x + b
    right = c * (d * x + e)
    if left != right
        println("Fehler bei Lösung: ", sol)
    end
end