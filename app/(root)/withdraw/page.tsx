'use client';

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Shield, CreditCard, RefreshCw, CheckCircle } from "lucide-react";
import { getStoredAccounts } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Stepper } from "@/components/shared/Stepper";
import { ActionButton } from "@/components/shared/ActionButton";
import { BackButton } from "@/components/shared/BackButton";
import { SummaryRow } from "@/components/shared/SummaryRow";

const WITHDRAWAL_FEES = 2.50;
const MAX_WITHDRAWAL = 50000;
const OTP_DEMO_CODE = "123456";

interface WithdrawalAccount {
  id: string;
  name: string;
  mask: string;
  currentBalance: number;
  type: string;
}

export default function WithdrawPage() {
  const [step, setStep] = useState<"account" | "amount" | "confirm" | "otp" | "success">("account");
  const [selectedAccount, setSelectedAccount] = useState<WithdrawalAccount | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [accounts, setAccounts] = useState<WithdrawalAccount[] | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setAccounts(getStoredAccounts() as WithdrawalAccount[]);
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const total = parsedAmount + WITHDRAWAL_FEES;

  const steps = [
    { id: "account", label: "Account" },
    { id: "amount", label: "Amount" },
    { id: "confirm", label: "Review" },
    { id: "otp", label: "Verify" },
  ];

  const stepIndex = steps.findIndex(s => s.id === step);
  const otpValue = otp.join("");

  const canContinue =
    step === "account" ? !!selectedAccount :
    step === "amount" ? parsedAmount > 0 && parsedAmount <= MAX_WITHDRAWAL && parsedAmount <= (selectedAccount?.currentBalance || 0) :
    step === "confirm" ? true :
    step === "otp" ? otpValue.length === 6 : false;

  const sendOtp = () => {
    setOtpSent(true);
    setOtp(["", "", "", "", "", ""]);
    setOtpError(false);
    setLoading(false);
    setStep("otp");
  };

  const verifyOtp = () => {
    if (otpValue === OTP_DEMO_CODE) {
      setStep("success");
    } else {
      setOtpError(true);
    }
  };

  const resetFlow = () => {
    setStep("account");
    setSelectedAccount(null);
    setAmount("");
    setNote("");
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setOtpError(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  if (!accounts) {
    return null;
  }

  const stepsContent = {
    account: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Select account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <motion.button
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={cn(
                "relative group p-6 border-2 rounded-2xl hover:shadow-xl transition-all",
                selectedAccount?.id === account.id
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-yellow-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 text-lg">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.mask}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${account.currentBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    ),
    amount: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Enter amount</h2>
          <p className="text-sm text-gray-500">Max withdrawal: ${MAX_WITHDRAWAL.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span>Available: ${selectedAccount?.currentBalance?.toLocaleString()}</span>
            <span>Fee: ${WITHDRAWAL_FEES}</span>
          </div>
          <div className="relative mb-4">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-6 text-3xl font-bold text-gray-900 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-100 transition-all"
              max={MAX_WITHDRAWAL}
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full p-4 border border-gray-200 rounded-2xl focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-100 transition-all"
          maxLength={100}
        />
      </div>
    ),
    confirm: (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Review withdrawal</h2>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
          <SummaryRow label="From account" value={`${selectedAccount?.name} ${selectedAccount?.mask}`} />
          <SummaryRow label="Amount" value={`$${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
          <SummaryRow label="Fee" value={`$${WITHDRAWAL_FEES.toFixed(2)}`} />
          {note && <SummaryRow label="Note" value={note} />}
          <SummaryRow label="Total" value={`$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} highlight />
        </div>
      </div>
    ),
    otp: (
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-3xl flex items-center justify-center">
          <Shield className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify withdrawal</h2>
        <p className="text-sm text-gray-600">Enter the 6-digit code sent to your phone</p>
        <div className="flex gap-3 justify-center p-4 bg-gray-50 rounded-2xl">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className={cn(
                "w-12 h-16 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:ring-4 transition-all",
                otpError
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-yellow-400 focus:ring-yellow-100"
              )}
            />
          ))}
        </div>
        {otpError && (
          <p className="text-sm text-red-600 font-medium">Invalid code. Please try again.</p>
        )}
        {otpSent && (
          <div className="text-xs text-gray-500">
            Didn&apos;t receive?{" "}
            <button
              className="font-semibold text-yellow-600 hover:underline"
              onClick={() => { setOtp(["", "", "", "", "", ""]); setOtpError(false); }}
            >
              Resend
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 bg-yellow-50 p-3 rounded-xl">
          Demo OTP: <strong>123456</strong>
        </p>
      </div>
    ),
    success: (
      <div className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-28 h-28 mx-auto bg-green-100 rounded-3xl flex items-center justify-center"
        >
          <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900">Withdrawal Complete!</h2>
        <div className="bg-green-50 p-6 rounded-3xl">
          <p className="text-xl font-bold text-gray-900 mb-2">${parsedAmount.toLocaleString()}</p>
          <p className="text-sm text-green-800">Successfully withdrawn</p>
        </div>
        <div className="space-y-3 pt-6">
          <a
            href="/transaction-history"
            className="block w-full bg-primary text-primary-foreground py-4 px-6 rounded-2xl font-semibold text-center hover:bg-primary/90 transition-all btn-focus"
          >
            View Transaction
          </a>
          <button
            onClick={resetFlow}
            className="w-full bg-brand text-brand-text py-4 px-6 rounded-2xl font-semibold text-center hover:shadow-xl transition-all btn-focus"
          >
            New Withdrawal
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button className="p-2 -ml-2 rounded-xl hover:bg-white shadow-sm">
            <DollarSign className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="text-gray-600">Cash out to your bank account</p>
          </div>
        </motion.div>

        {/* Step indicator */}
        <Stepper steps={steps} currentStep={step} color="#e6dc00" />

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-2xl rounded-3xl p-8 overflow-hidden"
        >
          {stepsContent[step]}
        </motion.div>

        {/* Bottom navigation */}
        {step !== "success" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-3 bg-white p-6 rounded-3xl shadow-xl border"
          >
            {stepIndex > 0 ? (
              <BackButton onClick={() => {
                const prevId = steps[stepIndex - 1]?.id as "account" | "amount" | "confirm" | "otp";
                if (prevId) setStep(prevId);
              }} />
            ) : (
              <button
                onClick={resetFlow}
                className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all btn-focus"
              >
                Reset
              </button>
            )}
            <ActionButton
              onClick={() => {
                if (step === "otp") {
                  verifyOtp();
                } else if (step === "confirm") {
                  setLoading(true);
                  setTimeout(sendOtp, 600);
                } else if (canContinue) {
                  const nextId = steps[stepIndex + 1]?.id as "account" | "amount" | "confirm" | "otp" | "success" | undefined;
                  if (nextId) setStep(nextId);
                }
              }}
              disabled={!canContinue || loading}
              label={
                loading ? "Sending..." :
                step === "otp" ? "Confirm Withdrawal" :
                step === "confirm" ? "Send OTP" :
                "Continue"
              }
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}