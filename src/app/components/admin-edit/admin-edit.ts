import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminSessionService } from '../../core/services/admin-session.service';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-edit.html',
  styleUrl: './admin-edit.css'
})
export class AdminEdit implements OnInit {

  editMail = '';
  editPassword = '';

  errorMsg = '';
  successMsg = '';
  guardando = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    private router: Router,
    private adminService: AdminService,
    private adminSession: AdminSessionService
  ) {}

  ngOnInit(): void {
    const currentSession = this.adminSession.getSession();
    if (!currentSession) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.editMail = currentSession.mail;
  }

  guardarEdicionPropia(): void {
    this.errorMsg = '';
    this.successMsg = '';
    this.fieldErrors = {};

    const mail = this.editMail.trim().toLowerCase();
    if (!mail || !mail.includes('@')) {
      this.errorMsg = 'Correo inválido';
      return;
    }
    if (!this.editPassword || this.editPassword.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.guardando = true;
    this.adminService.editAdmin(mail, this.editPassword).subscribe({
      next: (response) => {
        this.guardando = false;
        const resolvedMail = `${response?.mail ?? mail}`.trim().toLowerCase();
        this.successMsg = response?.message || 'Administrador actualizado correctamente';

        const session = this.adminSession.getSession();
        if (session) {
          this.adminSession.setSession({
            adminId: session.adminId,
            mail: resolvedMail
          });
        }

        this.editMail = resolvedMail;
        this.editPassword = '';
      },
      error: (err) => {
        this.guardando = false;
        this.fieldErrors = err?.error?.validationErrors ?? {};

        if (this.fieldErrors['mail']) {
          this.errorMsg = this.fieldErrors['mail'];
          return;
        }
        if (this.fieldErrors['password']) {
          this.errorMsg = this.fieldErrors['password'];
          return;
        }

        this.errorMsg = err?.error?.message || 'No se pudo editar el administrador';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }
}