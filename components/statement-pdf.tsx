import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types';
import { MOCK_ACCOUNTS } from '@/constants';
import { formatAmount, sortTransactionsByDate } from './utils';

const BANK_MANAGER = 'Mr Anselm Radsford Adzete Sowah';

const GCB_INFO = {
  name: 'GCB Bank',
  nameBold: 'GCB',
  nameThin: ' Bank',
  sub1: 'Ghana Commercial Bank Ltd.',
  sub2: 'ABN 00 000 000 000 | Head Office Branch',
  sub3: 'No.1 High Street Thorpe Rd, Accra, Ghana',
};

const GOLD   = '#F5A000';
const DARK   = '#1a1a1a';
const WHITE  = '#ffffff';
const LGRAY  = '#f5f5f5';
const MGRAY  = '#cccccc';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function generateGCBStatementPDF(
  transactions: Transaction[],
  accountId: string
) {
  const account = MOCK_ACCOUNTS.find(a => a.id === accountId);
  if (!account) { console.error('Account not found'); return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210; // A4 width mm

  // ─── HEADER ──────────────────────────────────────────────────────────────

  // Left: "GCB" bold + " Bank" normal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...hexToRgb(DARK));
  doc.text('GCB', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(22);
  const gcbW = doc.getTextWidth('GCB');
  doc.text(' Bank', 14 + gcbW, 20);

  // Gold diamond shape (drawn as rotated square using lines)
  const dx = 14 + gcbW + doc.getTextWidth(' Bank') + 4;
  const dy = 16;
  const ds = 4; // half-size
  doc.setFillColor(...hexToRgb(GOLD));
  doc.setDrawColor(...hexToRgb(GOLD));
  // Draw diamond via triangle pairs
  doc.triangle(dx, dy - ds, dx + ds, dy, dx, dy + ds, 'F');
  doc.triangle(dx, dy - ds, dx - ds, dy, dx, dy + ds, 'F');

  // Sub-info lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(GCB_INFO.sub1, 14, 26);
  doc.text(GCB_INFO.sub2, 14, 30);
  doc.text(GCB_INFO.sub3, 14, 34);

  // Right: "Your Statement" in gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...hexToRgb(GOLD));
  doc.text('Your Statement', PW - 14, 20, { align: 'right' });

  // ─── INFO BOX (right side, below title) ──────────────────────────────────

  const sortedTx = sortTransactionsByDate(transactions);
  const startDate = sortedTx.length
    ? new Date(sortedTx[sortedTx.length - 1].date)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const openingBalance =
    (account.currentBalance || 0) -
    sortedTx.reduce((sum, t) => sum + (t.amount || 0), 0);

  const infoRows = [
    ['Account Number',   `****${account.mask}`],
    ['Statement Period', `${startDate.toLocaleDateString('en-GB')} – ${endDate.toLocaleDateString('en-GB')}`],
    ['Closing Balance',  `${formatAmount(account.currentBalance || 0)} CR`],
    ['Enquiries',        '0800 GCB BANK'],
  ];

  const boxX = 110;
  const boxW = PW - 14 - boxX;
  const rowH = 7;
  let iy = 25;

  infoRows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...hexToRgb(LGRAY));
      doc.rect(boxX, iy - 4.5, boxW, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(label, boxX + 2, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(value, PW - 15, iy, { align: 'right' });
    iy += rowH;
  });

  // ─── ADDRESS BLOCK ────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...hexToRgb(DARK));
  const addr = [
    account.name?.toUpperCase() || 'ACCOUNT HOLDER',
    'HEAD OFFICE BRANCH',
    'ACCRA, GHANA',
  ];
  addr.forEach((line, i) => doc.text(line, 14, 44 + i * 5));

  // ─── GOLD DIVIDER ─────────────────────────────────────────────────────────

  const divY = 64;
  doc.setDrawColor(...hexToRgb(GOLD));
  doc.setLineWidth(1.5);
  doc.line(14, divY, PW - 14, divY);

  // ─── ACCOUNT TYPE TITLE ───────────────────────────────────────────────────

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(DARK));
  doc.text((account.type || 'DEPOSIT').toUpperCase() + ' ACCOUNT', 14, divY + 9);

  // Description blurb
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const blurb =
    'Enjoy the convenience and security of banking with GCB Bank. ' +
    'Your account gives you 24/7 access to funds via our mobile app and branch network.';
  const blurbLines = doc.splitTextToSize(blurb, PW - 28) as string[];
  doc.text(blurbLines, 14, divY + 15);

  // Name + note
  const noteY = divY + 15 + blurbLines.length * 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Name:  ${account.name || 'Account Holder'}`, 14, noteY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const note =
    'Note:   Have you checked your statement today? For queries on any transaction, ' +
    'please contact your branch or call GCB customer care. This is a computer-generated statement.';
  const noteLines = doc.splitTextToSize(note, PW - 28) as string[];
  doc.text(noteLines, 14, noteY + 6);

  // ─── TRANSACTION TABLE ────────────────────────────────────────────────────

  let runningBalance = openingBalance;

  // Build debit / credit split rows
  const tableRows = sortedTx.map(t => {
    const amt = t.amount || 0;
    runningBalance += amt;
    const isDebit = amt < 0;
    return [
      new Date(t.date).toLocaleDateString('en-GB'),
      (t.name || 'Transaction').substring(0, 38),
      t.category || 'GENERAL',
      isDebit  ? formatAmount(Math.abs(amt)) : '',
      !isDebit ? formatAmount(amt)           : '',
      `${formatAmount(runningBalance)} CR`,
    ];
  });

  const tableStartY = noteY + 6 + noteLines.length * 4.5 + 4;

  autoTable(doc, {
    head: [['DATE', 'DESCRIPTION', 'CATEGORY', 'DEBIT', 'CREDIT', 'BALANCE']],
    body: tableRows,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: hexToRgb(DARK),
      lineColor: hexToRgb(MGRAY),
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: hexToRgb(GOLD),
      textColor: hexToRgb(WHITE),
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: hexToRgb(LGRAY),
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'left'  },
      1: { cellWidth: 55, halign: 'left'  },
      2: { cellWidth: 28, halign: 'left'  },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // ─── SUMMARY ──────────────────────────────────────────────────────────────

  const lastAutoTable = (doc as any)?.lastAutoTable;
  const finalY: number = lastAutoTable?.finalY ? lastAutoTable.finalY + 8 : doc.internal.pageSize.getHeight() - 40;

  // Light box for summary
  doc.setFillColor(...hexToRgb(LGRAY));
  doc.rect(14, finalY - 5, PW - 28, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(DARK));
  doc.text('OPENING BALANCE:', 16, finalY + 1);
  doc.text(formatAmount(openingBalance), PW - 16, finalY + 1, { align: 'right' });

  doc.text('CLOSING BALANCE:', 16, finalY + 9);
  doc.text(formatAmount(account.currentBalance || 0), PW - 16, finalY + 9, { align: 'right' });

  // ─── SIGNATURE ────────────────────────────────────────────────────────────

  const sigY = finalY + 28;
  doc.setDrawColor(...hexToRgb(DARK));
  doc.setLineWidth(0.5);
  doc.line(14, sigY, 75, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Branch Manager', 14, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_MANAGER, 14, sigY + 11);

  // ─── FOOTER ───────────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(MGRAY));
  doc.text('This is a computer generated statement. No signature required.', 14, sigY + 22);
  doc.text('GCB Bank Ltd – Authorised & Regulated by the Bank of Ghana.', 14, sigY + 27);

  // ─── SAVE ─────────────────────────────────────────────────────────────────

  const filename = `GCB-Statement-${account.mask}-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}