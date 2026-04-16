import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../../../services/toast.service';
import { CATEGORIES, CATEGORY_META } from '../../../models/transaction.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css'
})
export class AddTransaction implements OnInit {

  form!: FormGroup;
  editMode = false;
  editId!: number;
  previewBalance = 0;
  categories = CATEGORIES;
  categoryMeta = CATEGORY_META;

  constructor(
    private fb: FormBuilder,
    private service: TransactionService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.editId   = +params['id'];
        const tx = this.service.getTransactions().find(t => t.id === this.editId);
        if (tx) this.form.patchValue(tx);
      }
    });

    this.form.valueChanges.subscribe(() => this.calculatePreview());
    this.calculatePreview();
  }

  initForm() {
    this.form = this.fb.group({
      title:    ['', [Validators.required, Validators.minLength(2)]],
      amount:   [null, [Validators.required, Validators.min(1)]],
      type:     ['expense', Validators.required],
      category: ['', Validators.required],
      date:     [new Date().toISOString().substring(0, 10)],
      note:     ['']
    });
  }

  calculatePreview() {
    const data = this.service.getTransactions();
    let income  = data.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
    let expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const val   = this.form.value;
    if (val.type === 'income') income  += val.amount || 0;
    else                       expense += val.amount || 0;
    this.previewBalance = income - expense;
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Please fill all required fields correctly.');
      return;
    }

    const tx = {
      id: this.editMode ? this.editId : Date.now(),
      ...this.form.value,
      amount: Number(this.form.value.amount)
    };

    if (this.editMode) {
      this.service.updateTransaction(tx);
      this.toast.success('Transaction updated successfully!');
    } else {
      this.service.addTransaction(tx);
      this.toast.success('Transaction added successfully!');
    }

    this.router.navigate(['/app/transactions']);
  }

  getCategoryIcon(cat: string) { return this.categoryMeta[cat]?.icon ?? '📦'; }
}

