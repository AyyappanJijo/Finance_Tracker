import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

const CHART_DEFAULTS = {
  color: 'rgba(240,244,255,0.6)',
  gridColor: 'rgba(255,255,255,0.06)',
  font: { family: 'Outfit', size: 12 }
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit, OnDestroy {

  charts: Chart[] = [];
  insight      = '';
  topCategory  = 'N/A';
  savingsRate  = 0;
  hasData      = false;
  private sub!: Subscription;

  constructor(private service: TransactionService) {}

  ngOnInit() {
    this.sub = this.service.getTransactionsStream().subscribe(data => {
      this.hasData = data.length > 0;
      if (!this.hasData) { this.destroyCharts(); return; }
      this.generateInsights(data);
      setTimeout(() => this.renderCharts(data), 100);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.destroyCharts();
  }

  destroyCharts() { this.charts.forEach(c => c.destroy()); this.charts = []; }

  generateInsights(data: Transaction[]) {
    const { income, expense, balance } = this.service.getTotals(data);
    this.savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    this.insight     = expense > income
      ? '⚠️ Spending exceeds income — review your expenses!'
      : `✅ You're saving ${this.savingsRate}% of your income.`;

    const catTotals: Record<string, number> = {};
    data.filter(t => t.type === 'expense').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    this.topCategory = Object.keys(catTotals).length
      ? Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';
  }

  renderCharts(data: Transaction[]) {
    this.destroyCharts();
    this.createDoughnut(data);
    this.createBar(data);
    this.createLine(data);
  }

  createDoughnut(data: Transaction[]) {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (!ctx) return;
    const { income, expense } = this.service.getTotals(data);
    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['rgba(0,229,160,0.8)', 'rgba(255,94,125,0.8)'],
          borderColor: ['#00e5a0', '#ff5e7d'],
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, padding: 16 } }
        },
        cutout: '65%'
      }
    }));
  }

  createBar(data: Transaction[]) {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;
    const cats: Record<string, number> = {};
    data.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const colors = ['#4f8ef7','#a855f7','#f97316','#ef4444','#22c55e','#06b6d4','#fbbf24','#94a3b8'];
    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          label: 'Expense by Category',
          data: Object.values(cats) as number[],
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } },
          y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
        }
      }
    }));
  }

  createLine(data: Transaction[]) {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!ctx) return;
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    const balanceOverTime = sorted.map(t => {
      running += t.type === 'income' ? t.amount : -t.amount;
      return { date: t.date, balance: running };
    });
    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: balanceOverTime.map(d => d.date),
        datasets: [{
          label: 'Running Balance',
          data: balanceOverTime.map(d => d.balance),
          borderColor: '#4f8ef7',
          backgroundColor: 'rgba(79,142,247,0.12)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4f8ef7',
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } } },
        scales: {
          x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } },
          y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
        }
      }
    }));
  }
}
