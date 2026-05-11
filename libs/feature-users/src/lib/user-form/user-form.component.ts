import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User, UserService, PhoneType } from '@attus-challenge/data-access-users';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'attus-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserFormComponent>);

  form!: FormGroup;
  phoneTypes: PhoneType[] = ['CELULAR', 'FIXO'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {}

  ngOnInit() {
    this.initForm();
    if (this.data.mode === 'edit' && this.data.user) {
      this.form.patchValue(this.data.user);
    }
  }

  private initForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      phone: ['', [Validators.required]],
      phoneType: ['CELULAR', [Validators.required]],
    });

    // Escuta mudanças no CPF para aplicar máscara simples
    this.form.get('cpf')?.valueChanges.subscribe(value => {
      if (value) {
        const formatted = this.formatCPF(value);
        if (formatted !== value) {
          this.form.get('cpf')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
    // Escuta mudanças no Telefone para aplicar máscara
    this.form.get('phone')?.valueChanges.subscribe(value => {
      if (value) {
        const formatted = this.formatPhone(value);
        if (formatted !== value) {
          this.form.get('phone')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  private formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }

  private formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  onSave() {
    if (this.form.valid) {
      const userData = this.form.value;
      if (this.data.mode === 'create') {
        this.userService.createUser(userData).subscribe((user) => {
          this.dialogRef.close(user);
        });
      } else {
        this.userService.updateUser(this.data.user!.id, userData).subscribe((user) => {
          this.dialogRef.close(user);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('email')) return 'E-mail inválido';
    if (control?.hasError('pattern')) {
      if (controlName === 'cpf') return 'Formato esperado: 000.000.000-00';
    }
    return '';
  }
}
