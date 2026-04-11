import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { TransactionService } from '../../../services/transaction.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements AfterViewInit {

  fromDate: string = '';
  toDate: string = '';

  insight = '';
  topCategory = '';

  data: any[] = [];

  constructor(private service: TransactionService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.data = this.service.getTransactions();
      this.process(this.data);
    });
  }

  applyFilter() {
    let filtered = this.data;

    if (this.fromDate && this.toDate) {
      filtered = this.data.filter(t =>
        new Date(t.date) >= new Date(this.fromDate) &&
        new Date(t.date) <= new Date(this.toDate)
      );
    }

    this.process(filtered);
  }

  process(data: any[]) {
    this.generateInsights(data);
    this.createDoughnut(data);
    this.createBar(data);
    this.createLine(data);
  }

  // 🧠 INSIGHTS
  generateInsights(data: any[]) {
    const totalExpense = data
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const lastMonth = new Date().getMonth() - 1;

    const prevExpense = data
      .filter(t =>
        new Date(t.date).getMonth() === lastMonth &&
        t.type === 'expense'
      )
      .reduce((s, t) => s + t.amount, 0);

    if (prevExpense > 0) {
      const diff = ((totalExpense - prevExpense) / prevExpense) * 100;

      this.insight =
        diff > 0
          ? `⚠️ Spending increased by ${diff.toFixed(1)}%`
          : `✅ Spending decreased by ${Math.abs(diff).toFixed(1)}%`;
    } else {
      this.insight = "No previous month data available";
    }

    // 🎯 Top Category
    const categories: any = {};

    data.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] =
          (categories[t.category] || 0) + t.amount;
      }
    });

    this.topCategory = Object.keys(categories).reduce((a, b) =>
      categories[a] > categories[b] ? a : b,
      ''
    );
  }

  // 📊 CHARTS

  createDoughnut(data: any[]) {
    const income = data.filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expense = data.filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    new Chart('doughnutChart', {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{ data: [income, expense] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  createBar(data: any[]) {
    const categories: any = {};

    data.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] =
          (categories[t.category] || 0) + t.amount;
      }
    });

    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{ data: Object.values(categories) }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  createLine(data: any[]) {
    const sorted = data.sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: sorted.map(t => t.date),
        datasets: [{ data: sorted.map(t => t.amount) }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}