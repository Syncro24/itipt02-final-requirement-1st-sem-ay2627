import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent, IonButtons,
  IonBackButton, IonIcon, IonButton, IonFooter, CommonModule, FormsModule]
})
export class ProductPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
