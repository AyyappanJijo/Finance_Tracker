import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  isOpen = false;
  balance = 0;
  username = 'Ayyappan'; // you can change dynamically later

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.calculateBalance();
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  calculateBalance() {
    const data = this.service.getTransactions();

    const income = data.filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expense = data.filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    this.balance = income - expense;
  }
}