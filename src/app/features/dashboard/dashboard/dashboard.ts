
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, CATEGORY_META } from '../../../models/transaction.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  income    = 0;
  expense   = 0;
  balance   = 0;
  savings   = 0;
  recent: Transaction[] = [];
  insight   = '';
  insightType = 'info';
  loading   = true;
  categoryMeta = CATEGORY_META;

  private sub!: Subscription;

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.sub = this.service.getTransactionsStream().subscribe(data => {
      this.process(data);
      this.loading = false;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  process(data: Transaction[]) {
    const totals = this.service.getTotals(data);
    this.income  = totals.income;
    this.expense = totals.expense;
    this.balance = totals.balance;
    this.savings = totals.income > 0
      ? Math.round((totals.balance / totals.income) * 100)
      : 0;

    this.recent = [...data].sort((a, b) => b.id - a.id).slice(0, 5);

    if (data.length === 0) {
      this.insight = "👋 Welcome! Add your first transaction to get started.";
      this.insightType = 'info';
    } else if (this.expense > this.income) {
      this.insight = "⚠️ You're spending more than you earn this month. Review your expenses.";
      this.insightType = 'warning';
    } else if (this.savings >= 30) {
      this.insight = "🏆 Excellent! You're saving " + this.savings + "% of your income. Keep it up!";
      this.insightType = 'success';
    } else if (this.savings >= 10) {
      this.insight = "✅ Good going! You're saving " + this.savings + "% of income.";
      this.insightType = 'success';
    } else {
      this.insight = "💡 Try to save at least 20% of your income for financial security.";
      this.insightType = 'tip';
    }
  }

  getCategoryIcon(category: string): string {
    return this.categoryMeta[category]?.icon ?? '📦';
  }

  getCategoryColor(category: string): string {
    return this.categoryMeta[category]?.color ?? '#94a3b8';
  }

  getExpensePercent(): number {
    if (this.income === 0) return 0;
    return Math.min(Math.round((this.expense / this.income) * 100), 100);
  }
}
