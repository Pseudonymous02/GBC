'use client';

import {
  getStoredAccounts, getStoredTransactions,
  setStoredAccounts, setStoredTransactions,
} from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, DollarSign, CreditCard, CheckCircle,
  ArrowRight, AlertCircle, Clock, Zap, Building2,
  Shield, Smartphone, Mail, RefreshCw, Lock,
  Globe, MapPin, Search, User, Hash, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { Account, Transaction } from '@/types';
import { formatAmount } from '@/lib/utils';
import { Stepper } from "@/components/shared/Stepper";
import { ActionButton } from "@/components/shared/ActionButton";
import { BackButton } from "@/components/shared/BackButton";
import { SummaryRow } from "@/components/shared/SummaryRow";

// ── Bank lists ────────────────────────────────────────────────────────────────
const LOCAL_BANKS = [
  { id: 'gcb',       name: 'GCB Bank',              code: 'GCB',  country: 'GH' },
  { id: 'absa',      name: 'Absa Bank Ghana',        code: 'ABSA', country: 'GH' },
  { id: 'ecobank',   name: 'Ecobank Ghana',          code: 'ECO',  country: 'GH' },
  { id: 'stanbic',   name: 'Stanbic Bank Ghana',     code: 'STB',  country: 'GH' },
  { id: 'calbank',   name: 'CalBank',                code: 'CAL',  country: 'GH' },
  { id: 'zenith',    name: 'Zenith Bank Ghana',      code: 'ZEN',  country: 'GH' },
  { id: 'fidelity',  name: 'Fidelity Bank Ghana',    code: 'FID',  country: 'GH' },
  { id: 'access',    name: 'Access Bank Ghana',      code: 'ACC',  country: 'GH' },
];

const INTERNATIONAL_BANKS = [
  { id: 'chase',      name: 'JPMorgan Chase',         code: 'CHASE',  country: 'US', flag: '🇺🇸' },
  { id: 'bofa',       name: 'Bank of America',        code: 'BOFA',   country: 'US', flag: '🇺🇸' },
  { id: 'barclays',   name: 'Barclays Bank',          code: 'BARC',   country: 'GB', flag: '🇬🇧' },
  { id: 'hsbc',       name: 'HSBC',                   code: 'HSBC',   country: 'GB', flag: '🇬🇧' },
  { id: 'ubs',        name: 'UBS Switzerland',        code: 'UBS',    country: 'CH', flag: '🇨🇭' },
  { id: 'deutschebank', name: 'Deutsche Bank',        code: 'DB',     country: 'DE', flag: '🇩🇪' },
  { id: 'bnpparibas', name: 'BNP Paribas',           code: 'BNP',    country: 'FR', flag: '🇫🇷' },
  { id: 'citibank',   name: 'Citibank',               code: 'CITI',   country: 'US', flag: '🇺🇸' },
  { id: 'standardchartered', name: 'Standard Chartered', code: 'SCB', country: 'SG', flag: '🇸🇬' },
  { id: 'nedbank',    name: 'Nedbank',                code: 'NED',    country: 'ZA', flag: '🇿🇦' },
];

type TransferType = 'local' | 'international';
type Step = 'from' | 'to' | 'amount' | 'confirm' | 'otp' | 'success';

const STEP_ORDER: Step[] = ['from', 'to', 'amount', 'confirm', 'otp', 'success'];
const STEP_LABELS        = ['From', 'To', 'Amount', 'Review', 'Verify'];
const TRANSFER_FEE       = 1.50;
const INTL_FEE           = 15.00;
const OTP_LENGTH         = 6;
const DEMO_OTP           = '482916';

interface RecipientInfo {
  accountName:   string;
  accountNumber: string;
  bankId:        string;
  swiftCode:     string;
  routingNumber: string;
  bankCountry:   string;
}

export default function PaymentTransfer() {
  const [accounts,      setAccounts]      = useState<Account[]>([]);
  const [step,          setStep]          = useState<Step>('from');
  const [selectedFrom,  setSelectedFrom]  = useState<Account | null>(null);
  const [transferType,  setTransferType]  = useState<TransferType>('local');
  const [recipient,     setRecipient]     = useState<RecipientInfo>({
    accountName: '', accountNumber: '', bankId: '',
    swiftCode: '', routingNumber: '', bankCountry: '',
  });
  const [bankSearch,    setBankSearch]    = useState('');
  const [bankDropOpen,  setBankDropOpen]  = useState(false);
  const [amount,        setAmount]        = useState('');
  const [note,          setNote]          = useState('');
  const [transferSpeed, setTransferSpeed] = useState<'instant' | 'standard'>('instant');

  // OTP
  const [otpMethod,    setOtpMethod]    = useState<'sms' | 'email'>('sms');
  const [otpValues,    setOtpValues]    = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpSent,      setOtpSent]      = useState(false);
  const [otpError,     setOtpError]     = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer,  setResendTimer]  = useState(0);
  const otpRefs    = useRef<(HTMLInputElement | null)[]>([]);
  const bankRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredAccounts();
    setAccounts(stored);
    if (stored[0]) setSelectedFrom(stored[0]);
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Close bank dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankRef.current && !bankRef.current.contains(e.target as Node)) setBankDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stepIndex    = STEP_ORDER.indexOf(step);
  const parsedAmount = parseFloat(amount) || 0;
  const fee          = transferType === 'international' ? INTL_FEE : (transferSpeed === 'instant' ? TRANSFER_FEE : 0);
  const totalAmount  = parsedAmount + fee;

  const bankList     = transferType === 'local' ? LOCAL_BANKS : INTERNATIONAL_BANKS;
  const filteredBanks = bankList.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(bankSearch.toLowerCase())
  );
  const selectedBank = bankList.find(b => b.id === recipient.bankId);

  const amountError = useMemo(() => {
    if (!amount) return null;
    if (parsedAmount <= 0) return 'Enter an amount greater than $0.';
    if (parsedAmount > (selectedFrom?.currentBalance ?? 0))
      return `Insufficient funds. Available: ${formatAmount(selectedFrom?.currentBalance ?? 0)}`;
    return null;
  }, [amount, parsedAmount, selectedFrom]);

  const recipientValid = useMemo(() => {
    if (!recipient.accountName.trim())   return false;
    if (!recipient.accountNumber.trim()) return false;
    if (!recipient.bankId)               return false;
    if (transferType === 'international' && !recipient.swiftCode.trim()) return false;
    return true;
  }, [recipient, transferType]);

  const canContinue = useMemo(() => {
    if (step === 'from')    return !!selectedFrom;
    if (step === 'to')      return recipientValid;
    if (step === 'amount')  return !!amount && !amountError;
    if (step === 'confirm') return true;
    return false;
  }, [step, selectedFrom, recipientValid, amount, amountError]);

  const sendOtp = () => {
    setOtpSent(true);
    setOtpValues(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setResendTimer(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpInput = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpValues]; next[i] = value.slice(-1); setOtpValues(next);
    setOtpError('');
    if (value && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (p.length === OTP_LENGTH) { setOtpValues(p.split('')); otpRefs.current[OTP_LENGTH - 1]?.focus(); }
  };

  const verifyOtp = async () => {
    const entered = otpValues.join('');
    if (entered.length < OTP_LENGTH) { setOtpError('Please enter the complete 6-digit code.'); return; }
    setOtpVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    setOtpVerifying(false);
    if (entered !== DEMO_OTP) {
      setOtpError('Incorrect code. Please check and try again.');
      setOtpValues(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
      return;
    }
    executeTransfer();
    setStep('success');
  };

  const executeTransfer = () => {
    if (!selectedFrom || !recipient.bankId || !amount || accounts.length === 0) return;
    const parsed    = parseFloat(amount);
    const deduct    = parsed + fee;
    const reference = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const updatedAccounts = accounts.map(acc =>
      acc.id === selectedFrom.id
        ? { ...acc, currentBalance: (acc.currentBalance || 0) - deduct, availableBalance: Math.max(0, (acc.availableBalance || 0) - deduct) }
        : acc
    );
    setStoredAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    const newTransaction: Transaction = {
      id: reference, $id: reference,
      name: `${formatAmount(parsed)} transfer to ${recipient.accountName}${note ? ` - ${note}` : ''}`,
      paymentChannel: transferType === 'international' ? 'wire' : transferSpeed === 'instant' ? 'instant' : 'ach',
      type: 'withdrawal', accountId: selectedFrom.id, amount: -deduct,
      pending: false, category: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      image: '/icons/payment-transfer.svg',
      $createdAt: new Date().toISOString(),
      channel: 'transfer',
      senderBankId: selectedFrom.id, receiverBankId: recipient.bankId,
    };
    setStoredTransactions([newTransaction, ...getStoredTransactions()]);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (step === 'confirm') { setStep('otp'); return; }
    const next = STEP_ORDER[stepIndex + 1];
    if (next) setStep(next as Step);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('confirm'); setOtpSent(false);
      setOtpValues(Array(OTP_LENGTH).fill('')); setOtpError('');
      return;
    }
    const prev = STEP_ORDER[stepIndex - 1];
    if (prev) setStep(prev as Step);
  };

  const slide = {
    enter:  (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  const maskedPhone = '+233 ** *** **89';
  const maskedEmail = 'ac***@gcbbank.com';

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl transition-all text-sm text-gray-800 outline-none placeholder:text-gray-300 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100";

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/my-banks" className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>Transfer Funds</h1>
            <p className="text-gray-500 text-sm mt-0.5">Secure · Instant · Encrypted</p>
          </div>
        </motion.div>
        {step !== 'success' && (
          <Stepper steps={STEP_LABELS.map((label, i) => ({ id: STEP_ORDER[i], label }))} currentStep={step} color="#e6dc00" />
        )}

        <AnimatePresence mode="wait" custom={1}>

          {/* ── STEP 1: From ───────────────────────────────────────────────── */}
          {step === 'from' && (
            <motion.div key="from" custom={1} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">From account</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Select the account you&apos;re sending from</p>
                </div>
                <div className="space-y-3">
                  {accounts.map(account => (
                    <motion.button key={account.id} whileTap={{ scale: 0.99 }} onClick={() => setSelectedFrom(account)}
                      className="w-full p-4 border-2 rounded-xl text-left transition-all"
                      style={selectedFrom?.id === account.id ? { borderColor: '#e6dc00', backgroundColor: '#fffef0' } : { borderColor: '#f3f4f6' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow" style={{ backgroundColor: '#fff498' }}>
                            <CreditCard className="w-5 h-5" style={{ color: '#1a1a1a' }} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.mask} · {account.subtype ?? account.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{formatAmount(account.currentBalance ?? 0)}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Available</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <ActionButton onClick={handleContinue} disabled={!canContinue} label="Continue" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: To ─────────────────────────────────────────────────── */}
          {step === 'to' && (
            <motion.div key="to" custom={1} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recipient Details</h2>
                  <p className="text-sm text-gray-500 mt-0.5">From: <span className="font-semibold text-gray-700">{selectedFrom?.name}</span></p>
                </div>

                {/* Local / International toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
                  {(['local', 'international'] as TransferType[]).map(type => (
                    <button key={type} onClick={() => { setTransferType(type); setRecipient(r => ({ ...r, bankId: '', swiftCode: '', routingNumber: '' })); setBankSearch(''); }}
                      className="py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                      style={transferType === type ? { backgroundColor: '#fff', color: '#1a1a1a', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: '#9ca3af' }}>
                      {type === 'local' ? <MapPin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      {type === 'local' ? 'Local' : 'International'}
                    </button>
                  ))}
                </div>

                {transferType === 'international' && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Globe className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">International wire transfers incur a <strong>${INTL_FEE.toFixed(2)}</strong> fee and may take 2–5 business days.</p>
                  </div>
                )}

                {/* Account Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Holder Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="e.g. John Mensah" value={recipient.accountName}
                      onChange={e => setRecipient(r => ({ ...r, accountName: e.target.value }))}
                      className={inputCls + ' pl-9'} />
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder={transferType === 'local' ? '0123456789' : 'GB29 NWBK 6016 1331 9268 19'}
                      value={recipient.accountNumber}
                      onChange={e => setRecipient(r => ({ ...r, accountNumber: e.target.value.replace(/\s/g, '') }))}
                      className={inputCls + ' pl-9 font-mono tracking-wider'} />
                  </div>
                </div>

                {/* Bank selector dropdown */}
                <div className="space-y-1.5" ref={bankRef}>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {transferType === 'local' ? 'Recipient Bank' : 'Recipient Bank (International)'}
                  </label>
                  <div className="relative">
                    <button onClick={() => setBankDropOpen(o => !o)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm transition-all"
                      style={bankDropOpen ? { borderColor: '#e6dc00', boxShadow: '0 0 0 3px rgba(230,220,0,0.15)' } : {}}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {selectedBank ? (
                          <span className="font-semibold text-gray-800">
                            {'flag' in selectedBank && selectedBank.flag} {selectedBank.name}
                          </span>
                        ) : (
                          <span className="text-gray-300">Select a bank</span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" style={{ transform: bankDropOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                    </button>

                    <AnimatePresence>
                      {bankDropOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input type="text" placeholder="Search bank..." value={bankSearch}
                                onChange={e => setBankSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                              />
                            </div>
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {filteredBanks.length === 0 ? (
                              <p className="p-4 text-center text-xs text-gray-400">No banks found</p>
                            ) : filteredBanks.map(bank => (
                              <button key={bank.id} onClick={() => { setRecipient(r => ({ ...r, bankId: bank.id, bankCountry: bank.country })); setBankDropOpen(false); setBankSearch(''); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                style={recipient.bankId === bank.id ? { backgroundColor: '#fffef0' } : {}}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                                  {'flag' in bank ? bank.flag : bank.code.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{bank.name}</p>
                                  <p className="text-xs text-gray-400">{bank.code} · {bank.country}</p>
                                </div>
                                {recipient.bankId === bank.id && <span className="ml-auto text-green-500 text-xs font-bold">✓</span>}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* International-only fields */}
                {transferType === 'international' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">SWIFT / BIC Code <span className="text-red-400">*</span></label>
                      <input type="text" placeholder="e.g. BARCGB22" value={recipient.swiftCode}
                        onChange={e => setRecipient(r => ({ ...r, swiftCode: e.target.value.toUpperCase() }))}
                        className={inputCls + ' font-mono tracking-widest uppercase'} maxLength={11} />
                      <p className="text-[11px] text-gray-400">8 or 11 character SWIFT/BIC code of the recipient&apos;s bank</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Routing / Sort Code <span className="text-gray-300">(optional)</span></label>
                      <input type="text" placeholder="e.g. 026009593 or 20-00-00" value={recipient.routingNumber}
                        onChange={e => setRecipient(r => ({ ...r, routingNumber: e.target.value }))}
                        className={inputCls + ' font-mono'} />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t flex gap-3">
                  <BackButton onClick={handleBack} />
                  <ActionButton onClick={handleContinue} disabled={!canContinue} label="Continue" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Amount ─────────────────────────────────────────────── */}
          {step === 'amount' && (
            <motion.div key="amount" custom={1} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Enter amount</h2>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    {selectedFrom?.name} <ArrowRight className="w-3 h-3" /> {recipient.accountName}
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: transferType === 'international' ? '#dbeafe' : '#dcfce7', color: transferType === 'international' ? '#1d4ed8' : '#16a34a' }}>
                      {transferType === 'international' ? '🌐 Intl' : '📍 Local'}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 border rounded-xl transition-all text-2xl font-bold text-gray-900 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                      style={{ borderColor: amountError ? '#fca5a5' : '#e5e7eb', backgroundColor: amountError ? '#fff5f5' : '#fff' }}
                    />
                  </div>
                  {amountError
                    ? <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {amountError}</p>
                    : <p className="text-xs text-gray-400">Available: <span className="font-semibold text-gray-600">{formatAmount(selectedFrom?.currentBalance ?? 0)}</span></p>
                  }
                </div>

                {/* Speed (local only) */}
                {transferType === 'local' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Transfer Speed</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'instant',  label: 'Instant',  desc: 'Within seconds',    fee: `$${TRANSFER_FEE.toFixed(2)}`, icon: <Zap   className="w-4 h-4" /> },
                        { key: 'standard', label: 'Standard', desc: '1–3 business days', fee: 'Free', icon: <Clock className="w-4 h-4" /> },
                      ].map(opt => {
                        const sel = transferSpeed === opt.key;
                        return (
                          <button key={opt.key} onClick={() => setTransferSpeed(opt.key as 'instant' | 'standard')}
                            className="p-3 border-2 rounded-xl text-left transition-all"
                            style={sel ? { borderColor: '#e6dc00', backgroundColor: '#fffef0' } : { borderColor: '#f3f4f6' }}>
                            <div className="flex items-center gap-1.5 font-bold text-sm mb-1" style={{ color: '#1a1a1a' }}>{opt.icon}{opt.label}</div>
                            <p className="text-[11px] text-gray-500">{opt.desc}</p>
                            <p className="text-xs font-semibold mt-1" style={{ color: opt.fee === 'Free' ? '#16a34a' : '#374151' }}>{opt.fee}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {transferType === 'international' && (
                  <div className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                    <span className="text-xs font-semibold text-amber-700">International Wire Fee</span>
                    <span className="text-sm font-bold text-amber-800">${INTL_FEE.toFixed(2)}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Note (optional)</label>
                  <input type="text" placeholder="e.g. Rent payment, Investment transfer..." value={note} maxLength={80}
                    onChange={e => setNote(e.target.value)}
                    className={inputCls} />
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <BackButton onClick={handleBack} />
                  <ActionButton onClick={handleContinue} disabled={!canContinue} label="Review Transfer" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Confirm ────────────────────────────────────────────── */}
          {step === 'confirm' && (
            <motion.div key="confirm" custom={1} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900">Review Transfer</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Double-check before confirming</p>
                </div>
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#fffef0', border: '1px solid #e6dc00' }}>
                  <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: '#00000060' }}>Transfer Amount</p>
                  <p className="text-4xl font-bold" style={{ color: '#1a1a1a' }}>{formatAmount(parsedAmount)}</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'From',           value: `${selectedFrom?.name} · ${selectedFrom?.mask}` },
                    { label: 'To',             value: recipient.accountName },
                    { label: 'Account No.',    value: `****${recipient.accountNumber.slice(-4)}` },
                    { label: 'Bank',           value: selectedBank?.name ?? '' },
                    { label: 'Type',           value: transferType === 'international' ? 'International Wire' : 'Local Transfer' },
                    ...(transferType === 'international' && recipient.swiftCode ? [{ label: 'SWIFT', value: recipient.swiftCode }] : []),
                    ...(transferType === 'local' ? [{ label: 'Speed', value: transferSpeed === 'instant' ? 'Instant' : 'Standard (1–3 days)' }] : []),
                    { label: 'Fee',            value: fee > 0 ? formatAmount(fee) : 'Free' },
                    ...(note ? [{ label: 'Note', value: note }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2.5 px-4 bg-gray-50 rounded-xl">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-800 max-w-[60%] text-right truncate">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2.5 px-4 rounded-xl" style={{ backgroundColor: '#fffef0', border: '1px solid #e6dc00' }}>
                    <span className="text-xs font-bold uppercase tracking-wide">Total Deducted</span>
                    <span className="text-sm font-bold">{formatAmount(totalAmount)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">You will be asked to verify this transfer with a one-time password (OTP) sent to your registered phone or email.</p>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <BackButton onClick={handleBack} label="Edit" />
                  <ActionButton onClick={handleContinue} label="Proceed to Verify" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: OTP ────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <motion.div key="otp" custom={1} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: '#fff498' }}>
                    <Lock className="w-7 h-7" style={{ color: '#1a1a1a' }} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Verify Your Transfer</h2>
                  <p className="text-sm text-gray-500">For your security, please verify this transaction</p>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl" style={{ backgroundColor: '#f5f6fa' }}>
                  <span className="text-sm font-bold text-gray-900">{formatAmount(parsedAmount)}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">{recipient.accountName}</span>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-700 text-center">Choose how to receive your OTP</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'sms',   label: 'SMS',   desc: maskedPhone, icon: <Smartphone className="w-5 h-5" /> },
                        { key: 'email', label: 'Email', desc: maskedEmail, icon: <Mail className="w-5 h-5" /> },
                      ].map(opt => {
                        const sel = otpMethod === opt.key;
                        return (
                          <button key={opt.key} onClick={() => setOtpMethod(opt.key as 'sms' | 'email')}
                            className="p-4 border-2 rounded-xl text-center transition-all space-y-2"
                            style={sel ? { borderColor: '#e6dc00', backgroundColor: '#fffef0' } : { borderColor: '#f3f4f6' }}>
                            <div className="flex justify-center" style={{ color: sel ? '#b8a800' : '#9ca3af' }}>{opt.icon}</div>
                            <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                            <p className="text-[11px] text-gray-500 break-all">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    <ActionButton onClick={sendOtp} label={`Send OTP via ${otpMethod === 'sms' ? 'SMS' : 'Email'}`} />
                    <p className="text-center text-[11px] text-gray-400">
                      Demo mode — OTP is{' '}
                      <span className="font-bold tracking-widest text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{DEMO_OTP}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600">
                        Code sent to your {otpMethod === 'sms' ? 'phone' : 'email'}{' '}
                        <span className="font-semibold text-gray-900">{otpMethod === 'sms' ? maskedPhone : maskedEmail}</span>
                      </p>
                      <p className="text-xs text-gray-400">Enter the 6-digit code below. Valid for 5 minutes.</p>
                    </div>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otpValues.map((val, i) => (
                        <input key={i} ref={el => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={val}
                          onChange={e => handleOtpInput(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
                          style={{ borderColor: otpError ? '#fca5a5' : val ? '#e6dc00' : '#e5e7eb', backgroundColor: otpError ? '#fff5f5' : val ? '#fffef0' : '#fff', color: '#1a1a1a' }}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {otpError}
                      </motion.p>
                    )}
                    <div className="text-center">
                      {resendTimer > 0
                        ? <p className="text-xs text-gray-400">Resend in <span className="font-semibold text-gray-600">{resendTimer}s</span></p>
                        : <button onClick={sendOtp} className="text-xs font-semibold flex items-center gap-1 mx-auto hover:opacity-70 transition-opacity" style={{ color: '#b8a800' }}>
                            <RefreshCw className="w-3 h-3" /> Resend OTP
                          </button>
                      }
                    </div>
                    <div className="flex gap-3 pt-2">
                      <BackButton onClick={handleBack} />
                      <motion.button whileTap={{ scale: 0.97 }} onClick={verifyOtp}
                        disabled={otpVerifying || otpValues.join('').length < OTP_LENGTH}
                        className="flex-1 py-3 px-5 font-semibold rounded-xl shadow-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                        {otpVerifying ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</> : <><Shield className="w-4 h-4" /> Verify & Transfer</>}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 6: Success ────────────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-10 text-center" style={{ backgroundColor: '#fff498' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}>
                    <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#1a1a1a' }} strokeWidth={1.5} />
                  </motion.div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>Transfer Complete!</h2>
                  <p className="mt-1 text-sm" style={{ color: '#1a1a1a80' }}>Your funds are on their way</p>
                </div>
                <div className="p-6 space-y-3">
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#fffef0', border: '1px solid #e6dc00' }}>
                    <p className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>{formatAmount(parsedAmount)}</p>
                    <p className="text-xs text-gray-400 mt-1">sent to {recipient.accountName}</p>
                  </div>
                  {[
                    { label: 'From',        value: `${selectedFrom?.name} · ${selectedFrom?.mask}` },
                    { label: 'To',          value: `${recipient.accountName} · ****${recipient.accountNumber.slice(-4)}` },
                    { label: 'Bank',        value: selectedBank?.name ?? '' },
                    { label: 'Type',        value: transferType === 'international' ? '🌐 International Wire' : '📍 Local Transfer' },
                    { label: 'Verified',    value: `✓ OTP via ${otpMethod === 'sms' ? 'SMS' : 'Email'}` },
                    { label: 'Reference',   value: `TXN-${Date.now().toString(36).toUpperCase()}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-400 font-medium">{row.label}</span>
                      <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%] truncate">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6 space-y-2">
                  <Link href="/transaction-history" className="block w-full py-3 px-5 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors text-center">
                    View in Transaction History
                  </Link>
                  <Link href="/" className="block w-full py-3 px-5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all text-center" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}