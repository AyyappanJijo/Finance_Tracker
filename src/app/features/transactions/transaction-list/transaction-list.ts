import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
})
export class TransactionList implements OnInit {

  transactions: any[] = [];

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.transactions = this.service.getTransactions();
  }

  delete(id: number) {
    this.service.deleteTransaction(id);
    this.load();
  }
}