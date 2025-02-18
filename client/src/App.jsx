'use client';

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [status, setStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedPublicKey = localStorage.getItem('publicKey');
    if (token && savedPublicKey) {
      setIsLoggedIn(true);
      setPublicKey(savedPublicKey);
      fetchBalance(savedPublicKey);
    }
  }, []);

  const fetchBalance = async (pubKey) => {
    try {
      const balance = await connection.getBalance(new PublicKey(pubKey));
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('publicKey', data.publicKey);
      setPublicKey(data.publicKey);
      setIsLoggedIn(true);
      setStatus('Signup successful! Wallet created.');
      fetchBalance(data.publicKey);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('publicKey', data.publicKey);
      setPublicKey(data.publicKey);
      setIsLoggedIn(true);
      setStatus('Login successful!');
      fetchBalance(data.publicKey);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('publicKey');
    setIsLoggedIn(false);
    setPublicKey('');
    setStatus('');
    setBalance(0);
  };

  const handleSendTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!amount || !recipientAddress) {
        throw new Error('Please enter amount and recipient address');
      }

      // Validate recipient address
      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch (error) {
        throw new Error('Invalid recipient address');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: recipientPubkey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publicKey);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/txn/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: Array.from(serializedTransaction)
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setStatus('Transaction successful!');
      setAmount('');
      setRecipientAddress('');
      // Refresh balance after transaction
      fetchBalance(publicKey);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Solana Wallet</h1>
        
        {!isLoggedIn ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Sign Up
              </button>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm font-medium">Public Key:</p>
              <p className="text-xs break-all">{publicKey}</p>
            </div>
            
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm font-medium">Balance:</p>
              <p className="text-lg font-bold">{balance.toFixed(4)} SOL</p>
            </div>

            <form onSubmit={handleSendTransaction} className="space-y-4">
              <input
                type="number"
                placeholder="Amount (SOL)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000000001"
                min="0"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Send SOL
              </button>
            </form>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}

        {status && (
          <div className={`mt-4 p-3 rounded ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-center text-gray-500">
            Processing...
          </div>
        )}
      </div>
    </div>
  );
}