import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',

  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Dashboard implements OnInit {

  income = 0;
  expense = 0;
  balance = 0;
  recent: any[] = [];
  insight = '';

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const data = this.service.getTransactions();

    this.income = data.filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    this.expense = data.filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    this.balance = this.income - this.expense;

    this.recent = data.slice(-3).reverse();

    if (this.expense > this.income) {
      this.insight = "⚠️ You're spending more than you earn!";
    } else if (this.balance > 0) {
      this.insight = "✅ Good job! You're saving money.";
    } else {
      this.insight = "💡 Start tracking your expenses regularly.";
    }
  }
}