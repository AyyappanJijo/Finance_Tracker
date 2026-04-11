import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private storageKey = 'transactions';
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getTransactions(): Transaction[] {
    if (!this.isBrowser()) return []; // ✅ FIX SSR

    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addTransaction(transaction: Transaction) {
    if (!this.isBrowser()) return;

    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.storageKey, JSON.stringify(transactions));
  }

  deleteTransaction(id: number) {
    if (!this.isBrowser()) return;

    const updated = this.getTransactions().filter(t => t.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }
}