import { Component, OnInit, HostListener } from '@angular/core';
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
  isOpen   = false;
  balance  = 0;
  scrolled = false;

  navLinks = [
    { path: '/app/dashboard',    label: 'Dashboard',    icon: '📊' },
    { path: '/app/add',          label: 'Add',          icon: '➕' },
    { path: '/app/transactions', label: 'Transactions', icon: '💳' },
    { path: '/app/reports',      label: 'Reports',      icon: '📈' },
    { path: '/app/budget',       label: 'Budget',       icon: '🎯' }
  ];

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.service.getTransactionsStream().subscribe(data => {
      const { balance } = this.service.getTotals(data);
      this.balance = balance;
    });
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }

  toggleMenu() { this.isOpen = !this.isOpen; }
  closeMenu()  { this.isOpen = false; }
}
