import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Transaction, Budget } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  private txKey     = 'fintrack_transactions';
  private budgetKey = 'fintrack_budgets';
  private platformId = inject(PLATFORM_ID);

  private transactions$ = new BehaviorSubject<Transaction[]>(this.loadTx());
  private budgets$      = new BehaviorSubject<Budget[]>(this.loadBudgets());

  private isBrowser = () => isPlatformBrowser(this.platformId);

  // ── Transactions ─────────────────────────────────────

  private loadTx(): Transaction[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(this.txKey);
      return raw ? JSON.parse(raw) : this.seedData();
    } catch { return []; }
  }

  /** Seed sample data on first run so the app looks populated */
  private seedData(): Transaction[] {
    const samples: Transaction[] = [
      { id: 1, title: 'Monthly Salary',  amount: 75000, type: 'income',  category: 'Salary',   date: '2026-04-01' },
      { id: 2, title: 'Freelance Work',  amount: 15000, type: 'income',  category: 'Salary',   date: '2026-04-05' },
      { id: 3, title: 'Rent Payment',    amount: 18000, type: 'expense', category: 'Bills',    date: '2026-04-02' },
      { id: 4, title: 'Grocery Run',     amount: 3200,  type: 'expense', category: 'Food',     date: '2026-04-07' },
      { id: 5, title: 'Flight Tickets',  amount: 8500,  type: 'expense', category: 'Travel',   date: '2026-04-10' },
      { id: 6, title: 'Online Course',   amount: 2999,  type: 'expense', category: 'Education',date: '2026-04-11' },
      { id: 7, title: 'Restaurant',      amount: 1200,  type: 'expense', category: 'Food',     date: '2026-04-12' },
      { id: 8, title: 'Amazon Order',    amount: 4500,  type: 'expense', category: 'Shopping', date: '2026-04-14' }
    ];
    this.saveTxRaw(samples);
    return samples;
  }

  private saveTxRaw(data: Transaction[]) {
    if (this.isBrowser()) localStorage.setItem(this.txKey, JSON.stringify(data));
  }

  private saveTx(data: Transaction[]) {
    this.saveTxRaw(data);
    this.transactions$.next(data);
  }

  getTransactionsStream() { return this.transactions$.asObservable(); }
  getTransactions()       { return this.transactions$.value; }

  addTransaction(tx: Transaction)     { this.saveTx([...this.transactions$.value, tx]); }
  deleteTransaction(id: number)       { this.saveTx(this.transactions$.value.filter(t => t.id !== id)); }
  updateTransaction(updated: Transaction) {
    this.saveTx(this.transactions$.value.map(t => t.id === updated.id ? updated : t));
  }

  // ── Budgets ───────────────────────────────────────────

  private loadBudgets(): Budget[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(this.budgetKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  getBudgetsStream() { return this.budgets$.asObservable(); }
  getBudgets()       { return this.budgets$.value; }

  saveBudgets(budgets: Budget[]) {
    if (this.isBrowser()) localStorage.setItem(this.budgetKey, JSON.stringify(budgets));
    this.budgets$.next(budgets);
  }

  // ── Helpers ───────────────────────────────────────────

  getTotals(data = this.getTransactions()) {
    const income  = data.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }
}

