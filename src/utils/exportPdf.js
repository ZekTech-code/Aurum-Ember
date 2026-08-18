import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePdf({ title, subtitle, headers, rows, fileName }) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Aurum & Ember', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(title, pageWidth / 2, 28, { align: 'center' });

  if (subtitle) {
    doc.text(subtitle, pageWidth / 2, 34, { align: 'center' });
  }

  doc.setDrawColor(201, 146, 42);
  doc.setLineWidth(0.5);
  doc.line(20, 38, pageWidth - 20, 38);

  doc.setTextColor(0, 0, 0);

  const startY = subtitle ? 44 : 42;

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [201, 146, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 240],
    },
    margin: { top: startY, left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}  •  Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`${fileName}.pdf`);
}
