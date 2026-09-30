import { SprintSummary } from '../types/game';

/**
 * Generates a high-resolution (1200x675, 16:9 social share card) PNG picture
 * of the Daily Sprint Performance Report with the hashtag #HuntingtonHackathon2026.
 */
export async function generateSprintReportImage(summary: SprintSummary): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#13171F');
      bgGrad.addColorStop(0.5, '#1E232E');
      bgGrad.addColorStop(1, '#11141B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // Subtle decorative grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 675);
        ctx.stroke();
      }
      for (let y = 40; y < 675; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Outer Card Frame
      ctx.strokeStyle = '#384050';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 1168, 643);

      // Top Huntington Bank Hackathon 2026 Branding Ribbon
      const topGrad = ctx.createLinearGradient(16, 16, 1184, 16);
      topGrad.addColorStop(0, '#005A36'); // Huntington Deep Emerald Green
      topGrad.addColorStop(0.4, '#10B981');
      topGrad.addColorStop(0.7, '#FFD200'); // Gold Accent
      topGrad.addColorStop(1, '#48A2D8');
      ctx.fillStyle = topGrad;
      ctx.fillRect(16, 16, 1168, 8);

      // 2. Hackathon Badge (Top Left)
      ctx.fillStyle = 'rgba(0, 90, 54, 0.85)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 44, 42, 360, 34, 8, true, true);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('🏛️ HUNTINGTON BANK HACKATHON 2026', 58, 64);

      // Official Hashtag Pill
      ctx.fillStyle = 'rgba(255, 210, 0, 0.15)';
      ctx.strokeStyle = '#FFD200';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 420, 42, 330, 34, 8, true, true);

      ctx.fillStyle = '#FFD200';
      ctx.font = 'black 14px monospace';
      ctx.fillText('#HuntingtonHackathon2026', 436, 64);

      // Main Title & Subtitle
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px system-ui, -apple-system, sans-serif';
      ctx.fillText('TOLL PLAZA AGILE SIMULATOR', 44, 122);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 17px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `Sprint #${summary.sprintNumber} Retrospective · Day #${summary.dayNumber} Daily Performance Report`,
        44,
        152
      );

      // 3. Flow Grade Badge Card (Top Right)
      const gradeColorMap: Record<string, { bg: string; border: string; text: string }> = {
        'A+': { bg: '#064E3B', border: '#10B981', text: '#34D399' },
        'A': { bg: '#0C4A6E', border: '#38BDF8', text: '#38BDF8' },
        'B': { bg: '#312E81', border: '#818CF8', text: '#818CF8' },
        'C': { bg: '#78350F', border: '#F59E0B', text: '#FBBF24' },
        'D': { bg: '#881337', border: '#F43F5E', text: '#FB7185' }
      };
      const gradeStyle = gradeColorMap[summary.grade] || gradeColorMap['B'];

      ctx.fillStyle = gradeStyle.bg;
      ctx.strokeStyle = gradeStyle.border;
      ctx.lineWidth = 3;
      roundRect(ctx, 990, 42, 166, 126, 16, true, true);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FLOW GRADE', 1073, 72);

      ctx.fillStyle = gradeStyle.text;
      ctx.font = '900 68px monospace';
      ctx.fillText(summary.grade, 1073, 142);
      ctx.textAlign = 'left'; // Reset

      // 4. Key Metrics Grid (4 Cards across)
      const metrics = [
        {
          label: 'STORY POINTS SHIPPED',
          value: `${summary.deliveredPoints} pts`,
          sub: `${summary.deliveredVehiclesCount} stories cleared to dock`,
          accent: '#38BDF8',
          icon: '📦'
        },
        {
          label: 'FLOW EFFICIENCY',
          value: `${summary.flowEfficiency}%`,
          sub: `Active processing vs wait queue`,
          accent: '#34D399',
          icon: '⚡'
        },
        {
          label: 'AVERAGE CYCLE TIME',
          value: `${summary.averageCycleTime}s`,
          sub: `Lead time per work ticket`,
          accent: '#FBBF24',
          icon: '⏱️'
        },
        {
          label: 'NET FISCAL SETTLEMENT',
          value: `+$${summary.totalBonus.toLocaleString()}`,
          sub: `Daily revenue credited to bank`,
          accent: '#A78BFA',
          icon: '💰'
        }
      ];

      const cardW = 265;
      const cardH = 138;
      const startX = 44;
      const startY = 180;
      const gap = 20;

      metrics.forEach((m, idx) => {
        const x = startX + idx * (cardW + gap);
        const y = startY;

        // Card container
        ctx.fillStyle = '#181D26';
        ctx.strokeStyle = '#2E3848';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, cardW, cardH, 12, true, true);

        // Accent top indicator
        ctx.fillStyle = m.accent;
        roundRect(ctx, x, y, cardW, 4, [12, 12, 0, 0], true, false);

        // Header
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${m.icon} ${m.label}`, x + 16, y + 28);

        // Value
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '900 30px system-ui, sans-serif';
        ctx.fillText(m.value, x + 16, y + 74);

        // Subtitle
        ctx.fillStyle = '#64748B';
        ctx.font = '500 12px system-ui, sans-serif';
        ctx.fillText(m.sub, x + 16, y + 104);
      });

      // 5. Agile Coach Evaluation / Retrospective Summary Box
      ctx.fillStyle = '#1A202C';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, 44, 340, 1112, 175, 14, true, true);

      // Section title
      ctx.fillStyle = '#FFD200';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('💡 AGILE COACH RETROSPECTIVE & FLOW OBSERVATION', 68, 372);

      // Coach Advice Quote
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'italic 18px system-ui, sans-serif';
      const cleanAdvice = summary.coachAdvice.replace(/\n/g, ' ');
      wrapText(ctx, `"${cleanAdvice}"`, 68, 410, 1060, 26);

      // Highlights Bar
      if (summary.keyHighlights && summary.keyHighlights.length > 0) {
        ctx.fillStyle = '#10B981';
        ctx.font = '600 14px monospace';
        const highlightPreview = summary.keyHighlights[0] || '';
        ctx.fillText(`✨ ${highlightPreview}`, 68, 485);
      }

      // 6. Bottom Social & Hackathon Banner
      ctx.fillStyle = '#0F131A';
      ctx.strokeStyle = '#27303F';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 44, 535, 1112, 90, 12, true, true);

      // Left: Tagline & Hackathon recognition
      ctx.fillStyle = '#F1F5F9';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('Huntington Bank Hackathon 2026 · Agile Process Innovation', 68, 568);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 13px system-ui, sans-serif';
      ctx.fillText('Simulating Kanban WIP limits, Little\'s Law flow velocity, and ferry deployment cadences', 68, 594);

      // Right: Prominent Official Hashtags
      ctx.fillStyle = '#FFD200';
      ctx.font = '900 20px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('#HuntingtonHackathon2026', 1130, 574);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 13px monospace';
      ctx.fillText('#AgileDelivery #KanbanFlow #HuntingtonHackathon2026', 1130, 600);
      ctx.textAlign = 'left'; // Reset

      // Convert to blob and dataUrl
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob from canvas'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ dataUrl, blob });
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Helper to draw rounded rectangle on canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
  fill: boolean,
  stroke: boolean
) {
  let rTopLeft = 0;
  let rTopRight = 0;
  let rBottomRight = 0;
  let rBottomLeft = 0;

  if (Array.isArray(r)) {
    rTopLeft = r[0] || 0;
    rTopRight = r[1] || 0;
    rBottomRight = r[2] || 0;
    rBottomLeft = r[3] || 0;
  } else {
    rTopLeft = r;
    rTopRight = r;
    rBottomRight = r;
    rBottomLeft = r;
  }

  ctx.beginPath();
  ctx.moveTo(x + rTopLeft, y);
  ctx.lineTo(x + w - rTopRight, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rTopRight);
  ctx.lineTo(x + w, y + h - rBottomRight);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rBottomRight, y + h);
  ctx.lineTo(x + rBottomLeft, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rBottomLeft);
  ctx.lineTo(x, y + rTopLeft);
  ctx.quadraticCurveTo(x, y, x + rTopLeft, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Helper to wrap text over multiple lines
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
