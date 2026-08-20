import { UserProfile, NatalChart, PalmAnalysis, DrawnCard } from '../types';

export function exportFullMysticReportPDF(
  user: UserProfile,
  chart?: NatalChart | null,
  palm?: PalmAnalysis | null,
  tarotCards?: DrawnCard[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes para generar el reporte.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Celestial Alchemy — Reporte Místico Integral</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      background-color: #0c0e12;
      color: #e1e2e7;
      font-family: 'Manrope', sans-serif;
      margin: 0;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #f2ca50;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #f2ca50;
      letter-spacing: 2px;
      margin: 0;
    }
    .subtitle {
      font-size: 14px;
      color: #cfcece;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .user-box {
      background: #191c1f;
      border: 1px solid #4d4635;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-size: 14px;
    }
    .user-box strong {
      color: #f2ca50;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: #f2ca50;
      border-left: 4px solid #f2ca50;
      padding-left: 10px;
      margin: 24px 0 12px 0;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }
    .card {
      background: #1d2023;
      border: 1px solid #323539;
      border-radius: 8px;
      padding: 14px;
      font-size: 13px;
      line-height: 1.5;
    }
    .card h4 {
      margin: 0 0 6px 0;
      color: #dcb8ff;
      font-size: 15px;
    }
    .tag {
      display: inline-block;
      background: rgba(242, 202, 80, 0.15);
      color: #f2ca50;
      border: 1px solid rgba(242, 202, 80, 0.3);
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 6px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #323539;
      font-size: 12px;
      color: #99907c;
    }
    @media print {
      body {
        background-color: #0c0e12 !important;
        color: #e1e2e7 !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">CELESTIAL ALCHEMY</h1>
    <div class="subtitle">Reporte Sagrado de Quiromancia, Astrología & Tarot</div>
  </div>

  <div class="user-box">
    <div><strong>Consultante:</strong> ${user.fullName || 'Iniciado Celestial'}</div>
    <div><strong>Fecha & Hora Natal:</strong> ${user.birthDate || 'N/A'} ${user.birthTime || ''}</div>
    <div><strong>Lugar de Nacimiento:</strong> ${user.birthPlace || 'N/A'}</div>
    <div><strong>Tríada Cósmica:</strong> Sol en ${user.zodiacSign || 'Leo'} • Luna en ${user.moonSign || 'Piscis'} • AC ${user.ascendant || 'Escorpio'}</div>
    <div><strong>Camino de Vida (Numerología):</strong> Sendero ${user.lifePathNumber || 7}</div>
    <div><strong>Número de Expresión:</strong> ${user.expressionNumber || 11} (Maestro)</div>
  </div>

  <div class="section-title">I. Síntesis Astrológica y Misión del Alma</div>
  <div class="card-grid">
    <div class="card">
      <h4>☀️ Sol Natal (Propósito Consciente)</h4>
      <p>Signo: <strong>${user.zodiacSign || 'Leo'}</strong></p>
      <p>Tu fuego primordial te invita a irradiar autenticidad, liderar con el corazón y manifestar tus visiones creativas con generosidad inquebrantable.</p>
    </div>
    <div class="card">
      <h4>🌙 Luna Natal (Mundo Emocional & Subconsciente)</h4>
      <p>Signo: <strong>${user.moonSign || 'Piscis'}</strong></p>
      <p>Tu refugio de paz reside en la conexión intuitiva y la empatía profunda. Canalizas el dolor del entorno transformándolo en arte y comprensión.</p>
    </div>
    <div class="card">
      <h4>⚡ Ascendente (Vehículo y Proyección Cósmica)</h4>
      <p>Signo: <strong>${user.ascendant || 'Escorpio'}</strong></p>
      <p>El universo te percibe como un alma magnética y transformadora, capaz de transmutar cualquier crisis en renacimiento.</p>
    </div>
    <div class="card">
      <h4>🔢 Camino de Vida (Frecuencia Pitagórica)</h4>
      <p>Sendero: <strong>${user.lifePathNumber || 7}</strong></p>
      <p>El buscador de la verdad. Tu misión es desvelar los misterios profundos y unir la ciencia con la sabiduría espiritual.</p>
    </div>
  </div>

  ${
    palm
      ? `
  <div class="section-title">II. Dictamen de Quiromancia (Lectura de Manos)</div>
  <div class="card-grid">
    <div class="card">
      <h4>Mano Analizada: ${palm.handSide === 'left' ? 'Mano Izquierda (Karma & Dones Innatos)' : 'Mano Derecha (Destino Manifiesto)'}</h4>
      <p><strong>Elemento de la Mano:</strong> Mano de ${palm.element} (${palm.elementDescription})</p>
      <p><strong>Vitalidad:</strong> ${palm.vitalityScore}% | <strong>Intuición:</strong> ${palm.intuitionScore}% | <strong>Fortuna:</strong> ${palm.fortuneScore}%</p>
    </div>
    <div class="card">
      <h4>Dictamen de las Líneas Mayores</h4>
      ${palm.lines
        .map(
          l => `
        <p><strong>${l.name}:</strong> ${l.depth} — ${l.reading}</p>
      `
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  ${
    tarotCards && tarotCards.length > 0
      ? `
  <div class="section-title">III. Oráculo del Tarot Activo</div>
  <div class="card-grid">
    ${tarotCards
      .map(
        c => `
      <div class="card">
        <h4>${c.positionName}: ${c.card.name} ${c.isReversed ? '(Invertida)' : '(Al Derecho)'}</h4>
        <p><strong>Palabras Clave:</strong> ${c.card.keywords.join(', ')}</p>
        <p>${c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning}</p>
        <div class="tag">${c.card.spiritualAffirmation}</div>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>Sellado en el Templo Sagrado de <strong>Celestial Alchemy</strong> • Documento personal e intransferible</p>
    <p>Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
