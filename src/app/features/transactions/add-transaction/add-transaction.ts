import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css'
})
export class AddTransaction implements OnInit {

  form!: FormGroup;
  message = '';
  previewBalance = 0;
  monthlyExpense = 0;

  categories = ['Food', 'Travel', 'Shopping', 'Salary', 'Bills', 'Other'];

  constructor(
    private fb: FormBuilder,
    private service: TransactionService
  ) {}

  ngOnInit() {
    this.initForm();
    this.calculateMonthlyExpense();
    this.calculatePreview();
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      type: ['expense', Validators.required],
      category: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });

    this.form.valueChanges.subscribe(() => {
      this.calculatePreview();
    });
  }

  calculatePreview() {
    const data = this.service.getTransactions();

    let income = data.filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    let expense = data.filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const val = this.form.value;

    if (val.type === 'income') income += val.amount || 0;
    else expense += val.amount || 0;

    this.previewBalance = income - expense;
  }

  calculateMonthlyExpense() {
    const data = this.service.getTransactions();
    const currentMonth = new Date().getMonth();

    this.monthlyExpense = data
      .filter(t => new Date(t.date).getMonth() === currentMonth && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const transaction = {
      id: Date.now(),
      ...this.form.value
    };

    this.service.addTransaction(transaction as any);

    this.message = "✅ Transaction Added Successfully!";
    this.form.reset({
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().substring(0, 10)
    });

    this.calculateMonthlyExpense();
    this.calculatePreview();
  }

  get title() { return this.form.get('title'); }
  get amount() { return this.form.get('amount'); }
}