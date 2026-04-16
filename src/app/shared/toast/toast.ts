import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of (toastService.toasts | async)"
        class="toast toast-{{ t.type }}"
        (click)="toastService.remove(t.id)"
      >
        <span class="toast-icon">{{ icons[t.type] }}</span>
        <span>{{ t.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(20px);
      cursor: pointer;
      animation: slideToast 0.3s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      max-width: 320px;
    }
    @keyframes slideToast {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .toast-success { background: rgba(0,229,160,0.2);  border: 1px solid rgba(0,229,160,0.4);  color: #00e5a0; }
    .toast-error   { background: rgba(255,94,125,0.2); border: 1px solid rgba(255,94,125,0.4); color: #ff5e7d; }
    .toast-warning { background: rgba(251,191,36,0.2); border: 1px solid rgba(251,191,36,0.4); color: #fbbf24; }
    .toast-info    { background: rgba(79,142,247,0.2); border: 1px solid rgba(79,142,247,0.4); color: #4f8ef7; }
    .toast-icon { font-size: 18px; }
  `]
})
export class ToastComponent {
  icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  constructor(public toastService: ToastService) {}
}
