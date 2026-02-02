Das hat nicht funktioniert, ich habe die Ändeurngen rückgängig gemacht. 
Wie würde es funktionieren mit dieser Lösung?:
- Die Scheiben zeigen die Werte nur beim vierten Farbschema an, die Oberseite ist grün, die Unterseite ist blau, das kann beim Picking berücksichtigt werden. 
- Es wird nur auf die Ebene am nächsten von der Kamera geschaut. Grün und Pink reagieren nicht auf das Anklicken, wenn sie zuvorderst sind, gibt es keine Anzeige (wegmachen), auch wenn dahinter eine grüne oder blaue Ebene ist. 
- Mach den Code robust, so dass auch bei Farbänderungen er noch funktioniert. Komentiere gleichzeitig, dort wo es darauf ankommt, dass die Farben nicht einfach so gewechselt werden können.

Lässt sich dies zuverlässig umsetzen?

Verstehe das Programm.
Es geht nur noch um das korrekte Auswählen der Daten einer angeklickten Scheibe. Im Moment funktioniert dies nicht zuverlässig. Ziel: Wenn ich eine Scheibe oder einen Ring anklicke, sowohl an der Mantelfläche, auf der Oberfläche als auch auf der Unterfläche (sobald Abstand > 4) werden die entsprechenden Angaben auf dem Panel ausgegeben. Das Panel muss nicht angepasst werden.
Mit dem jetzigen Code wird manchmal die richtige, manchmal auch die Scheibe unter der richtigen ausgegeben.
Mach einen Vroschlag für eine zuverlässige Umsetzung.


