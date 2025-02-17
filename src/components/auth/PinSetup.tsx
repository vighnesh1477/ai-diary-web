'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';

export function PinSetup({ onComplete }: { onComplete: () => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handlePinChange = (index: number, value: string, isConfirm: boolean) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value;

    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }

    // Auto-focus next input
    if (value && index < 3) {
      const inputs = document.getElementsByClassName('pin-input');
      const nextInput = inputs[isConfirm ? index + 5 : index + 1] as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = async () => {
    if (step === 'create') {
      if (pin.some(digit => !digit)) {
        setError('Please enter all digits');
        return;
      }
      setStep('confirm');
      return;
    }

    if (confirmPin.join('') !== pin.join('')) {
      setError('PINs do not match');
      setConfirmPin(['', '', '', '']);
      return;
    }

    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          pin: pin.join(''),
          pinCreatedAt: new Date(),
        }, { merge: true });
        onComplete();
      }
    } catch (error) {
      console.error('Error saving PIN:', error);
      setError('Failed to save PIN');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {step === 'create' 
            ? 'Choose a 4-digit PIN for additional security'
            : 'Please enter your PIN again to confirm'
          }
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          {(step === 'create' ? pin : confirmPin).map((digit, index) => (
            <input
              key={`${step}-${index}`}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value, step === 'confirm')}
              className="pin-input w-12 h-12 text-center text-2xl border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          {step === 'create' ? 'Continue' : 'Set PIN'}
        </button>
      </div>
    </div>
  );
}
