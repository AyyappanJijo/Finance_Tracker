import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';
import { CATEGORIES, CATEGORY_META, Budget } from '../../models/transaction.model';

interface BudgetItem {
  category: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  percent: number;
  status: 'safe' | 'caution' | 'danger';
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css'
})
export class BudgetComponent implements OnInit {

  budgetItems: BudgetItem[] = [];
  categories = CATEGORIES;
  categoryMeta = CATEGORY_META;
  editLimits: Record<string, number> = {};

  constructor(
    private service: TransactionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const budgets  = this.service.getBudgets();
    const txData   = this.service.getTransactions();
    const expenses = txData.filter(t => t.type === 'expense');

    const spentMap: Record<string, number> = {};
    expenses.forEach(t => {
      spentMap[t.category] = (spentMap[t.category] || 0) + t.amount;
    });

    const limitMap: Record<string, number> = {};
    budgets.forEach(b => limitMap[b.category] = b.limit);

    this.budgetItems = this.categories.map(cat => {
      const limit   = limitMap[cat] ?? 0;
      const spent   = spentMap[cat] ?? 0;
      const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
      const meta    = this.categoryMeta[cat];
      return {
        category: cat,
        icon: meta.icon,
        color: meta.color,
        limit, spent, percent,
        status: percent >= 90 ? 'danger' : percent >= 70 ? 'caution' : 'safe'
      };
    });

    this.categories.forEach(c => {
      this.editLimits[c] = limitMap[c] ?? 0;
    });
  }

  saveBudgets() {
    const budgets: Budget[] = this.categories
      .filter(c => this.editLimits[c] > 0)
      .map(c => ({ category: c, limit: this.editLimits[c] }));
    this.service.saveBudgets(budgets);
    this.toast.success('Budget goals saved!');
    this.ngOnInit(); // re-compute
  }

  getStatusLabel(item: BudgetItem): string {
    if (item.limit === 0) return 'No limit set';
    if (item.status === 'danger')  return `⚠️ Over ${item.percent}% spent!`;
    if (item.status === 'caution') return `🔶 ${item.percent}% used`;
    return `✅ ${item.percent}% used`;
  }
}
