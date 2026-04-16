import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../../../services/toast.service';
import { Transaction, CATEGORY_META, CATEGORIES } from '../../../models/transaction.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})
export class TransactionList implements OnInit, OnDestroy {

  all: Transaction[]      = [];
  filtered: Transaction[] = [];
  categories = ['All', ...CATEGORIES];
  categoryMeta = CATEGORY_META;

  searchQuery  = '';
  filterType   = 'all';
  filterCat    = 'All';
  sortBy       = 'date-desc';

  deleteConfirmId: number | null = null;

  private sub!: Subscription;

  constructor(
    private service: TransactionService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = this.service.getTransactionsStream().subscribe(data => {
      this.all = data;
      this.applyFilters();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  applyFilters() {
    let result = [...this.all];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (this.filterType !== 'all') {
      result = result.filter(t => t.type === this.filterType);
    }

    if (this.filterCat !== 'All') {
      result = result.filter(t => t.category === this.filterCat);
    }

    switch (this.sortBy) {
      case 'date-desc': result.sort((a, b) => b.id - a.id); break;
      case 'date-asc':  result.sort((a, b) => a.id - b.id); break;
      case 'amount-desc': result.sort((a, b) => b.amount - a.amount); break;
      case 'amount-asc':  result.sort((a, b) => a.amount - b.amount); break;
    }

    this.filtered = result;
  }

  confirmDelete(id: number)  { this.deleteConfirmId = id; }
  cancelDelete()             { this.deleteConfirmId = null; }

  doDelete(id: number) {
    this.service.deleteTransaction(id);
    this.toast.success('Transaction deleted.');
    this.deleteConfirmId = null;
  }

  edit(id: number) {
    this.router.navigate(['/app/add'], { queryParams: { id } });
  }

  exportCSV() {
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Note'];
    const rows = this.filtered.map(t =>
      [t.title, t.amount, t.type, t.category, t.date, t.note ?? '']
        .map(v => `"${v}"`).join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'fintrack_transactions.csv'; a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Exported to CSV!');
  }

  getTotal(type: 'income' | 'expense') {
    return this.filtered.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
  }

  getCategoryIcon(cat: string)  { return this.categoryMeta[cat]?.icon  ?? '📦'; }
  getCategoryColor(cat: string) { return this.categoryMeta[cat]?.color ?? '#94a3b8'; }
  trackById(_: number, t: Transaction) { return t.id; }
}

