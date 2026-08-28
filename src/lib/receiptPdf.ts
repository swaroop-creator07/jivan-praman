export interface ReceiptData {
  name: string;
  aadhaar: string;
  ppo: string;
  bank: string;
  email: string;
  pramaanId: string;
  date: string;
}

const toAscii = (s: string) => s.replace(/[^\x20-\x7E]/g, '?');

function buildPdf(lines: string[]): string {
  const esc = (s: string) => toAscii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const fontSize = 12;
  const lineHeight = 22;
  let content = `BT\n/F1 ${fontSize} Tf\n54 790 Td\n`;
  lines.forEach((ln, i) => {
    content += `(${esc(ln)}) Tj\n`;
    if (i < lines.length - 1) content += `0 -${lineHeight} Td\n`;
  });
  content += 'ET';

  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[5] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

export function downloadReceiptPdf(data: ReceiptData): void {
  const lines = [
    'JEEVAN PRAMAAAN',
    'Digital Life Certificate - Receipt',
    '',
    `Pramaan ID : ${data.pramaanId}`,
    `Date       : ${data.date}`,
    '',
    `Name       : ${data.name}`,
    `Aadhaar    : ${data.aadhaar}`,
    `PPO Number : ${data.ppo}`,
    `Bank Acct  : ${data.bank}`,
    `Email      : ${data.email}`,
    '',
    'This receipt confirms submission of your Digital',
    'Life Certificate. Keep it for your records.',
  ];
  const pdf = buildPdf(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JeevanPramaan_${data.pramaanId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
