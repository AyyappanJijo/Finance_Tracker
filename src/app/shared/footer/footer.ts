import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <span>© 2026 <strong>FinTrack</strong></span>
      <span class="dot">·</span>
      <span>Built by <strong>Ayyappan</strong></span>
      <span class="dot">·</span>
      <span>Track smarter. Spend wiser.</span>
    </footer>
  `,
  styles: [`
    .footer {
      text-align: center;
      padding: 24px;
      margin-top: 60px;
      background: rgba(255,255,255,0.03);
      border-top: 1px solid rgba(255,255,255,0.07);
      color: rgba(240,244,255,0.4);
      font-size: 13px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    strong { color: rgba(240,244,255,0.75); }
    .dot { opacity: 0.3; }
  `]
})
export class Footer {}
