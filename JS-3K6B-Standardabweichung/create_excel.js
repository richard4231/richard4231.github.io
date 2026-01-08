const XlsxPopulate = require('xlsx-populate');

async function createExcel() {
  const wb = await XlsxPopulate.fromBlankAsync();

  // === Blatt 1: Parameter (umbenannt von Sheet1) ===
  const wsParam = wb.sheet(0).name('Parameter');

  wsParam.cell('A1').value('Normalverteilte Packungsgewichte - Simulation');
  wsParam.cell('A3').value('=== Parameter (hier anpassen) ===');
  wsParam.cell('A4').value('Theoretischer Mittelwert (g)');
  wsParam.cell('B4').value(1010);
  wsParam.cell('A5').value('Theoretische Standardabweichung (g)');
  wsParam.cell('B5').value(5);
  wsParam.cell('A6').value('Anzahl Packungen');
  wsParam.cell('B6').value(2000);

  wsParam.cell('A8').value('=== Berechnete Kennzahlen ===');
  wsParam.cell('A9').value('Berechneter Mittelwert (g)');
  wsParam.cell('B9').formula('AVERAGE(Daten!B2:B2001)');
  wsParam.cell('A10').value('Median (g)');
  wsParam.cell('B10').formula('MEDIAN(Daten!B2:B2001)');
  wsParam.cell('A11').value('Berechnete Standardabweichung (g)');
  wsParam.cell('B11').formula('STDEV.P(Daten!B2:B2001)');
  wsParam.cell('A12').value('Q1 - 25% Quartil (g)');
  wsParam.cell('B12').formula('QUARTILE.INC(Daten!B2:B2001,1)');
  wsParam.cell('A13').value('Q3 - 75% Quartil (g)');
  wsParam.cell('B13').formula('QUARTILE.INC(Daten!B2:B2001,3)');
  wsParam.cell('A14').value('Minimum (g)');
  wsParam.cell('B14').formula('MIN(Daten!B2:B2001)');
  wsParam.cell('A15').value('Maximum (g)');
  wsParam.cell('B15').formula('MAX(Daten!B2:B2001)');
  wsParam.cell('A16').value('Spannweite (g)');
  wsParam.cell('B16').formula('B15-B14');
  wsParam.cell('A17').value('IQR (Q3-Q1) (g)');
  wsParam.cell('B17').formula('B13-B12');

  wsParam.cell('A19').value('Hinweis: Drücke F9 um neue Zufallswerte zu generieren');

  wsParam.column('A').width(40);
  wsParam.column('B').width(20);

  // === Blatt 2: Daten ===
  const wsDaten = wb.addSheet('Daten');

  wsDaten.cell('A1').value('Nr');
  wsDaten.cell('B1').value('Gewicht (g)');
  wsDaten.cell('C1').value('Mittelwert');
  wsDaten.cell('D1').value('StdAbw');

  // Parameter-Referenzen in C2 und D2
  wsDaten.cell('C2').formula('Parameter!$B$4');
  wsDaten.cell('D2').formula('Parameter!$B$5');

  // 2000 Datenzeilen
  for (let i = 1; i <= 2000; i++) {
    wsDaten.cell('A' + (i + 1)).value(i);
    wsDaten.cell('B' + (i + 1)).formula('NORM.INV(RAND(),$C$2,$D$2)');
  }

  wsDaten.column('A').width(8);
  wsDaten.column('B').width(18);
  wsDaten.column('C').hidden(true);
  wsDaten.column('D').hidden(true);

  // === Histogramm-Blätter ===
  function createHistSheet(name, step, halfStep) {
    const ws = wb.addSheet(name);
    ws.cell('A1').value('Histogramm - Intervallgrösse ' + step + 'g');
    ws.cell('A3').value('Intervallmitte (g)');
    ws.cell('B3').value('Anzahl');

    let row = 4;
    for (let m = 985; m <= 1035; m += step) {
      const ug = m - halfStep;
      const og = m + halfStep;
      ws.cell('A' + row).value(m);
      ws.cell('B' + row).formula(`COUNTIFS(Daten!B:B,">=${ug}",Daten!B:B,"<${og}")`);
      row++;
    }

    ws.column('A').width(18);
    ws.column('B').width(10);
  }

  createHistSheet('Histogramm 0.5g', 0.5, 0.25);
  createHistSheet('Histogramm 1g', 1, 0.5);
  createHistSheet('Histogramm 2g', 2, 1);
  createHistSheet('Histogramm 5g', 5, 2.5);

  // Speichern
  await wb.toFileAsync('normalverteilung_simulation.xlsx');
  console.log('Excel-Datei erstellt: normalverteilung_simulation.xlsx');
  console.log('- Parameter-Blatt mit anpassbaren Werten (B4=Mittelwert, B5=StdAbw)');
  console.log('- Daten-Blatt mit 2000 Zeilen (NORM.INV-Formeln)');
  console.log('- 4 Histogramm-Blätter (0.5g, 1g, 2g, 5g)');
}

createExcel().catch(console.error);
