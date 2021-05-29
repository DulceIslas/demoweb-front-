import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { CustomerService } from 'src/app/services/customer.service';

import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

import Swal from 'sweetalert2';
import {formatDate} from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class CustomerComponent implements OnInit {

  customers: Customer[] = [];
  customer!: Customer;
  columNames: any[] = [];

  showDialog: boolean = false;
  customerEmpty: Customer = {
      idCliente: 0,
      nombre: '',
      curp: '',
      fechanacimiento: '',
      fechaNac: new Date(),
      sexo: 'M'
  }

  constructor(private customerService: CustomerService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.columNames = [
      { field: 'nombre', header: 'Nombre', class: '', classParent: '' },
      { field: 'curp', header: 'CURP', class: '', classParent: 'resizeColDown' },
      { field: 'fechanacimiento', header: 'Fecha de nacimiento', class: 'p-d-none p-d-md-inline-flex', classParent: 'resizeColDown' },
      { field: 'sexo', header: 'Sexo', class: 'p-d-none p-d-md-inline-flex', classParent: 'resizeColDown' }
    ];

    this.getCustomersAll();
  }

  getCustomersAll(){
    this.customerService.getCustomersAll().subscribe((data: Customer[]) => {
      data.forEach((customer: Customer) => {
        customer.fechaNac = new Date(customer.fechaNac);
        customer.fechanacimiento = formatDate(customer.fechaNac, 'dd/MM/yyyy', 'en-US');
      });

      this.customers = data.sort((a, b) => (a.nombre.toUpperCase() > b.nombre.toUpperCase()) ? 1 : -1);
    },(err) => {
      console.log(err);
    });
  }

  openNew(form: NgForm) {
    form.resetForm();
    this.customer = {...this.customerEmpty};
    this.showDialog = true;
  }

  hideDialog() {
    this.showDialog = false;
  }

  editCustomer(customer: Customer) {
    this.customer = { ...customer };
    this.customer.fechaNac = new Date(customer.fechaNac);
    this.customer.fechanacimiento = formatDate(customer.fechaNac, 'dd/MM/yyyy', 'en-US');
    this.showDialog = true;
  }

  deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: '¿Esta seguro de eliminar a ' + customer.nombre + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      acceptButtonStyleClass: 'p-button-primary',
      rejectLabel: 'No',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.showLoading();
        this.customerService.deleteCustomers(customer.idCliente).subscribe((data: Customer) => {
          this.customers = this.customers.filter((val: Customer) => val.idCliente !== data.idCliente);
          this.customer = {...this.customerEmpty};
          this.withSuccess('Cliente eliminado');
        },(err) => {
          this.withError(err, 'Error al eliminar el cliente');
          console.log(err);
        });
      }
    });
  }

  saveOrUpdateCustomer() {
    if(!this.customer.nombre || !this.customer.curp || !this.customer.fechanacimiento || !this.customer.sexo){
      return;
    }
    let intDate: string[] = this.customer.fechanacimiento.split('/');
    this.customer.fechaNac = new Date(Number(intDate[2]), Number(intDate[1]) - 1, Number(intDate[0]));

      if (this.customer.idCliente && this.customer.idCliente > 0) {
        this.updateCustomer(this.customer);
      } else {
        this.createCustomer(this.customer);
      }
  }

  private createCustomer(customer: Customer) {
    this.showLoading();
    this.customerService.createCustomers(customer).subscribe((data: Customer) => {
      this.customers.push(data);
      this.customers = this.customers.sort((a, b) => (a.nombre.toUpperCase() > b.nombre.toUpperCase()) ? 1 : -1);
      this.withSuccess('Cliente creado');
    },(err) => {
      this.withError(err, 'Error al crear ' + customer.nombre);
      console.log(err);
    });
  }

  private updateCustomer(customer: Customer) {
    this.showLoading();
    this.customerService.updateCustomers(customer).subscribe((data: Customer) => {
      this.customers[this.findIndexById(data.idCliente)] = data;
      this.customers = this.customers.sort((a, b) => (a.nombre.toUpperCase() > b.nombre.toUpperCase()) ? 1 : -1);
      this.withSuccess('Cliente actualizado');
    },(err) => {
      this.withError(err, 'Error al actualizar ' + customer.nombre);
      console.log(err);
    });
  }

  private findIndexById(idCliente: number): number {
    let index = -1;
    for (let i = 0; i < this.customers.length; i++) {
      if (this.customers[i].idCliente === idCliente) {
        index = i;
        break;
      }
    }
    return index;
  }

  private withSuccess(message: string){
    Swal.close();
    this.showDialog = false;
    this.customer ={...this.customerEmpty};
    this.showMessage('success', 'Exito', message);
  }

  private withError(err: any, message: string) {
    this.showDialog = false;
    Swal.close();
    let messageError = '';
    if (err.status && err.status == 400) {
      messageError = message;
    } else {
      messageError = 'Error inesperado intente mas tarde';
    }
    this.showMessage('error', 'Error', messageError);
  }

  private showLoading() {
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
  }

  private showMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: 3000 });
  }

}
