using Combinatorics

# Simuliere einen Klick-Pattern auf dem 6-Bit System
function simulate_clicks(click_pattern, num_bits=6)
    bits = zeros(Int, num_bits)
    
    for i in 1:length(click_pattern)
        if click_pattern[i] == 1
            # Klick auf Position i beeinflusst i-1, i, i+1
            if i > 1; bits[i-1] = 1 - bits[i-1]; end
            bits[i] = 1 - bits[i]
            if i < num_bits; bits[i+1] = 1 - bits[i+1]; end
        end
    end
    
    # Berechne Dezimalwert (linkestes Bit = höchste Potenz)
    decimal_value = sum(bits[i] * 2^(num_bits-i) for i in 1:num_bits)
    
    return bits, decimal_value
end

# Analysiere alle Kombinationen systematisch
function analyze_all_combinations(num_bits=6)
    println("=== SYSTEMATISCHE ANALYSE für $num_bits-Bit System ===\n")
    
    all_results = Dict{Int, Vector{Vector{Int}}}()  # decimal_value => [click_patterns]
    
    # Für jede Anzahl Klicks
    for num_clicks in 0:num_bits
        println("--- $num_clicks Klicks ($(binomial(num_bits, num_clicks)) Kombinationen) ---")
        
        # Generiere alle Kombinationen von num_clicks Positionen
        for positions in combinations(1:num_bits, num_clicks)
            # Erstelle Click-Pattern
            click_pattern = zeros(Int, num_bits)
            click_pattern[positions] .= 1
            
            # Simuliere
            bits, decimal_value = simulate_clicks(click_pattern, num_bits)
            
            # Speichere Ergebnis
            if !haskey(all_results, decimal_value)
                all_results[decimal_value] = []
            end
            push!(all_results[decimal_value], collect(positions))
            
            # Ausgabe
            positions_str = isempty(positions) ? "keine" : join(positions, ",")
            bits_str = join(bits, "")
            println("  Klicks $positions_str: $bits_str = $decimal_value")
        end
        println()
    end
    
    return all_results
end

# Analysiere Erreichbarkeit
function analyze_reachability(results, max_value=63)
    println("=== ERREICHBARKEITS-ANALYSE ===\n")
    
    reachable = sort(collect(keys(results)))
    unreachable = setdiff(0:max_value, reachable)
    
    println("Erreichbare Zahlen ($(length(reachable))): $reachable")
    println("Unerreichbare Zahlen ($(length(unreachable))): $unreachable")
    println()
    
    # Minimale Klicks für jede erreichbare Zahl
    println("Minimale Anzahl Klicks:")
    for value in reachable
        min_clicks = minimum(length(pattern) for pattern in results[value])
        patterns_with_min = [p for p in results[value] if length(p) == min_clicks]
        
        if length(patterns_with_min) == 1
            pattern_str = isempty(patterns_with_min[1]) ? "keine Klicks" : "Klicks $(join(patterns_with_min[1], ","))"
            println("  $value: $min_clicks Züge ($pattern_str)")
        else
            println("  $value: $min_clicks Züge ($(length(patterns_with_min)) verschiedene Wege)")
        end
    end
end

# Führe die Analyse durch
results_6bit = analyze_all_combinations(6)
analyze_reachability(results_6bit, 63)

# Optional: Auch 7-Bit System
println("\n" * "="^60)
results_7bit = analyze_all_combinations(7)
analyze_reachability(results_7bit, 127)