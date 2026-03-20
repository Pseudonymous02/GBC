import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types';
import { MOCK_ACCOUNTS } from '@/constants';
import { formatAmount, sortTransactionsByDate } from './utils';

const BANK_MANAGER = 'Mr Anselm Radsford Adzete Sowah';

const GCB_INFO = {
  address:  'No.1 High Street Thorpe Rd, Accra, Ghana',
  building: 'Ghana Commercial Bank Building Ministries',
  location: 'Brong Ahafo | P.O Box GP 2647 Accra',
};

const GOLD  = '#F5A000';
const DARK  = '#1a1a1a';
const WHITE = '#ffffff';
const LGRAY = '#f5f5f5';
const MGRAY = '#cccccc';

function rgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export async function generateGCBStatementPDF(
  transactions: Transaction[],
  accountId: string
) {
  const account = MOCK_ACCOUNTS.find(a => a.id === accountId);
  if (!account) {
    console.error('Account not found');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const ML = 14;
  const MR = 14;
  const TW = PW - ML - MR; // 182mm usable width

  // ── Sort & dates ──────────────────────────────────────────────────────────
  const sortedTx = sortTransactionsByDate(transactions);
  const startDate = sortedTx.length
    ? new Date(sortedTx[sortedTx.length - 1].date)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const openingBalance =
    (account.currentBalance || 0) -
    sortedTx.reduce((sum, t) => sum + (t.amount || 0), 0);

  // ── LEFT: "GCB" bold + " Bank" normal + gold diamond ─────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...rgb(DARK));
  doc.text('GCB', ML, 20);

  const gcbW = doc.getTextWidth('GCB');
  doc.setFont('helvetica', 'normal');
  doc.text(' Bank', ML + gcbW, 20);

  // Gold diamond
  const bankW = doc.getTextWidth(' Bank');
  const dx = ML + gcbW + bankW + 3;
  const dy = 16.5;
  const ds = 3.5;
  doc.setFillColor(...rgb(GOLD));
  doc.setDrawColor(...rgb(GOLD));
  doc.triangle(dx, dy - ds, dx + ds, dy, dx, dy + ds, 'F');
  doc.triangle(dx, dy - ds, dx - ds, dy, dx, dy + ds, 'F');

  // Sub-info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...rgb(DARK));
  doc.text(GCB_INFO.address,  ML, 27);
  doc.text(GCB_INFO.building, ML, 31);
  doc.text(GCB_INFO.location, ML, 35);

  // ── RIGHT: "Your Statement" in gold ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...rgb(GOLD));
  doc.text('Your Statement', PW - MR, 20, { align: 'right' });

  // ── INFO BOX ─────────────────────────────────────────────────────────────
  const infoRows: [string, string][] = [
    ['Account Number',   `****${account.mask}`],
    ['Statement Period', `${startDate.toLocaleDateString('en-GB')} \u2013 ${endDate.toLocaleDateString('en-GB')}`],
    ['Closing Balance',  `${formatAmount(account.currentBalance || 0)} CR`],
    ['Enquiries',        '0800 GCB HELP'],
  ];

  const boxX = 108;
  const boxW = PW - MR - boxX;
  const rowH = 7;
  let iy = 26;

  infoRows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...rgb(LGRAY));
      doc.rect(boxX, iy - 4.5, boxW, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...rgb(DARK));
    doc.text(label, boxX + 2, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(value, PW - MR - 1, iy, { align: 'right' });
    iy += rowH;
  });

  // ── ADDRESS BLOCK ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...rgb(DARK));
  const addrLines = [
    (account.name || 'ACCOUNT HOLDER').toUpperCase(),
    'HEAD OFFICE BRANCH',
    'ACCRA, GHANA',
  ];
  addrLines.forEach((line, i) => doc.text(line, ML, 44 + i * 5));

  // ── GOLD DIVIDER ─────────────────────────────────────────────────────────
  const divY = 64;
  doc.setDrawColor(...rgb(GOLD));
  doc.setLineWidth(1.5);
  doc.line(ML, divY, PW - MR, divY);

  // ── ACCOUNT SECTION ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...rgb(DARK));
  doc.text((account.type || 'DEPOSIT').toUpperCase() + ' ACCOUNT', ML, divY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const blurb =
    'Enjoy the convenience and security of banking with GCB Bank. ' +
    'Your account gives you 24/7 access to funds via our mobile app and branch network.';
  const blurbLines = doc.splitTextToSize(blurb, TW) as string[];
  doc.text(blurbLines, ML, divY + 16);

  const noteY = divY + 16 + blurbLines.length * 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Name:   ${account.name || 'Account Holder'}`, ML, noteY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const note =
    'Note:   Have you checked your statement today? For queries on any transaction, ' +
    'please contact your branch or call GCB customer care. ' +
    'This is a computer-generated statement.';
  const noteLines = doc.splitTextToSize(note, TW) as string[];
  doc.text(noteLines, ML, noteY + 6);

  // ── TRANSACTION TABLE ─────────────────────────────────────────────────────
  // Columns sum = 22+68+26+22+22+22 = 182mm = TW exactly
  let runningBalance = openingBalance;

  const tableBody = sortedTx.map(t => {
    const amt = t.amount || 0;
    runningBalance += amt;
    const isDebit = amt < 0;
    return [
      new Date(t.date).toLocaleDateString('en-GB'),
      t.name || 'Transaction',
      t.category || 'GENERAL',
      isDebit  ? formatAmount(Math.abs(amt)) : '',
      !isDebit ? formatAmount(amt)           : '',
      `${formatAmount(runningBalance)} CR`,
    ];
  });

  const tableStartY = noteY + 6 + noteLines.length * 4.5 + 4;

  autoTable(doc, {
    head: [['DATE', 'DESCRIPTION', 'CATEGORY', 'DEBIT', 'CREDIT', 'BALANCE']],
    body: tableBody,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      textColor: rgb(DARK),
      lineColor: rgb(MGRAY),
      lineWidth: 0.2,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: rgb(GOLD),
      textColor: rgb(WHITE),
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
    },
    alternateRowStyles: {
      fillColor: rgb(LGRAY),
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'left'  },   // DATE
      1: { cellWidth: 68, halign: 'left'  },   // DESCRIPTION
      2: { cellWidth: 26, halign: 'left'  },   // CATEGORY
      3: { cellWidth: 22, halign: 'right' },   // DEBIT
      4: { cellWidth: 22, halign: 'right' },   // CREDIT
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, // BALANCE
    },
    margin: { left: ML, right: MR },
  });

  // ── SUMMARY BOX ──────────────────────────────────────────────────────────
  // Guard access to lastAutoTable in case the autoTable plugin hasn't set it
  const lastAutoTable = (doc as any)?.lastAutoTable;
  const tableEndY: number = lastAutoTable?.finalY ? lastAutoTable.finalY + 8 : doc.internal.pageSize.getHeight() - 40;

  doc.setFillColor(...rgb(LGRAY));
  doc.rect(ML, tableEndY - 5, TW, 22, 'F');
  // Gold left accent on summary box
  doc.setFillColor(...rgb(GOLD));
  doc.rect(ML, tableEndY - 5, 3, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...rgb(DARK));
  doc.text('OPENING BALANCE:', ML + 6, tableEndY + 2);
  doc.text(formatAmount(openingBalance), PW - MR - 2, tableEndY + 2, { align: 'right' });

  doc.text('CLOSING BALANCE:', ML + 6, tableEndY + 11);
  doc.text(formatAmount(account.currentBalance || 0), PW - MR - 2, tableEndY + 11, { align: 'right' });

  // ── SIGNATURE ────────────────────────────────────────────────────────────
  const sigY = tableEndY + 30;
  doc.setDrawColor(...rgb(DARK));
  doc.setLineWidth(0.5);
  doc.line(ML, sigY, 75, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Branch Manager', ML, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_MANAGER, ML, sigY + 11);

  // ── FOOTER ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...rgb(MGRAY));
  doc.text('This is a computer generated statement. No signature required.', ML, sigY + 22);
  doc.text('GCB Bank Ltd \u2013 Authorised & Regulated by the Bank of Ghana.', ML, sigY + 27);

  // ── SAVE ─────────────────────────────────────────────────────────────────
  const filename = `GCB-Statement-${account.mask}-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}