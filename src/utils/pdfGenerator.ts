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
    // Render HTML element to canvas with high DPI scale and fixed A4 pixel width (794px)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const clonedTarget = clonedDoc.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.style.width = '794px';
          clonedTarget.style.maxWidth = '794px';
          clonedTarget.style.minHeight = '960px';
          clonedTarget.style.boxSizing = 'border-box';
          clonedTarget.style.margin = '0 auto';
          clonedTarget.style.padding = '40px';
          clonedTarget.style.boxShadow = 'none';
          clonedTarget.style.border = 'none';
          clonedTarget.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create A4 portrait PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Fit image to A4 page dimensions
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

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
