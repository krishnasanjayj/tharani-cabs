import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Captures an HTML element by ID and downloads a crisp PDF document
 */
export async function downloadInvoicePDF(elementId: string, invoiceId: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Invoice render element with ID '${elementId}' not found.`);
    return false;
  }

  try {
    // Render HTML element to canvas with high DPI scale
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create A4 portrait PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if invoice spans multiple pages
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `Tharani_Cabs_Invoice_${invoiceId.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

/**
 * Triggers standard browser print dialog for the invoice container
 */
export function printInvoice(): void {
  window.print();
}
