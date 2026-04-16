import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { id: number; message: string; type: 'success' | 'error' | 'warning' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts = this.toasts$.asObservable();

  show(message: string, type: Toast['type'] = 'info') {
    const id = Date.now();
    const current = this.toasts$.value;
    this.toasts$.next([...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  remove(id: number) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  warning(msg: string) { this.show(msg, 'warning'); }
}
